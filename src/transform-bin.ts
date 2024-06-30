#!/usr/bin/env node
import console from "node:console";
import sourceMaps from "source-map-support";
import meow from "meow";
import fs from "fs-extra";
import path from "path";
import { getCasingTransform } from "./lib/get-casing-transform";
import { commitChanges } from "./lib/commit-changes";
import { renameFilesAndFolders } from "./lib/transform-files";

sourceMaps.install();

const cli = meow(
  `
  Usage
    $ npx transform-codebase-casing <directory>

  Options
    --help, -h     Show help text
    --debug, -d    Enable debug logging

  Examples
    $ npx transform-codebase-casing ./src
    $ npx transform-codebase-casing ./src --debug
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
      },
    },
  }
);

// Create a debug logging function
const debugLog = cli.flags.debug
  ? (...args: any[]) => console.log("[DEBUG]", ...args)
  : () => {};

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

  const transformType = "kebab";

  const transformFn = getCasingTransform(transformType);

  debugLog("Starting rename phase 1/2");
  console.log("Rename phase 1/2...");
  await renameFilesAndFolders(
    directoryPath,
    gitignorePath,
    "phase1",
    transformFn,
    debugLog
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
    debugLog
  );

  debugLog("Committing changes for phase 2");
  console.log("Commit changes");
  await commitChanges("Rename files and folders phase 2/2");

  // console.log("Transform import and export paths...");

  // await runCodemod(directoryPath, transformType);

  // await commitChanges("Transform import and export paths");
  // console.log("🦄");
}

run().catch((err) => {
  if (err instanceof Error) {
    console.error(err.stack);
    process.exit(1);
  } else {
    console.error(err);
  }
});
