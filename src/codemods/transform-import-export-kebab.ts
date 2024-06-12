import type { API, FileInfo } from "jscodeshift";
import { updateSourceValue } from "./update-source-values";
import { getCasingTransform } from "../lib/get-casing-transform";

const transformFn = getCasingTransform("kebab");

export default function transformer(fileInfo: FileInfo, api: API) {
  const j = api.jscodeshift;

  const root = j(fileInfo.source);

  root.find(j.ImportDeclaration).forEach((path) => {
    updateSourceValue(path.node, transformFn);
  });

  root.find(j.ExportNamedDeclaration).forEach((path) => {
    if (path.node.source) {
      updateSourceValue(path.node, transformFn);
    }
  });

  root.find(j.ExportAllDeclaration).forEach((path) => {
    if (path.node.source) {
      updateSourceValue(path.node, transformFn);
    }
  });

  root.find(j.TSImportType).forEach((path) => {
    updateSourceValue(path.node, transformFn);
  });

  return root.toSource();
}
