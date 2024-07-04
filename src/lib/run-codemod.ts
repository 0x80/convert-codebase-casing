import Runner from "jscodeshift/src/Runner.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getFilesToProcess } from "./get-files-to-process";
import { logger } from "./logger";

export async function runCodemod(
  directoryPath: string,
  gitignorePath: string,
  casingType: "kebab" | "snake"
) {
  logger.debug("Running codemod");
  logger.debug("Directory:", directoryPath);
  logger.debug("Gitignore path:", gitignorePath);
  logger.debug("Casing type:", casingType);

  const codeExtensions = ["ts", "tsx", "js", "jsx", "mjs", "cjs"];

  const inputFiles = await getFilesToProcess(
    directoryPath,
    gitignorePath,
    codeExtensions
  );

  logger.debug(`Found ${inputFiles.length} files to process`);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const codemodPath = path.resolve(
    __dirname,
    casingType === "kebab"
      ? "./codemods/convert-import-export-kebab.cjs"
      : "./codemods/convert-import-export-snake.cjs"
  );

  logger.debug("Codemod path:", codemodPath);

  const result = await Runner.run(codemodPath, inputFiles, {
    parser: "tsx",
    // verbose: 1,
    // babel: true,
    extensions: codeExtensions.join(","),
    runInBand: true,
  });

  return result;
}
