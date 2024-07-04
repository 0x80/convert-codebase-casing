import type { JSCodeshift, StringLiteral } from "jscodeshift";
import { getUpdatedSource } from "./update-source-value";
import type { TODO } from "../../lib/types";
import { logger } from "../../lib/logger";

export default function updateImportsAndExports(
  j: JSCodeshift,
  root: ReturnType<JSCodeshift>,
  casingFn: (str: string) => string
) {
  let hasChanges = false;

  root.find(j.ImportDeclaration).forEach((path) => {
    const newSource = getUpdatedSource(j, path.node.source, casingFn);
    if (newSource) {
      path.node.source = newSource;
      hasChanges = true;
    }
  });

  root.find(j.ExportNamedDeclaration).forEach((path) => {
    if (path.node.source) {
      const newSource = getUpdatedSource(j, path.node.source, casingFn);
      if (newSource) {
        path.node.source = newSource;
        hasChanges = true;
      }
    }
  });

  root.find(j.ExportAllDeclaration).forEach((path) => {
    if (path.node.source) {
      const newSource = getUpdatedSource(j, path.node.source, casingFn);
      if (newSource) {
        path.node.source = newSource;
        hasChanges = true;
      }
    }
  });

  root.find(j.TSImportType).forEach((path) => {
    const newSource = getUpdatedSource(j, path.node.argument, casingFn);
    if (newSource) {
      // @ts-expect-error dunno
      path.node.argument = newSource;
      hasChanges = true;
    }
  });

  // Handle require()
  root
    .find(j.CallExpression, { callee: { name: "require" } })
    .forEach((path) => {
      const arg = path.node.arguments[0] as StringLiteral;
      const newSource = getUpdatedSource(j, arg, casingFn);
      if (newSource) {
        path.node.arguments[0] = newSource;
        hasChanges = true;
      }
    });

  // Handle new URL()
  root.find(j.NewExpression, { callee: { name: "URL" } }).forEach((path) => {
    const newSource = getUpdatedSource(j, path.node.arguments[0], casingFn);
    if (newSource) {
      path.node.arguments[0] = newSource;
      hasChanges = true;
    }
  });

  // Handle import()
  root.find(j.ImportExpression).forEach((path) => {
    const newSource = getUpdatedSource(j, path.node.source, casingFn);

    if (newSource) {
      path.node.source = newSource;
      hasChanges = true;
    }
  });

  // Handle import() inside dynamic() calls
  root
    .find(j.CallExpression, { callee: { name: "dynamic" } })
    .forEach((path) => {
      logger.debug("Found dynamic() call in ", path.name);

      const firstArg = path.node.arguments.at(0);
      if (firstArg?.type === "ArrowFunctionExpression") {
        logger.debug("Has ArrowFunctionExpression");

        if (firstArg.body.type === "ImportExpression") {
          logger.debug("Has ImportExpression");

          const newSource = getUpdatedSource(j, firstArg.body.source, casingFn);
          if (newSource) {
            (path.node.arguments[0] as TODO).body.source = newSource;
            hasChanges = true;
          }
        }
      }
    });

  return hasChanges ? root.toSource() : null;
}
