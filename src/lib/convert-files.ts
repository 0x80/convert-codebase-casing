import fs from "fs-extra";
import path from "path";
import { debugLog } from "./debug-log";
import { getFilesToProcess } from "./get-files-to-process";

const tempSuffix = "__tmp";

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
    const converted = convertFn(segment);
    return /[A-Z]/.test(segment)
      ? converted.toLowerCase() === segment.toLowerCase()
        ? converted + tempSuffix
        : converted
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
  gitignorePath: string,
  phase: "phase1" | "phase2",
  convertFn: (str: string) => string,
  targetFileExtensions: string[]
) {
  debugLog(
    `Starting renameFilesAndFolders - Phase: ${phase}, Directory: ${directoryPath}`
  );
  debugLog(`Target file extensions: ${targetFileExtensions.join(", ")}`);

  const filesToProcess = await getFilesToProcess(
    directoryPath,
    gitignorePath,
    targetFileExtensions
  );
  debugLog(`Found ${filesToProcess.length} files to process`);

  // Collect all directories to rename them later
  const directoriesToRename = new Set<string>();

  // First pass: Rename all files and collect directories
  debugLog("Starting file renaming and directory collection...");
  for (const filePath of filesToProcess) {
    await renameFile(filePath, phase, convertFn);
    const dir = path.dirname(filePath);
    directoriesToRename.add(dir);
  }

  debugLog(`Collected ${directoriesToRename.size} directories to rename.`);

  // Second pass: Rename all collected directories (bottom-up)
  debugLog("Starting directory renaming...");
  const sortedDirs = Array.from(directoriesToRename).sort(
    (a, b) => b.length - a.length
  );
  for (const [index, dir] of sortedDirs.entries()) {
    debugLog(`Processing directory ${index + 1}/${sortedDirs.length}: ${dir}`);

    if (!(await fs.pathExists(dir))) {
      debugLog(`Skipping non-existent directory: ${dir}`);
      continue;
    }

    const newDirName = renamePathSegment(path.basename(dir), convertFn, phase);
    const newDirPath = path.join(path.dirname(dir), newDirName);

    if (newDirPath !== dir) {
      try {
        debugLog(`Attempting to rename: ${dir} -> ${newDirPath}`);
        await fs.ensureDir(path.dirname(newDirPath));
        await fs.rename(dir, newDirPath);
        debugLog(`Successfully renamed directory: ${dir} -> ${newDirPath}`);
      } catch (error) {
        console.error(
          `Error renaming directory: ${dir} -> ${newDirPath}`,
          error
        );
      }
    } else {
      debugLog(`No renaming needed for: ${dir}`);
    }
  }
  debugLog("Directory renaming completed.");
}

async function renameFile(
  filePath: string,
  phase: "phase1" | "phase2",
  convertFn: (str: string) => string
) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);

  if (shouldPreserveName(baseName)) {
    return;
  }

  if (phase === "phase1") {
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
  } else if (phase === "phase2") {
    if (baseName.endsWith(tempSuffix)) {
      const newFileName = baseName.slice(0, -tempSuffix.length) + ext;
      const newFilePath = path.join(dir, newFileName);
      await moveFile(filePath, newFilePath);
    }
  }
}

async function moveFile(oldPath: string, newPath: string) {
  await fs.ensureDir(path.dirname(newPath));
  await fs.move(oldPath, newPath, { overwrite: false });
}
