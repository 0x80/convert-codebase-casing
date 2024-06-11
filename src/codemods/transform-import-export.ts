import path from "node:path";
import { parseSync } from "@babel/core";
import type { API, FileInfo } from "jscodeshift";
import type { ACTUAL_ANY } from "../lib/types";
import { targetPathPrefixes } from "../lib/config";

// Helper function to convert a string to kebab-case
function kebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

// Helper function to transform camelCase to kebab-case paths
function transformPath(filePath: string): string {
  const parsedPath = path.parse(filePath);
  const dirParts = parsedPath.dir.split(path.sep).map(kebabCase);
  const dir = dirParts.join(path.sep);
  const base = kebabCase(parsedPath.base);
  return `${dir}/${base}`;
}

export default function (fileInfo: FileInfo, api: API) {
  const j = api.jscodeshift.withParser({
    // @ts-expect-error wut
    parse: (source: string) =>
      parseSync(source, {
        plugins: [
          "@babel/plugin-syntax-jsx",
          "@babel/plugin-proposal-class-properties",
        ],
        overrides: [
          {
            test: ["**/*.ts", "**/*.tsx"],
            plugins: [["@babel/plugin-syntax-typescript", { isTSX: true }]],
          },
        ],
        filename: "source-file.tsx",
        parserOpts: {
          tokens: true,
        },
      }),
  });

  // Function to update the source value of import/export declarations
  function updateSourceValue(node: ACTUAL_ANY) {
    const currentSourceValue = node.source.value;
    if (
      targetPathPrefixes.some((str) => currentSourceValue.startsWith(str)) &&
      /[A-Z]/.test(currentSourceValue) // Check if there's any uppercase letter
    ) {
      node.source.value = transformPath(currentSourceValue);
    }
  }

  const root = j(fileInfo.source);

  root.find(j.ImportDeclaration).forEach((path) => {
    updateSourceValue(path.node);
  });

  root.find(j.ExportNamedDeclaration).forEach((path) => {
    if (path.node.source) {
      updateSourceValue(path.node);
    }
  });

  root.find(j.ExportAllDeclaration).forEach((path) => {
    if (path.node.source) {
      updateSourceValue(path.node);
    }
  });

  root.find(j.TSImportType).forEach((path) => {
    updateSourceValue(path.node);
  });

  return root.toSource();
}
