import type { JSCodeshift, StringLiteral } from "jscodeshift";
import { getUpdatedSourceValue } from "./update-source-value";

export default function updateImportsAndExports(
  j: JSCodeshift,
  root: ReturnType<JSCodeshift>,
  casingFn: (str: string) => string
) {
  root.find(j.ImportDeclaration).forEach((path) => {
    const newValue = getUpdatedSourceValue(
      path.node.source.value as string,
      casingFn
    );
    if (newValue) path.node.source.value = newValue;
  });

  root.find(j.ExportNamedDeclaration).forEach((path) => {
    if (path.node.source) {
      const newValue = getUpdatedSourceValue(
        path.node.source.value as string,
        casingFn
      );
      if (newValue) path.node.source.value = newValue;
    }
  });

  root.find(j.ExportAllDeclaration).forEach((path) => {
    if (path.node.source) {
      const newValue = getUpdatedSourceValue(
        path.node.source.value as string,
        casingFn
      );
      if (newValue) path.node.source.value = newValue;
    }
  });

  root.find(j.TSImportType).forEach((path) => {
    const newValue = getUpdatedSourceValue(
      path.node.argument.value as string,
      casingFn
    );
    if (newValue) path.node.argument.value = newValue;
  });

  // Handle require calls
  root
    .find(j.CallExpression, { callee: { name: "require" } })
    .forEach((path) => {
      const arg = path.node.arguments[0];

      if (arg.type === "StringLiteral" && typeof arg.value === "string") {
        const newValue = getUpdatedSourceValue(arg.value, casingFn);
        if (newValue)
          (path.node.arguments[0] as StringLiteral).value = newValue;
      }
    });

  // Handle dynamic imports
  root.find(j.ImportExpression).forEach((path) => {
    console.log(
      "Found import expression",
      path.node.source,
      (path.node.source as StringLiteral).value
    );

    const newValue = getUpdatedSourceValue(
      (path.node.source as StringLiteral).value,
      casingFn
    );
    if (newValue) (path.node.source as StringLiteral).value = newValue;
  });

  // // Handle dynamic imports inside dynamic() calls
  // root
  //   .find(j.CallExpression, { callee: { name: "dynamic" } })
  //   .forEach((path) => {
  //     console.log("Found dynamic call expression");

  //     const arrowFunction = path.node.arguments[0];
  //     console.log(
  //       "arrowFunction body",
  //       (arrowFunction as any).body.arguments[0]
  //     );

  //     if (
  //       arrowFunction.type === "ArrowFunctionExpression" &&
  //       arrowFunction.body.type === "ImportExpression"
  //     ) {
  //       const importExpr = arrowFunction.body;

  //       console.log("ImportExpr", importExpr);

  //       if (
  //         importExpr.source.type === "Literal" &&
  //         typeof importExpr.source.value === "string"
  //       ) {
  //         const newValue = getUpdatedSourceValue(
  //           importExpr.source.value,
  //           casingFn
  //         );
  //         if (newValue) {
  //           importExpr.source.value = newValue;
  //           // importExpr.source.raw = `"${newValue}"`;
  //         }
  //       }
  //     }
  //   });

  return root.toSource();
}
