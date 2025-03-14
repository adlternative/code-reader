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
    onDidChangeCheckboxState(context, e, codeReaderProvider);
  });
}

async function onDidChangeCheckboxState(
  context: vscode.ExtensionContext,
  e: vscode.TreeCheckboxChangeEvent<CodeReaderTreeItem>,
  codeReaderProvider?: CodeReaderProvider
) {
  for (const item of e.items) {
    const treeItem = item[0];
    const relativeFilePath = treeItem.relativeFilePath;
    const stateValue = item[1];
    // Interpret state: 1 means read (true), 0 means unread (false)
    const isRead = stateValue === 1;

    // Update the workspaceState with the file read status, using the fileName as key.
    await context.workspaceState.update(relativeFilePath, isRead);

    console.log(
      `File: ${relativeFilePath} is marked as ${isRead ? "read" : "unread"}`
    );

    // If the item is a directory, recursively update all child items
    if (treeItem.isDirectory && codeReaderProvider) {
      await updateChildItems(context, treeItem, isRead, codeReaderProvider);
    }
  }
}

// Helper function to recursively update all child items
async function updateChildItems(
  context: vscode.ExtensionContext,
  parentItem: CodeReaderTreeItem,
  isRead: boolean,
  codeReaderProvider: CodeReaderProvider
) {
  const childItems = await codeReaderProvider.getChildren(parentItem);
  for (const childItem of childItems) {
    await context.workspaceState.update(childItem.relativeFilePath, isRead);
    console.log(
      `Child item: ${childItem.relativeFilePath} is marked as ${isRead ? "read" : "unread"}`
    );
    
    // Recursively update children of directories
    if (childItem.isDirectory) {
      await updateChildItems(context, childItem, isRead, codeReaderProvider);
    }
  }
}
