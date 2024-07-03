declare module "parse-gitignore" {
  export default function parseGitignore(gitignoreContent: string): {
    patterns: string[];
  };
}
