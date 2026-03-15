import type { JSCodeshift } from "jscodeshift";
import type { ASTNode, StringLiteral, Literal } from "jscodeshift";
import { targetPathPrefixes } from "../../lib/config";
import { applyCasing, convertFileName } from "../../lib/convert-files";

export function getUpdatedSource<T extends ASTNode>(
  j: JSCodeshift,
  source: T,
  casingFn: (str: string) => string,
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

export function transformPath(
  filePath: string,
  casingFn: (str: string) => string,
): string {
  const prefix = targetPathPrefixes.find((p) => filePath.startsWith(p));

  if (!prefix) {
    return filePath;
  }

  const pathWithoutPrefix = filePath.slice(prefix.length);
  const segments = pathWithoutPrefix.split("/");
  const newSegments = segments.map((segment, index) => {
    if (index === segments.length - 1) {
      return convertFileName(segment, casingFn, applyCasing);
    }
    return applyCasing(segment, casingFn);
  });

  const newPath = prefix + newSegments.join("/");
  return newPath;
}
