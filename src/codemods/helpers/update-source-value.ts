import path from "path";

// New function that doesn't mutate, but returns the new value if it should be changed
import type { JSCodeshift } from "jscodeshift";
import type { ASTNode, StringLiteral, Literal } from "jscodeshift";

export function getUpdatedSource<T extends ASTNode>(
  j: JSCodeshift,
  source: T,
  casingFn: (str: string) => string
): StringLiteral | Literal | null {
  if ("value" in source && typeof source.value === "string") {
    const newValue = transformPath(source.value, casingFn);
    if (newValue !== source.value) {
      // Check the type of the original source to determine which type to return
      if (source.type === "StringLiteral") {
        return j.stringLiteral(newValue);
      } else if (source.type === "Literal") {
        return j.literal(newValue);
      }
    }
  }
  return null;
}

/** All prefixes that would be considered imports from local files. */
export const targetPathPrefixes = ["./", "../", "~/", "@/", "@src/", "#"];

function transformPath(
  filePath: string,
  casingFn: (str: string) => string
): string {
  const prefix = targetPathPrefixes.find((p) => filePath.startsWith(p));
  if (!prefix) {
    // console.log("Ignoring path", filePath);
    return filePath;
  }

  const pathWithoutPrefix = filePath.slice(prefix.length);
  const segments = pathWithoutPrefix.split(path.sep);
  const newSegments = segments.map((segment, index) => {
    // Apply special handling for the last segment (file name)
    if (index === segments.length - 1) {
      return convertFileName(segment, casingFn);
    }
    return convertSegment(segment, casingFn);
  });

  const newPath = prefix + newSegments.join(path.sep);
  // console.log("Transform path", filePath, newPath);
  return newPath;
}

function convertFileName(
  fileName: string,
  casingFn: (str: string) => string
): string {
  const ext = path.extname(fileName);
  const baseName = path.basename(fileName, ext);
  const convertedBaseName = convertSegment(baseName, casingFn);
  return convertedBaseName + ext;
}

function convertSegment(
  segment: string,
  casingFn: (str: string) => string
): string {
  if (segment.startsWith("[")) {
    return segment;
  }

  return casingFn(segment);
}
