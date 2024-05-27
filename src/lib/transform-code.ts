import Runner from "jscodeshift/src/Runner.js";
import { listFiles } from "./list-files";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { commitChanges } from "./commit-changes";

export async function transformCode(directoryPath: string) {
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

  await commitChanges("Transform import and export paths");
}
