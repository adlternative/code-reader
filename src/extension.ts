// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { createTreeViews } from "./treeViewProvider/treeViews";

function getWorkspaceRoot(): string | null {
  if (
    !vscode.workspace.workspaceFolders ||
    vscode.workspace.workspaceFolders.length === 0
  ) {
    return null;
  }
  return vscode.workspace.workspaceFolders[0].uri.fsPath;
}

export function activate(context: vscode.ExtensionContext) {
  const rootPath = getWorkspaceRoot();
  if (!rootPath) {
    vscode.window.showInformationMessage("No file in empty workspace");
    return;
  }

  createTreeViews(context, rootPath);

  // 注册打开文件的命令
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "codeReaderExplorer.openFile",
      (filePath: string) => {
        vscode.workspace.openTextDocument(filePath).then(
          (doc) => {
            vscode.window.showTextDocument(doc);
          },
          (err) => {
            vscode.window.showErrorMessage(`打开文件失败: ${err}`);
          }
        );
      }
    )
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
