#!/usr/bin/env node
import sourceMaps from "source-map-support";
import meow from "meow";
import fs from "fs-extra";
import path from "path";
import { getCasingFunction } from "./lib/get-casing-function";
import { commitChanges } from "./lib/commit-changes";
import { renameFilesAndFolders } from "./lib/convert-files";
import { logger } from "./lib/logger";
import { runCodemod } from "./lib/run-codemod";
import { getFilesToProcess } from "./lib/get-files-to-process";

sourceMaps.install();

const cli = meow(
  `
  Usage
    $ npx convert-codebase-casing <directory>

  Options
    --help, -h             Show help text
    --log-level, -l        Log level: 'error', 'warn', 'info', or 'debug' (default: 'info')
    --casing, -c           Casing type: 'kebab' or 'snake' (default: 'kebab')

  Examples
    $ npx convert-codebase-casing ./src
    $ npx convert-codebase-casing ./src --casing snake
    $ npx convert-codebase-casing ./src --log-level debug
`,
  {
    importMeta: import.meta,
    flags: {
      help: {
        type: "boolean",
        shortFlag: "h",
      },
      casing: {
        type: "string",
        shortFlag: "c",
        choices: ["kebab", "snake"],
        default: "kebab",
      },
      logLevel: {
        type: "string",
        shortFlag: "l",
        default: "info",
      },
    },
  }
);

// Set the log level based on the CLI option
logger.setLevel(cli.flags.logLevel as "error" | "warn" | "info" | "debug");

async function run() {
  const directoryPath = cli.input[0];

  if (!directoryPath) {
    logger.error("Please specify a directory path.");
    process.exit(1);
  }

  const gitignorePath = path.join(directoryPath, ".gitignore");

  // Check if .gitignore exists
  if (!(await fs.pathExists(gitignorePath))) {
    logger.error(`Error: .gitignore file not found at ${gitignorePath}`);
    logger.error(
      "A .gitignore file is required to determine which files to process."
    );
    process.exit(1);
  }

  const casingType = cli.flags.casing;

  if (casingType !== "kebab" && casingType !== "snake") {
    logger.error("Error: Invalid casing type. Use 'kebab' or 'snake'.");
    process.exit(1);
  }

  const ignorePatterns: string[] = [];

  const casingFn = getCasingFunction(casingType);

  {
    logger.info("Rename phase 1/2...");
    const filePaths = await getFilesToProcess(ignorePatterns);
    logger.info(`Found ${filePaths.length} files to process`);

    await renameFilesAndFolders(directoryPath, filePaths, "phase1", casingFn);

    logger.info("Commit changes");
    await commitChanges("Rename files and folders phase 1/2");
  }

  {
    logger.info("Rename phase 2/2...");
    const filePaths = await getFilesToProcess(ignorePatterns);
    logger.info(`Found ${filePaths.length} files to process`);

    await renameFilesAndFolders(directoryPath, filePaths, "phase2", casingFn);

    logger.info("Commit changes");
    await commitChanges("Rename files and folders phase 2/2");
  }

  {
    logger.info("Running codemod to update import/export statements");

    const filePaths = await getFilesToProcess(ignorePatterns);

    await runCodemod(filePaths, casingType as "kebab" | "snake");

    logger.info("Commit changes");
    await commitChanges("Update import and export statements");
  }

  logger.info("Conversion completed!");
}

run().catch((err) => {
  logger.error(err);
  process.exit(1);
});
