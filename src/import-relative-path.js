const path = require('path');

const execa = require('execa');

async function hasFdInstalled() {
  try {
    await execa('which', ['fd']);
    return true;
  } catch (err) {
    return false;
  }
}

async function listFilesInWorkspace(workspaceRootPath) {
  const cmd = await execa('fd', ['--type', 'f'], { cwd: workspaceRootPath });
  const files = cmd.stdout.split('\n');

  return files.map((f) => ({ label: path.basename(f), description: '/' + f }));
}

module.exports.execute = async (args) => {
  const { window, workspace } = args.require('vscode');

  if (!(await hasFdInstalled())) {
    window.showErrorMessage(
      'fd CLI is required. See https://github.com/sharkdp/fd'
    );
  }

  const rootPath = workspace.rootPath;
  const result = await window.showQuickPick(listFilesInWorkspace(rootPath), {
    matchOnDescription: true,
  });

  if (!result) return;

  const selectedFilePath = result.description.slice(1); // Remove leading '/'

  const currentOpenFilePath = window.activeTextEditor.document.fileName;
  let relPath = path.relative(
    path.dirname(currentOpenFilePath),
    path.join(rootPath, selectedFilePath)
  );

  if (!relPath.startsWith('..')) relPath = './' + relPath; // Same directory as current file

  const cursorPosition = window.activeTextEditor.selection.active;
  window.activeTextEditor.edit((e) => e.insert(cursorPosition, relPath));
};
