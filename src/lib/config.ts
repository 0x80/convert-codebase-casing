export const targetFileExtensions = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".css",
  ".scss",
  ".json",
];

/** All prefixes that would be considered imports from local files. */
export const targetPathPrefixes = ["./", "../", "~/", "@/", "@src/", "#"];

export const ignoredDirectories = new Set([".git"]);
