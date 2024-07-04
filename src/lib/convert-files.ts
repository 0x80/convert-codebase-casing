import fs from "fs-extra";
import path from "path";
import { logger } from "./logger";
import { getFilesToProcess } from "./get-files-to-process";

const TEMP_SUFFIX = "__tmp";

export async function renameFilesAndFolders(
  directoryPath: string,
  gitignorePath: string,
  phase: "phase1" | "phase2",
  casingFn: (str: string) => string
) {
  const absoluteDirectoryPath = path.resolve(directoryPath);
  logger.info(
    `Starting renameFilesAndFolders - Phase: ${phase}, Directory: ${absoluteDirectoryPath}`
  );

  const filesToProcess = await getFilesToProcess(
    absoluteDirectoryPath,
    gitignorePath
  );
  logger.info(`Found ${filesToProcess.length} files to process`);

  const renamedPaths = new Set<string>();

  for (const filePath of filesToProcess) {
    const newPath =
      phase === "phase1"
        ? getNewPathPhaseOne(filePath, absoluteDirectoryPath, casingFn)
        : getNewPathPhaseTwo(filePath, absoluteDirectoryPath);

    logger.debug(`${phase} - Old path: ${filePath}`);
    logger.debug(`${phase} - New path: ${newPath}`);

    if (newPath !== filePath) {
      await moveFile(filePath, newPath);
      renamedPaths.add(path.dirname(filePath)); // Add the old directory path
    }
  }

  logger.info(`Removing empty directories after ${phase}`);
  await removeEmptyDirectories(absoluteDirectoryPath, renamedPaths);
}

async function removeEmptyDirectories(
  baseDirectory: string,
  renamedPaths: Set<string>
) {
  const sortedPaths = Array.from(renamedPaths).sort(
    (a, b) => b.length - a.length
  );

  for (const dirPath of sortedPaths) {
    if (!dirPath.startsWith(baseDirectory)) {
      continue;
    }

    try {
      const files = await fs.readdir(dirPath);
      if (files.length === 0) {
        await fs.rmdir(dirPath);
        logger.debug(`Removed empty directory: ${dirPath}`);
      }
    } catch (error) {
      logger.error(`Error processing directory ${dirPath}: ${error}`);
    }
  }
}

function getNewPathPhaseOne(
  filePath: string,
  basePath: string,
  casingFn: (str: string) => string
): string {
  const relativePath = path.relative(basePath, filePath);
  const segments = relativePath.split(path.sep);
  const newSegments = segments.map((segment, index) => {
    // Apply special handling for the last segment (file name)
    if (index === segments.length - 1) {
      return convertFileName(segment, casingFn);
    }
    return convertSegment(segment, casingFn);
  });
  return path.join(basePath, ...newSegments);
}

export function convertFileName(
  fileName: string,
  casingFn: (str: string) => string
): string {
  const ext = path.extname(fileName);
  const baseName = path.basename(fileName, ext);

  if (
    /** Preserve Next.js _app.tsx etc */
    baseName.startsWith("_") ||
    /** Preserve files like README or LICENSE */
    baseName === baseName.toUpperCase()
  ) {
    return fileName;
  }

  const convertedBaseName = convertSegment(baseName, casingFn);
  return convertedBaseName + ext;
}

export function convertSegment(
  segment: string,
  casingFn: (str: string) => string
): string {
  /** Preserve Next.js route parameters */
  if (segment.startsWith("[")) {
    return segment;
  }

  const converted = casingFn(segment);

  if (converted === segment) {
    // If the conversion didn't change anything, return as is
    return converted;
  } else if (converted.toLowerCase() === segment.toLowerCase()) {
    // If they're the same when lowercased, but different in original form,
    // add the temp suffix
    return converted + TEMP_SUFFIX;
  } else {
    // If they're different even when lowercased, return the converted version
    return converted;
  }
}

function getNewPathPhaseTwo(filePath: string, basePath: string): string {
  const relativePath = path.relative(basePath, filePath);
  const segments = relativePath.split(path.sep);
  const newSegments = segments.map((segment, index) => {
    if (index === segments.length - 1) {
      // Handle the last segment (file name) separately
      const ext = path.extname(segment);
      const baseName = path.basename(segment, ext);
      if (baseName.endsWith(TEMP_SUFFIX)) {
        const newBaseName = baseName
          .slice(0, -TEMP_SUFFIX.length)
          .toLowerCase();
        logger.debug(
          `Phase 2 conversion: ${baseName}${ext} -> ${newBaseName}${ext}`
        );
        return newBaseName + ext;
      }
    } else if (segment.endsWith(TEMP_SUFFIX)) {
      const newSegment = segment.slice(0, -TEMP_SUFFIX.length).toLowerCase();
      logger.debug(`Phase 2 conversion: ${segment} -> ${newSegment}`);
      return newSegment;
    } else if (segment.includes(TEMP_SUFFIX)) {
      logger.warn(`Unexpected TEMP_SUFFIX in middle of segment: ${segment}`);
    }
    return segment;
  });
  return path.join(basePath, ...newSegments);
}

async function moveFile(oldPath: string, newPath: string) {
  try {
    await fs.ensureDir(path.dirname(newPath));
    await fs.move(oldPath, newPath, { overwrite: false });
    logger.debug(`Moved: ${oldPath} -> ${newPath}`);
  } catch (error) {
    logger.error(
      `Failed to move file: ${oldPath} -> ${newPath}. Error: ${error}`
    );
  }
}
