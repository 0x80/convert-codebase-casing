import fs from "fs-extra";
import path from "path";
import { logger } from "./logger";

const TEMP_SUFFIX = "__tmp";

export async function renameFilesAndFolders(
  directoryPath: string,
  paths: string[],
  phase: "phase1" | "phase2",
  casingFn: (str: string) => string
) {
  const absoluteDirectoryPath = path.resolve(directoryPath);

  const renamedPaths = new Set<string>();

  for (const oldPath of paths) {
    const newPath =
      phase === "phase1"
        ? getNewPathPhaseOne(oldPath, casingFn)
        : getNewPathPhaseTwo(oldPath);

    logger.debug(`Move to ${newPath}`);

    if (newPath !== oldPath) {
      await moveFile(
        path.join(directoryPath, oldPath),
        path.join(directoryPath, newPath)
      );
      renamedPaths.add(path.dirname(oldPath)); // Add the old directory path
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

  for (const relativePath of sortedPaths) {
    try {
      const absolutePath = path.join(baseDirectory, relativePath);
      const files = await fs.readdir(absolutePath);

      if (files.length === 0) {
        await fs.rmdir(absolutePath);
        logger.debug(`Removed empty directory: ${relativePath}`);
      }
    } catch (error) {
      logger.error(`Error processing directory ${relativePath}: ${error}`);
    }
  }
}

function getNewPathPhaseOne(
  filePath: string,
  casingFn: (str: string) => string
): string {
  const segments = filePath.split(path.sep);
  const newSegments = segments.map((segment, index) => {
    // Apply special handling for the last segment (file name)
    if (index === segments.length - 1) {
      return convertFileName(segment, casingFn);
    }
    return convertSegment(segment, casingFn);
  });
  return path.join(...newSegments);
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

  /** Directories that start with _ are also likely named like this on purpose */
  if (segment.startsWith("_")) {
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

function getNewPathPhaseTwo(filePath: string): string {
  const segments = filePath.split(path.sep);

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

  return path.join(...newSegments);
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
