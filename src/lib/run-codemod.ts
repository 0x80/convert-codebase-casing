import Runner from "jscodeshift/src/Runner.js";
import { listFiles } from "./list-files";
import path from "node:path";
import { fileURLToPath } from "node:url";

export async function runCodemod(directoryPath: string) {
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

  await Runner.run(codemodPath, inputFiles, {
    extensions: "ts,tsx,js,jsx",
    parser: "tsx",
  });
}
