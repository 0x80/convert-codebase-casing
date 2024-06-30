import fs from "fs-extra";
import { glob } from "glob";
import parseGitignore from "parse-gitignore";
import { debugLog } from "./debug-log";

export async function getFilesToProcess(
  directoryPath: string,
  gitignorePath: string,
  targetFileExtensions: string[]
): Promise<string[]> {
  // Read and parse .gitignore
  const gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
  const ignoredPatterns = parseGitignore(gitignoreContent);

  // Create glob patterns for target file extensions
  const globPatterns = targetFileExtensions.map((ext) => `**/*${ext}`);

  debugLog("Glob patterns:", globPatterns);
  debugLog("Ignored patterns:", ignoredPatterns);

  // Use glob to find files, respecting .gitignore
  const files = await glob(globPatterns, {
    cwd: directoryPath,
    ignore: ignoredPatterns,
    absolute: true,
    nodir: true,
  });

  return files;
}
