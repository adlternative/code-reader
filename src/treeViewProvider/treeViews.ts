import * as vscode from "vscode";
import { CodeReaderProvider, CodeReaderTreeItem } from "./CodeReaderProvider";

export function createTreeViews(
  context: vscode.ExtensionContext,
  workspaceRoot: string
) {
  const codeReaderProvider = new CodeReaderProvider(context, workspaceRoot);
  vscode.commands.registerCommand("codeReaderExplorer.refresh", () =>
    codeReaderProvider.refresh()
  );

  let tasksView = vscode.window.createTreeView("code-reader", {
    treeDataProvider: codeReaderProvider,
    manageCheckboxStateManually: true,
  });
  tasksView.onDidChangeCheckboxState((e) => {
    onDidChangeCheckboxState(context, e);
  });
}

async function onDidChangeCheckboxState(
  context: vscode.ExtensionContext,
  e: vscode.TreeCheckboxChangeEvent<CodeReaderTreeItem>
) {
  for (const item of e.items) {
    const relativeFilePath = item[0].relativeFilePath;
    const stateValue = item[1];
    // Interpret state: 1 means read (true), 0 means unread (false)
    const isRead = stateValue === 1;

    // Update the workspaceState with the file read status, using the fileName as key.
    await context.workspaceState.update(relativeFilePath, isRead);

    console.log(
      `File: ${relativeFilePath} is marked as ${isRead ? "read" : "unread"}`
    );
  }
}
