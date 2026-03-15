import Runner from "jscodeshift/src/Runner.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "./logger";

export async function runCodemod(
  filePaths: string[],
  casingType: "kebab" | "snake",
) {
  logger.debug("Running codemod");

  const codeExtensions = ["ts", "tsx", "js", "jsx", "mjs", "cjs"];

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const codemodPath = path.resolve(
    __dirname,
    "./codemods/convert-import-export.mjs",
  );

  logger.debug("Codemod path:", codemodPath);

  const result = await Runner.run(codemodPath, filePaths, {
    parser: "tsx",
    extensions: codeExtensions.join(","),
    runInBand: true,
    casingType,
  });

  return result;
}
