import fs from "fs-extra";
import path from "node:path";
import { logger } from "./logger";

/** Get patterns from .gitignore file in either CWD or specified directory */
export async function getGitignorePatterns(
  directoryPath: string
): Promise<string[]> {
  const cwdGitignorePath = path.join(process.cwd(), ".gitignore");
  const directoryGitignorePath = path.join(directoryPath, ".gitignore");
  let gitignorePath: string;

  if (await fs.pathExists(cwdGitignorePath)) {
    gitignorePath = cwdGitignorePath;
    /** .gitignore found in current working directory */
  } else if (await fs.pathExists(directoryGitignorePath)) {
    gitignorePath = directoryGitignorePath;
    /** .gitignore found in the specified directory */
  } else {
    logger.info(
      ".gitignore file not found in both CWD and specified directory."
    );
    return [];
  }

  return fs
    .readFileSync(gitignorePath, "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}
