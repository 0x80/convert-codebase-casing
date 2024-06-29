import fs from "fs-extra";
import path from "path";
import { ignoredDirectories, targetFileExtensions } from "./config";

const tempSuffix = "__tmp";

function isIgnoredPath(itemPath: string): boolean {
  const basename = path.basename(itemPath);

  return (
    ignoredDirectories.has(basename) ||
    Array.from(ignoredDirectories).some(
      (dir) =>
        itemPath.includes(`${path.sep}${dir}${path.sep}`) ||
        itemPath.endsWith(`${path.sep}${dir}`)
    )
  );
}

function shouldPreserveName(name: string): boolean {
  return name.startsWith("[");
}

function renamePathSegment(
  segment: string,
  convertFn: (str: string) => string,
  phase: "phase1" | "phase2"
): string {
  if (shouldPreserveName(segment)) {
    return segment;
  }

  if (phase === "phase1") {
    const transformed = convertFn(segment);
    return /[A-Z]/.test(segment)
      ? transformed.toLowerCase() === segment.toLowerCase()
        ? transformed + tempSuffix
        : transformed
      : segment;
  } else if (phase === "phase2") {
    return segment.endsWith(tempSuffix)
      ? segment.slice(0, -tempSuffix.length)
      : segment;
  }

  return segment;
}

export async function renameFilesAndFolders(
  directoryPath: string,
  phase: "phase1" | "phase2",
  convertFn: (str: string) => string
) {
  console.log(`\n--- Starting renameFilesAndFolders ---`);
  console.log(`Phase: ${phase}`);
  console.log(`Directory: ${directoryPath}`);

  if (isIgnoredPath(directoryPath)) {
    console.log(`Ignoring path: ${directoryPath}`);
    return;
  }

  console.log(`Processing path: ${directoryPath}`);

  // Collect all directories to rename them later
  const directoriesToRename: string[] = [];

  // First pass: Rename all files and collect directories
  console.log("Starting file renaming and directory collection...");
  await renameFiles(directoryPath, phase, convertFn, directoriesToRename);
  console.log(`Collected ${directoriesToRename.length} directories to rename.`);

  // Second pass: Rename all collected directories
  console.log("\nStarting directory renaming...");
  for (const [index, dir] of directoriesToRename.reverse().entries()) {
    console.log(
      `\nProcessing directory ${index + 1}/${directoriesToRename.length}: ${dir}`
    );

    if (!(await fs.pathExists(dir))) {
      console.log(`  Skipping non-existent directory: ${dir}`);
      continue;
    }

    const newDirName = renamePathSegment(path.basename(dir), convertFn, phase);
    const newDirPath = path.join(path.dirname(dir), newDirName);

    if (newDirPath !== dir) {
      try {
        console.log(`  Attempting to rename: ${dir} -> ${newDirPath}`);
        await fs.ensureDir(path.dirname(newDirPath));
        await fs.rename(dir, newDirPath);
        console.log(
          `  Successfully renamed directory: ${dir} -> ${newDirPath}`
        );
      } catch (error) {
        console.error(
          `  Error renaming directory: ${dir} -> ${newDirPath}`,
          error
        );
      }
    } else {
      console.log(`  No renaming needed for: ${dir}`);
    }
  }
  console.log("Directory renaming completed.");
}

async function renameFiles(
  directoryPath: string,
  phase: "phase1" | "phase2",
  convertFn: (str: string) => string,
  directoriesToRename: string[]
) {
  console.log(`\nEntering directory: ${directoryPath}`);
  let items;
  try {
    items = await fs.readdir(directoryPath);
    console.log(`  Found ${items.length} items in directory.`);
  } catch (error) {
    console.error(`  Error reading directory: ${directoryPath}`, error);
    return;
  }

  for (const item of items) {
    const itemPath = path.join(directoryPath, item);

    if (isIgnoredPath(itemPath)) {
      console.log(`  Ignoring: ${itemPath}`);
      continue;
    }

    let stat;
    try {
      stat = await fs.stat(itemPath);
    } catch (error) {
      console.error(`  Error getting stats for: ${itemPath}`, error);
      continue;
    }

    if (stat.isDirectory()) {
      console.log(`  Adding directory to rename list: ${itemPath}`);
      directoriesToRename.push(itemPath);
      await renameFiles(itemPath, phase, convertFn, directoriesToRename);
    } else if (targetFileExtensions.some((ext) => item.endsWith(ext))) {
      console.log(`  Processing file: ${itemPath}`);
      if (phase === "phase1") {
        await renameFilePhase1(itemPath, convertFn);
      } else if (phase === "phase2") {
        await renameFilePhase2(itemPath);
      }
    }
  }
  console.log(`Exiting directory: ${directoryPath}`);
}

async function renameFilePhase1(
  filePath: string,
  convertFn: (str: string) => string
) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);

  if (shouldPreserveName(baseName)) {
    return;
  }

  if (/[A-Z]/.test(baseName)) {
    const newFileName = convertFn(baseName) + ext;
    const caseInsensitiveNewFileName = newFileName.toLowerCase();

    if (
      baseName.toLowerCase() === caseInsensitiveNewFileName.replace(ext, "")
    ) {
      const newFilePath = path.join(
        dir,
        convertFn(baseName) + tempSuffix + ext
      );
      await moveFile(filePath, newFilePath);
    } else {
      const newFilePath = path.join(dir, newFileName);
      await moveFile(filePath, newFilePath);
    }
  }
}

async function renameFilePhase2(filePath: string) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);

  if (baseName.endsWith(tempSuffix)) {
    const newFileName = baseName.slice(0, -tempSuffix.length) + ext;
    const newFilePath = path.join(dir, newFileName);
    await moveFile(filePath, newFilePath);
  }
}

async function moveFile(oldPath: string, newPath: string) {
  await fs.ensureDir(path.dirname(newPath));
  await fs.move(oldPath, newPath, { overwrite: false });
}
