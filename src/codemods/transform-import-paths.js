const { parse } = require("path");
const camelCase = require("lodash.camelcase");
const kebabCase = require("lodash.kebabcase");

module.exports = function (fileInfo, api, options) {
  const j = api.jscodeshift;

  // Helper function to transform camelCase to kebab-case
  function transformPath(path) {
    const parsedPath = parse(path);
    return `${parsedPath.dir}/${kebabCase(parsedPath.name)}${parsedPath.ext}`;
  }

  return j(fileInfo.source)
    .find(j.ImportDeclaration)
    .forEach((path) => {
      const currentSourceValue = path.node.source.value;
      // Check if the path starts with './', '../', or '~/'
      if (
        /^(?:\.\.?\/|~\/)/.test(currentSourceValue) &&
        camelCase(currentSourceValue) === currentSourceValue
      ) {
        path.node.source.value = transformPath(currentSourceValue);
      }
    })
    .toSource();
};
