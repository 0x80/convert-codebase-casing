#!/usr/bin/env node
import console from "node:console";
import sourceMaps from "source-map-support";
import meow from "meow";
import fs from "fs-extra";
import path from "path";
import { getCasingTransform } from "./lib/get-casing-transform";
import { commitChanges } from "./lib/commit-changes";
import { renameFilesAndFolders } from "./lib/transform-files";
import { targetFileExtensions as defaultTargetFileExtensions } from "./lib/config";
import { setDebugMode, debugLog } from "./lib/debug-log";
import { runCodemod } from "./lib/run-codemod";

sourceMaps.install();

const cli = meow(
  `
  Usage
    $ npx transform-codebase-casing <directory>

  Options
    --help, -h             Show help text
    --debug, -d            Enable debug logging
    --extensions, -e       Comma-separated list of file extensions to process (overrides default)

  Examples
    $ npx transform-codebase-casing ./src
    $ npx transform-codebase-casing ./src --debug
    $ npx transform-codebase-casing ./src --extensions .js,.ts,.tsx
`,
  {
    importMeta: import.meta,
    flags: {
      help: {
        type: "boolean",
        shortFlag: "h",
      },
      debug: {
        type: "boolean",
        shortFlag: "d",
        default: false,
      },
      extensions: {
        type: "string",
        shortFlag: "e",
        default: defaultTargetFileExtensions.join(","),
      },
    },
  }
);

// Set debug mode based on the flag
setDebugMode(cli.flags.debug);

async function run() {
  const directoryPath = cli.input[0];

  if (!directoryPath) {
    console.error("Please specify a directory path.");
    process.exit(1);
  }

  const gitignorePath = path.join(directoryPath, ".gitignore");

  // Check if .gitignore exists
  if (!(await fs.pathExists(gitignorePath))) {
    console.error(`Error: .gitignore file not found at ${gitignorePath}`);
    console.error(
      "A .gitignore file is required to determine which files to process."
    );
    process.exit(1);
  }

  // Parse and validate the extensions flag
  const targetFileExtensions = cli.flags.extensions
    .split(",")
    .map((ext) => ext.trim())
    .filter((ext) => ext.startsWith("."));

  if (targetFileExtensions.length === 0) {
    console.error(
      "Error: Invalid file extensions provided. Extensions must start with a dot (.)"
    );
    process.exit(1);
  }

  debugLog("Target file extensions:", targetFileExtensions);

  const transformType = "kebab";

  const transformFn = getCasingTransform(transformType);

  debugLog("Starting rename phase 1/2");
  console.log("Rename phase 1/2...");
  await renameFilesAndFolders(
    directoryPath,
    gitignorePath,
    "phase1",
    transformFn,
    targetFileExtensions
  );

  debugLog("Committing changes for phase 1");
  console.log("Commit changes");
  await commitChanges("Rename files and folders phase 1/2");

  debugLog("Starting rename phase 2/2");
  console.log("Rename phase 2/2...");
  await renameFilesAndFolders(
    directoryPath,
    gitignorePath,
    "phase2",
    transformFn,
    targetFileExtensions
  );

  debugLog("Committing changes for phase 2");
  console.log("Commit changes");
  await commitChanges("Rename files and folders phase 2/2");

  debugLog("Running codemod to update import/export statements");
  console.log("Updating import and export statements...");
  await runCodemod(
    directoryPath,
    gitignorePath,
    transformType,
    targetFileExtensions
  );

  debugLog("Committing changes for import/export updates");
  console.log("Commit changes");
  await commitChanges("Update import and export statements");

  console.log("Transformation complete!");
}

run().catch((err) => {
  if (err instanceof Error) {
    console.error(err.stack);
    process.exit(1);
  } else {
    console.error(err);
  }
});
