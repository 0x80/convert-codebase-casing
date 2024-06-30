import Runner from "jscodeshift/src/Runner.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { debugLog } from "./debug-log";
import { getFilesToProcess } from "./get-files-to-process";

export async function runCodemod(
  directoryPath: string,
  gitignorePath: string,
  casingType: "kebab" | "snake",
  targetFileExtensions: string[]
) {
  debugLog("Running codemod");
  debugLog("Directory:", directoryPath);
  debugLog("Gitignore path:", gitignorePath);
  debugLog("Casing type:", casingType);
  debugLog("Target file extensions:", targetFileExtensions);

  const inputFiles = await getFilesToProcess(
    directoryPath,
    gitignorePath,
    ["ts", "tsx", "js", "jsx"] // only code here
  );

  debugLog(`Found ${inputFiles.length} files to process`);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const codemodPath = path.resolve(
    __dirname,
    casingType === "kebab"
      ? "./codemods/transform-import-export-kebab.cjs"
      : "./codemods/transform-import-export-snake.cjs"
  );

  debugLog("Codemod path:", codemodPath);

  const result = await Runner.run(codemodPath, inputFiles, {
    parser: "tsx",
    verbose: 2,
    dry: false,
    print: false,
    babel: true,
    extensions: "ts,tsx,js,jsx",
    // extensions: targetFileExtensions.map((ext) => ext.slice(1)).join(","),
    ignorePattern: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/public/**",
    ],
    // ignoreConfig: gitignorePath,
    runInBand: true,
  });

  debugLog("Codemod result:", result);
  return result;
}
