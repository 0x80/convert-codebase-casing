import fs from "fs-extra";
import path from "path";
import simpleGit from "simple-git";

const git = simpleGit();

const extensions = [".ts", ".tsx", ".js", ".jsx"];

/**
 * Recursively renames files and folders in the specified directory based on the
 * phase.
 *
 * @param directoryPath - The path of the directory to process.
 * @param phase - The phase of renaming ('phase1' or 'phase2').
 */
async function renameFilesAndFoldersRecursively(
  directoryPath: string,
  phase: "phase1" | "phase2"
) {
  const items = await fs.readdir(directoryPath);

  for (const item of items) {
    const itemPath = path.join(directoryPath, item);
    const stat = await fs.stat(itemPath);

    if (stat.isDirectory()) {
      await renameFilesAndFoldersRecursively(itemPath, phase);
      if (phase === "phase1") {
        await renameFolderPhase1(itemPath);
      } else if (phase === "phase2") {
        await renameFolderPhase2(itemPath);
      }
    } else if (extensions.some((ext) => item.endsWith(ext))) {
      if (phase === "phase1") {
        await renameFilePhase1(itemPath);
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
async function renameFilePhase1(filePath: string) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);

  if (/[A-Z]/.test(baseName)) {
    const newFileName = kebabCase(baseName) + ext;
    const caseInsensitiveNewFileName = newFileName.toLowerCase();

    console.log(newFileName);

    if (
      baseName.toLowerCase() === caseInsensitiveNewFileName.replace(ext, "")
    ) {
      const newFilePath = path.join(dir, kebabCase(baseName) + "_" + ext);
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

  if (baseName.endsWith("_")) {
    const newFileName = baseName.slice(0, -1) + ext;
    console.log(newFileName);

    const newFilePath = path.join(dir, newFileName);
    await fs.rename(filePath, newFilePath);
  }
}

/**
 * Renames a folder to kebab-case and adds an underscore suffix if necessary.
 *
 * @param folderPath - The path of the folder to rename.
 */
async function renameFolderPhase1(folderPath: string) {
  const dir = path.dirname(folderPath);
  const baseName = path.basename(folderPath);

  if (/[A-Z]/.test(baseName)) {
    const newFolderName = kebabCase(baseName);
    const caseInsensitiveNewFolderName = newFolderName.toLowerCase();

    if (baseName.toLowerCase() === caseInsensitiveNewFolderName) {
      const newFolderPath = path.join(dir, kebabCase(baseName) + "_");
      await fs.rename(folderPath, newFolderPath);
    } else {
      const newFolderPath = path.join(dir, newFolderName);
      await fs.rename(folderPath, newFolderPath);
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

  if (baseName.endsWith("_")) {
    const newFolderName = baseName.slice(0, -1);
    const newFolderPath = path.join(dir, newFolderName);
    await fs.rename(folderPath, newFolderPath);
  }
}

/**
 * Converts a string to kebab-case.
 *
 * @param str - The string to convert.
 * @returns The kebab-case version of the string.
 */
function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/**
 * Commits changes to the Git repository with the specified message.
 *
 * @param message - The commit message.
 */
async function commitChanges(message: string) {
  await git.add("./*");
  await git.commit(message);
}

/** Main function to orchestrate the renaming process. */
export async function transformFiles(directoryPath: string) {
  console.log("Starting Phase 1...");
  await renameFilesAndFoldersRecursively(directoryPath, "phase1");
  await commitChanges("Rename files and folders to kebab-case");
  console.log("Phase 1 completed and changes committed.");

  console.log("Starting Phase 2...");
  await renameFilesAndFoldersRecursively(directoryPath, "phase2");
  await commitChanges(
    "Remove underscore suffix from filenames and folder names"
  );
  console.log("Phase 2 completed and changes committed.");
}
