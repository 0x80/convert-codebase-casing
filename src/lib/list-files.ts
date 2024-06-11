import fs from "fs";
import path from "path";
import { ignoredDirectories } from "./config";

/**
 * Recursively gets all files in a directory that match the given extensions.
 *
 * @param dirPath - The directory path to search.
 * @param extensions - The list of file extensions to match.
 * @returns A list of file paths that match the given extensions.
 */
export function listFiles(dirPath: string, extensions: string[]): string[] {
  const arrayOfFiles: string[] = [];

  function getAllFiles(dirPath: string) {
    if (ignoredDirectories.has(dirPath)) {
      return;
    }

    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        getAllFiles(fullPath);
      } else {
        if (extensions.some((ext) => fullPath.endsWith(ext))) {
          arrayOfFiles.push(fullPath);
        }
      }
    });
  }

  getAllFiles(dirPath);
  return arrayOfFiles;
}
