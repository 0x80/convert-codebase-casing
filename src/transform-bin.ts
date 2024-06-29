#!/usr/bin/env node
import console from "node:console";
import sourceMaps from "source-map-support";
import meow from "meow";
import { getCasingTransform } from "./lib/get-casing-transform";
import { renameFilesAndFolders } from "./lib/transform-files";
import { commitChanges } from "./lib/commit-changes";

sourceMaps.install();

const cli = meow(
  `
  Usage
    $ npx transform-codebase-casing <directory>

  Options
    --help, -h  Show help text

  Examples
    $ npx transform-codebase-casing ./src
`,
  {
    importMeta: import.meta,
    flags: {
      help: {
        type: "boolean",
        shortFlag: "h",
      },
    },
  }
);

/**
 * Run everything and commit changes to Git.
 *
 * @todo Provide a granular approach where the user can control their own
 *   commits, and allowing for different versioning systems.
 */
async function run() {
  const directoryPath = cli.input[0];

  if (!directoryPath) {
    console.error("Please specify a directory path.");
    process.exit(1);
  }

  const transformType = "kebab";

  const transformFn = getCasingTransform(transformType);

  // console.log("Rename phase 1/2...");
  // await renameFilesAndFolders(directoryPath, "phase1", transformFn);

  // console.log("Commit changes");
  // await commitChanges("Rename files and folders phase 1/2");

  console.log("Rename phase 2/2...");
  await renameFilesAndFolders(directoryPath, "phase2", transformFn);

  console.log("Commit changes");
  await commitChanges("Rename files and folders phase 2/2");

  // console.log("Transform import and export paths...");

  // await runCodemod(directoryPath, transformType);

  // await commitChanges("Commit changes");
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
