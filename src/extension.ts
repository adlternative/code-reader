// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { CodeReaderProvider } from "./CodeReaderProvider";

export function activate(context: vscode.ExtensionContext) {
  const rootPath =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : undefined;

  let codeReaderProvider = new CodeReaderProvider(rootPath);

  vscode.window.registerTreeDataProvider("code-reader", codeReaderProvider);

  vscode.commands.registerCommand("codeReaderExplorer.refresh", () =>
    codeReaderProvider.refresh()
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
