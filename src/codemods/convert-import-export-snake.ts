import type { API, FileInfo } from "jscodeshift";
import { getCasingFunction } from "../lib/get-casing-function";
import updateImportsAndExports from "./helpers/update-imports-and-exports";

const casingFn = getCasingFunction("snake");

export default function transformer(fileInfo: FileInfo, api: API) {
  const j = api.jscodeshift;

  const root = j(fileInfo.source);

  return updateImportsAndExports(j, root, casingFn);
}
