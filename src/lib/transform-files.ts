import fs from "fs-extra";
import path from "path";
import { ignoredDirectories, targetFileExtensions } from "./config";

const tempSuffix = "__tmp";

/**
 * Recursively renames files and folders in the specified directory based on the
 * phase.
 *
 * @param directoryPath - The path of the directory to process.
 * @param phase - The phase of renaming ('phase1' or 'phase2').
 */
export async function renameFilesAndFolders(
  directoryPath: string,
  phase: "phase1" | "phase2",
  transformFn: (str: string) => string
) {
  const items = await fs.readdir(directoryPath);

  for (const item of items) {
    const itemPath = path.join(directoryPath, item);
    const stat = await fs.stat(itemPath);

    if (ignoredDirectories.has(itemPath)) {
      continue;
    }

    if (stat.isDirectory()) {
      await renameFilesAndFolders(itemPath, phase, transformFn);
      if (phase === "phase1") {
        await renameFolderPhase1(itemPath, transformFn);
      } else if (phase === "phase2") {
        await renameFolderPhase2(itemPath);
      }
    } else if (targetFileExtensions.some((ext) => item.endsWith(ext))) {
      if (phase === "phase1") {
        await renameFilePhase1(itemPath, transformFn);
      } else if (phase === "phase2") {
        await renameFilePhase2(itemPath);
      }
    }
  }
}

/**
 * Renames a file to kebab-case and adds an underscore suffix if necessary.
 *
 * @param filePath - The path of the file to rename.
 */
async function renameFilePhase1(
  filePath: string,
  transformFn: (str: string) => string
) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);

  if (/[A-Z]/.test(baseName)) {
    const newFileName = transformFn(baseName) + ext;
    const caseInsensitiveNewFileName = newFileName.toLowerCase();

    console.log(newFileName);

    if (
      baseName.toLowerCase() === caseInsensitiveNewFileName.replace(ext, "")
    ) {
      const newFilePath = path.join(
        dir,
        transformFn(baseName) + tempSuffix + ext
      );
      await fs.rename(filePath, newFilePath);
    } else {
      const newFilePath = path.join(dir, newFileName);
      await fs.rename(filePath, newFilePath);
    }
  }
}

/**
 * Removes the underscore suffix from a file name.
 *
 * @param filePath - The path of the file to rename.
 */
async function renameFilePhase2(filePath: string) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);

  if (baseName.endsWith(tempSuffix)) {
    const newFileName = removeSuffix(baseName) + ext;
    console.log(newFileName);

    const newFilePath = path.join(dir, newFileName);
    await fs.rename(filePath, newFilePath);
  }
}

/**
 * Renames a folder by segment to kebab-case and adds an underscore suffix if
 * necessary, keeping original names for segments starting with `[`.
 *
 * @param folderPath - The path of the folder to rename.
 * @param transformFn - The transformation function to apply to each segment.
 */
async function renameFolderPhase1(
  folderPath: string,
  transformFn: (str: string) => string
) {
  const segments = folderPath.split(path.sep);
  const transformedSegments = segments.map((segment) => {
    if (segment.startsWith("[")) {
      console.log("preserve segment", segment);
      return segment; // Keep original for segments starting with `[`
    }

    const transformed = transformFn(segment);
    return /[A-Z]/.test(segment)
      ? transformed.toLowerCase() === segment.toLowerCase()
        ? transformed + tempSuffix
        : transformed
      : segment;
  });

  const newFolderPath = path.join(...transformedSegments);

  if (newFolderPath !== folderPath) {
    await fs.rename(folderPath, newFolderPath);
  }
}

/**
 * Removes the underscore suffix from a folder name.
 *
 * @param folderPath - The path of the folder to rename.
 */
async function renameFolderPhase2(folderPath: string) {
  const dir = path.dirname(folderPath);
  const baseName = path.basename(folderPath);

  if (baseName.endsWith(tempSuffix)) {
    const newFolderPath = path.join(dir, removeSuffix(baseName));
    await fs.rename(folderPath, newFolderPath);
  }
}

function removeSuffix(baseName: string) {
  if (baseName.endsWith(tempSuffix)) {
    return baseName.slice(0, -tempSuffix.length);
  }
  return baseName;
}
