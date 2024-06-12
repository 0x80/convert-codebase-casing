import path from "path";
import { targetPathPrefixes } from "../lib/config";
import type { ACTUAL_ANY } from "../lib/types";

// Helper function to transform camelCase to kebab-case paths
function transformPath(
  filePath: string,
  transformFn: (str: string) => string
): string {
  const parsedPath = path.parse(filePath);
  const dirParts = parsedPath.dir.split(path.sep).map((x) => {
    if (x.startsWith("[")) {
      return x;
    } else {
      return transformFn(x);
    }
  });
  const dir = dirParts.join(path.sep);
  const base = transformFn(parsedPath.base);
  return `${dir}/${base}`;
}

// Function to update the source value of import/export declarations
export function updateSourceValue(
  node: ACTUAL_ANY,
  transformFn: (str: string) => string
) {
  const currentSourceValue = node.source.value;
  if (
    targetPathPrefixes.some((str) => currentSourceValue.startsWith(str)) &&
    /[A-Z]/.test(currentSourceValue) // Check if there's any uppercase letter
  ) {
    node.source.value = transformPath(currentSourceValue, transformFn);
  }
}
