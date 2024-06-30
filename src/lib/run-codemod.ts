import Runner from "jscodeshift/src/Runner.js";
import { listFiles } from "./list-files";
import path from "node:path";
import { fileURLToPath } from "node:url";

export async function runCodemod(
  directoryPath: string,
  casingType: "kebab" | "snake"
) {
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
    casingType === "kebab"
      ? "./codemods/transform-import-export-kebab.cjs"
      : "./codemods/transform-import-export-snake.cjs"
  );

  await Runner.run(codemodPath, inputFiles, {
    extensions: "ts,tsx,js,jsx",
    parser: "tsx",
    // ignoreConfig: [".gitignore"],
    ignorePattern: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/public/**",
    ],
    // dry: true,
    // runInBand: true,
  });
}
