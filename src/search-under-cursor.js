module.exports.execute = function (args) {
  const { window, commands } = args.require('vscode');

  const editor = window.activeTextEditor;
  if (!editor) {
    return;
  }

  const wordRange = editor.document.getWordRangeAtPosition(
    editor.selection.start
  );
  if (!wordRange) {
    return;
  }

  const wordText = editor.document.getText(wordRange);

  commands.executeCommand('workbench.action.findInFiles', {
    query: wordText,
    matchWholeWord: true,
    isCaseSensitive: true,
  });
};
