import type { API, FileInfo } from "jscodeshift";
import { updateSourceValue } from "./helpers/update-source-values";
import { getCasingFunction } from "../lib/get-casing-function";

const casingFn = getCasingFunction("kebab");

export default function transformer(fileInfo: FileInfo, api: API) {
  const j = api.jscodeshift;

  const root = j(fileInfo.source);

  root.find(j.ImportDeclaration).forEach((path) => {
    updateSourceValue(path.node, casingFn);
  });

  root.find(j.DynamicImport).forEach((path) => {
    updateSourceValue(path.node, casingFn);
  });

  root.find(j.ExportNamedDeclaration).forEach((path) => {
    if (path.node.source) {
      updateSourceValue(path.node, casingFn);
    }
  });

  root.find(j.ExportAllDeclaration).forEach((path) => {
    if (path.node.source) {
      updateSourceValue(path.node, casingFn);
    }
  });

  root.find(j.TSImportType).forEach((path) => {
    updateSourceValue(path.node, casingFn);
  });

  return root.toSource();
}
