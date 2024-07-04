import { globby } from "globby";

/** Make sure these are never touched */
const alwaysIgnorePatterns = [
  "node_modules/",
  ".git/",
  ".github/",
  "package-lock.json",
  "npm-shrinkwrap.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
];

export async function getFilesToProcess(
  ignorePatterns: string[] = []
): Promise<string[]> {
  const paths = await globby(["**/*"], {
    gitignore: true,
    ignore: [...alwaysIgnorePatterns, ...ignorePatterns],
  });

  return paths;
}
