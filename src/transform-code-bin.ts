#!/usr/bin/env node
import console from "node:console";
import sourceMaps from "source-map-support";
import meow from "meow";
import Runner from "jscodeshift/src/Runner.js";
import { listFiles } from "./lib/list-files";
import path from "node:path";
import { fileURLToPath } from "node:url";

sourceMaps.install();

const cli = meow(
  `
  Usage
    $ npx transform-code <directory>

  Options
    --help, -h  Show help text

  Examples
    $ npx transform-code ./src
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

async function run() {
  const directoryPath = cli.input[0];

  if (!directoryPath) {
    console.error("Please specify a directory path.");
    process.exit(1);
  }

  const inputFiles = await listFiles(directoryPath, [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
  ]);

  // Derive the absolute path to the codemod
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const codemodPath = path.resolve(
    __dirname,
    "./codemods/transform-import-export.cjs"
  );

  await Runner.run(codemodPath, inputFiles, {});
}

run().catch((err) => {
  if (err instanceof Error) {
    console.error(err.stack);
    process.exit(1);
  } else {
    console.error(err);
  }
});
