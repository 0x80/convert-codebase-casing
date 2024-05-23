import fs from "fs/promises";
import path from "path";

const extensions = [".ts", ".tsx", ".js", ".jsx"];

export async function processFilesRecursively(directoryPath: string) {
  const items = await fs.readdir(directoryPath);

  for (const item of items) {
    const itemPath = path.join(directoryPath, item);
    const stat = await fs.stat(itemPath);

    if (stat.isDirectory()) {
      console.log(`Processing directory: ${itemPath}`);
      await processFilesRecursively(itemPath);
    } else if (extensions.some((ext) => item.endsWith(ext))) {
      console.log(`Processing file: ${itemPath}`);
      await processFile(itemPath);
    }
  }
}

async function processFile(filePath: string) {
  const content = await fs.readFile(filePath, "utf-8");
  let updatedContent = content;

  updatedContent = processEsmImports(updatedContent);
  updatedContent = processEsmExports(updatedContent);
  updatedContent = processCommonJsImports(updatedContent);
  updatedContent = processCommonJsExports(updatedContent);

  if (content !== updatedContent) {
    await fs.writeFile(filePath, updatedContent, "utf-8");
    console.log(`Updated imports/exports in: ${filePath}`);
  }
}

function processEsmImports(content: string): string {
  return content.replace(
    /(import\s+["']|import\(["'])(\.{1,2}\/|~\/)([^"']+)(["'])/g,
    (match, p1, p2, p3, p4) => {
      const updatedPath = p3
        .split("/")
        .map((segment: string) => kebabCase(segment))
        .join("/");
      return `${p1}${p2}${updatedPath}${p4}`;
    }
  );
}

function processEsmExports(content: string): string {
  return content.replace(
    /(export\s+\*\s+from\s+["'])(\.{1,2}\/|~\/)([^"']+)(["'])/g,
    (match, p1, p2, p3, p4) => {
      const updatedPath = p3
        .split("/")
        .map((segment: string) => kebabCase(segment))
        .join("/");
      return `${p1}${p2}${updatedPath}${p4}`;
    }
  );
}

function processCommonJsImports(content: string): string {
  return content.replace(
    /(require\(["'])(\.{1,2}\/|~\/)([^"']+)(["'])/g,
    (match, p1, p2, p3, p4) => {
      const updatedPath = p3
        .split("/")
        .map((segment: string) => kebabCase(segment))
        .join("/");
      return `${p1}${p2}${updatedPath}${p4}`;
    }
  );
}

function processCommonJsExports(content: string): string {
  return content.replace(
    /(module\.exports\s*=\s*require\(["'])(\.{1,2}\/|~\/)([^"']+)(["'])/g,
    (match, p1, p2, p3, p4) => {
      const updatedPath = p3
        .split("/")
        .map((segment: string) => kebabCase(segment))
        .join("/");
      return `${p1}${p2}${updatedPath}${p4}`;
    }
  );
}

function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

// Usage example
processFilesRecursively("./src").catch((err) => console.error(err));
