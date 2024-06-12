export const targetFileExtensions = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".css",
  ".scss",
  ".json",
];

export const targetPathPrefixes = ["./", "../", "~/", "@/", "@src/"];

/** @todo Get from gitignore */
export const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".vscode",
  "node_modules",
  "dist",
]);
