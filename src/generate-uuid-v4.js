const { v4: uuidv4 } = require('uuid');

module.exports.execute = function (args) {
  const { window } = args.require('vscode');

  const editor = window.activeTextEditor;
  if (!editor) {
    return;
  }

  const cursorPosition = editor.selection.active;
  editor.edit((e) => e.insert(cursorPosition, uuidv4()));
};
