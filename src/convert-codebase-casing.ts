#!/usr/bin/env node
import console from "node:console";
import sourceMaps from "source-map-support";
import meow from "meow";
import fs from "fs-extra";
import path from "path";
import { getCasingFunction } from "./lib/get-casing-function";
import { commitChanges } from "./lib/commit-changes";
import { renameFilesAndFolders } from "./lib/convert-files";
import { targetFileExtensions as defaultTargetFileExtensions } from "./lib/config";
import { setDebugMode, debugLog } from "./lib/debug-log";
import { runCodemod } from "./lib/run-codemod";

sourceMaps.install();

const cli = meow(
  `
  Usage
    $ npx convert-codebase-casing <directory>

  Options
    --help, -h             Show help text
    --debug, -d            Enable debug logging
    --extensions, -e       Comma-separated list of file extensions to process (overrides default)
    --casing, -c           Casing type: 'kebab' or 'snake' (default: 'kebab')

  Examples
    $ npx convert-codebase-casing ./src
    $ npx convert-codebase-casing ./src --debug
    $ npx convert-codebase-casing ./src --extensions .js,.ts,.tsx
    $ npx convert-codebase-casing ./src --casing snake
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
      casing: {
        type: "string",
        shortFlag: "c",
        default: "kebab",
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

  const casingType = cli.flags.casing;

  if (casingType !== "kebab" && casingType !== "snake") {
    console.error("Error: Invalid casing type. Use 'kebab' or 'snake'.");
    process.exit(1);
  }

  const casingFn = getCasingFunction(casingType);

  debugLog("Starting rename phase 1/2");
  console.log("Rename phase 1/2...");
  await renameFilesAndFolders(
    directoryPath,
    gitignorePath,
    "phase1",
    casingFn,
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
    casingFn,
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
    casingType,
    targetFileExtensions
  );

  debugLog("Committing changes for import/export updates");
  console.log("Commit changes");
  await commitChanges("Update import and export statements");

  console.log("Conversion complete!");
}

run().catch((err) => {
  if (err instanceof Error) {
    console.error(err.stack);
    process.exit(1);
  } else {
    console.error(err);
  }
});
