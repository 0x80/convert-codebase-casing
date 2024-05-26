#!/usr/bin/env node
import console from "node:console";
import sourceMaps from "source-map-support";
import meow from "meow";
import { transformFiles } from "./lib/transform-files";

sourceMaps.install();

const cli = meow(
  `
  Usage
    $ npx transform-files <directory>

  Options
    --help, -h  Show help text

  Examples
    $ npx transform-files ./src
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

  await transformFiles(directoryPath);
}

run().catch((err) => {
  if (err instanceof Error) {
    console.error(err.stack);
    process.exit(1);
  } else {
    console.error(err);
  }
});
