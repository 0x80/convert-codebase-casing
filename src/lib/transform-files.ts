import fs from "fs-extra";
import path from "path";
import simpleGit from "simple-git";

const git = simpleGit();

const extensions = [".ts", ".tsx", ".js", ".jsx"];

/**
 * Recursively renames files in the specified directory based on the phase.
 *
 * @param directoryPath - The path of the directory to process.
 * @param phase - The phase of renaming ('phase1' or 'phase2').
 */
async function renameFilesRecursively(
  directoryPath: string,
  phase: "phase1" | "phase2"
) {
  const files = await fs.readdir(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      await renameFilesRecursively(filePath, phase);
    } else if (extensions.some((ext) => file.endsWith(ext))) {
      if (phase === "phase1") {
        await renameFilePhase1(filePath);
      } else if (phase === "phase2") {
        await renameFilePhase2(filePath);
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
  await renameFilesRecursively(directoryPath, "phase1");
  await commitChanges("Phase 1: Renamed files to kebab-case");
  console.log("Phase 1 completed and changes committed.");

  console.log("Starting Phase 2...");
  await renameFilesRecursively(directoryPath, "phase2");
  await commitChanges("Phase 2: Removed underscore suffix from filenames");
  console.log("Phase 2 completed and changes committed.");
}
