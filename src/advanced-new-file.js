const path = require('path');
const fs = require('fs');

const execa = require('execa');

async function hasFdInstalled() {
  try {
    await execa('which', ['fd']);
    return true;
  } catch (err) {
    return false;
  }
}

async function listFoldersInWorkspace(workspaceRootPath) {
  const cmd = await execa('fd', ['--type', 'd'], { cwd: workspaceRootPath });
  const folders = cmd.stdout.split('\n');

  return ['/'].concat(folders.map((f) => '/' + f)); // Add root folder + leading slash to folder path
}

module.exports.execute = async (args) => {
  const { window, workspace, Uri } = args.require('vscode');

  if (!(await hasFdInstalled())) {
    window.showErrorMessage(
      'fd CLI is required. See https://github.com/sharkdp/fd'
    );
  }

  const rootPath = workspace.rootPath;
  const parentFolderPath = await window.showQuickPick(
    listFoldersInWorkspace(rootPath),
    { placeHolder: 'Select parent folder' }
  );

  if (!parentFolderPath) return;

  const destinationPath = await window.showInputBox({
    placeHolder:
      'Filename or relative path to file/folder (ending with / to create a folder)',
    prompt: `Relative to ${parentFolderPath}`,
  });

  // Check if the path already exists
  const finalPath = path.join(rootPath, parentFolderPath, destinationPath);
  if (fs.existsSync(finalPath)) {
    window.showErrorMessage(`ERROR: ${finalPath} already exist!\n`);
    return;
  }

  // Create a file or a folder depending on the input
  if (finalPath.endsWith('/')) {
    fs.mkdirSync(finalPath, { recursive: true });
    window.showInformationMessage(`Folder created: ${finalPath}\n`);
  } else {
    // Make sure the parent folder exists
    fs.mkdirSync(path.dirname(finalPath), { recursive: true });
    // Create the file
    fs.writeFileSync(finalPath, '');
    window.showInformationMessage(`File created: ${finalPath}\n`);
    // Open file
    await window.showTextDocument(Uri.file(finalPath));
  }
};
