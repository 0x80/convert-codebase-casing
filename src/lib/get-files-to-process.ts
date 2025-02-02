import { globby } from "globby";
import path from "node:path";

/** Make sure these are never touched */
const alwaysIgnorePatterns = [
  "node_modules/",
  ".git/",
  ".github/",
  "package-lock.json",
  "npm-shrinkwrap.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "Gemfile",
  "Gemfile.lock",
  "yarn.lock",
  "package-lock.json",
  "bun.lockb",
  "bunfig.toml",
];

/**
 * Given a directory and additional ignore patterns, returns an array of
 * absolute file paths found only under that directory.
 */
export async function getFilesToProcess(
  directory: string,
  ignorePatterns: string[] = []
): Promise<string[]> {
  /** Convert the provided directory to an absolute path */
  const absoluteDirectory = path.resolve(directory);

  /** Use globby to search for all files in the directory using cwd option */
  const paths = await globby(["**/*"], {
    cwd: absoluteDirectory,
    gitignore: true,
    ignore: [...alwaysIgnorePatterns, ...ignorePatterns],
  });

  return paths;
}
