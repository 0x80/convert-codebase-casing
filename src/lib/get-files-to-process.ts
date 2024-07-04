import fs from "fs-extra";
import { glob } from "glob";
import parseGitignore from "parse-gitignore";
import { logger } from "./logger";

/** Make sure these are never touched */
const alwaysIgnorePatterns = [
  "node_modules/",
  ".git/",
  "package-lock.json",
  "npm-shrinkwrap.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
];

export async function getFilesToProcess(
  directoryPath: string,
  gitignorePath: string,
  fileExtensions?: string[]
): Promise<string[]> {
  const gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
  const ignoredPatterns = parseGitignore(gitignoreContent);

  /**
   * Convert gitignore patterns to glob-compatible patterns. In gitignore a name
   * is treated both for files and folder. For glob we need to add a slash at
   * the end and ** to make it target nested folders.
   */
  const globIgnorePatterns = [
    ...alwaysIgnorePatterns,
    ...ignoredPatterns.patterns,
  ].flatMap((pattern) => {
    // Remove leading slash if present
    pattern = pattern.replace(/^\//, "");

    const patterns = [pattern]; // Keep the original pattern

    if (!pattern.startsWith("**") && !pattern.endsWith("/")) {
      patterns.push(`**/${pattern}/**`);
    }

    if (pattern.endsWith("/")) {
      patterns.push(`**/${pattern}**`); // Add version with ** appended for directories
    }

    return patterns;
  });

  // Create glob patterns based on file extensions if provided, otherwise match all files
  const globPatterns =
    fileExtensions && fileExtensions.length > 0
      ? fileExtensions.map((ext) => `**/*.${ext}`)
      : ["**/*"];

  logger.debug("Glob patterns:", globPatterns);
  logger.debug("Ignored patterns:", globIgnorePatterns);

  process.exit(0);

  // Use glob to find all files, respecting .gitignore
  const files = await glob(globPatterns, {
    cwd: directoryPath,
    ignore: globIgnorePatterns,
    absolute: true,
    nodir: true,
    dot: true, // Include hidden files
  });

  return files;
}
