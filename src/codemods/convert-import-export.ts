import type { API, FileInfo, Options } from "jscodeshift";
import { getCasingFunction } from "../lib/get-casing-function";
import updateImportsAndExports from "./helpers/update-imports-and-exports";

export default function transformer(
  fileInfo: FileInfo,
  api: API,
  options: Options,
) {
  const casingType = options.casingType as "kebab" | "snake";
  const casingFn = getCasingFunction(casingType);
  const j = api.jscodeshift;

  const root = j(fileInfo.source);

  return updateImportsAndExports(j, root, casingFn);
}
