import simpleGit from "simple-git";
export const git = simpleGit();

/**
 * Commits changes to the Git repository with the specified message.
 *
 * @param message - The commit message.
 */
export async function commitChanges(message: string) {
  await git.add("./*");
  await git.commit(message);
}
