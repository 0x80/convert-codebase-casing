import fs from "fs-extra";
import path from "path";
import { ignoredDirectories, targetFileExtensions } from "./config";

const tempSuffix = "__tmp";

async function ensureAndRename(oldPath: string, newPath: string) {
  await fs.ensureDir(path.dirname(newPath));
  await fs.rename(oldPath, newPath);
}

async function removeEmptyFolders(dirPath: string) {
  const items = await fs.readdir(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    if ((await fs.stat(fullPath)).isDirectory()) {
      await removeEmptyFolders(fullPath);
    }
  }
  const updatedItems = await fs.readdir(dirPath);
  if (updatedItems.length === 0) {
    await fs.rmdir(dirPath);
  }
}

function isIgnoredPath(itemPath: string): boolean {
  const basename = path.basename(itemPath);

  // if(basename === "."
  // // Ignore any file or directory that starts with a dot
  // if (basename.startsWith(".")) {
  //   return true;
  // }

  return (
    ignoredDirectories.has(basename) ||
    Array.from(ignoredDirectories).some(
      (dir) =>
        itemPath.includes(`${path.sep}${dir}${path.sep}`) ||
        itemPath.endsWith(`${path.sep}${dir}`)
    )
  );
}

/**
 * Recursively renames files and folders in the specified directory based on the
 * phase.
 *
 * @param directoryPath - The path of the directory to process.
 * @param phase - The phase of renaming ('phase1' or 'phase2').
 * @param transformFn - The transformation function to apply to each segment.
 */
export async function renameFilesAndFolders(
  directoryPath: string,
  phase: "phase1" | "phase2",
  transformFn: (str: string) => string
) {
  if (isIgnoredPath(directoryPath)) {
    console.log(`Ignoring path: ${directoryPath}`);
    return;
  }

  console.log(`Processing path: ${directoryPath}`);

  const items = await fs.readdir(directoryPath);

  for (const item of items) {
    const itemPath = path.join(directoryPath, item);

    if (isIgnoredPath(itemPath)) {
      continue;
    }

    const stat = await fs.stat(itemPath);

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

  if (phase === "phase2") {
    await removeEmptyFolders(directoryPath);
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

  if (shouldPreserveName(baseName)) {
    return;
  }

  if (/[A-Z]/.test(baseName)) {
    const newFileName = transformFn(baseName) + ext;
    const caseInsensitiveNewFileName = newFileName.toLowerCase();

    if (
      baseName.toLowerCase() === caseInsensitiveNewFileName.replace(ext, "")
    ) {
      const newFilePath = path.join(
        dir,
        transformFn(baseName) + tempSuffix + ext
      );
      await ensureAndRename(filePath, newFilePath);
    } else {
      const newFilePath = path.join(dir, newFileName);
      await ensureAndRename(filePath, newFilePath);
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
    const newFilePath = path.join(dir, newFileName);
    await ensureAndRename(filePath, newFilePath);
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
    if (shouldPreserveName(segment)) {
      return segment;
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
    try {
      await fs.move(folderPath, newFolderPath, { overwrite: true });
    } catch (error) {
      console.error(
        `Error renaming folder ${folderPath} to ${newFolderPath}:`,
        error
      );
      // If move fails, try to rename the folder itself without moving contents
      const parentDir = path.dirname(folderPath);
      const newFolderName = path.basename(newFolderPath);
      const tempPath = path.join(parentDir, newFolderName);
      await fs.rename(folderPath, tempPath);
    }
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
    await ensureAndRename(folderPath, newFolderPath);
  }
}

function removeSuffix(baseName: string) {
  if (baseName.endsWith(tempSuffix)) {
    return baseName.slice(0, -tempSuffix.length);
  }
  return baseName;
}

function shouldPreserveName(name: string): boolean {
  return name.startsWith("[");
}
