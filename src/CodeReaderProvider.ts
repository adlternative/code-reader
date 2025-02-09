import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class CodeReaderProvider
  implements vscode.TreeDataProvider<CodeReaderTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    CodeReaderTreeItem | undefined | null | void
  > = new vscode.EventEmitter<CodeReaderTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    CodeReaderTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
  constructor(private workspaceRoot?: string) {}

  getTreeItem(
    element: CodeReaderTreeItem
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: CodeReaderTreeItem): Thenable<CodeReaderTreeItem[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage("No file in empty workspace");
      return Promise.resolve([]);
    }

    if (element) {
      return Promise.resolve(this.getFiles(element.absolutePath));
    } else {
      return Promise.resolve(this.getFiles(this.workspaceRoot));
    }
  }

  private getFiles(dir: string): CodeReaderTreeItem[] {
    if (!fs.existsSync(dir)) {
      vscode.window.showInformationMessage(`${dir} does not exist`);
      return [];
    }

    const files: string[] = fs.readdirSync(dir);
    if (files.length === 0) {
      vscode.window.showInformationMessage("No files found in test directory");
      return [];
    }

    // 分离目录和文件
    const directories = files.filter(
      (file) =>
        fs.lstatSync(path.join(dir, file)).isDirectory() && file !== ".git"
    );
    const filesOnly = files.filter(
      (file) => !fs.lstatSync(path.join(dir, file)).isDirectory()
    );

    // 按字典序排序
    directories.sort();
    filesOnly.sort();

    // 合并并创建 TreeItem 对象
    return [...directories, ...filesOnly].map((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.lstatSync(filePath);
      return new CodeReaderTreeItem(
        file,
        filePath,
        stat.isDirectory()
          ? vscode.TreeItemCollapsibleState.Collapsed
          : vscode.TreeItemCollapsibleState.None,
        stat.isDirectory()
      );
    });
  }
}

class CodeReaderTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly absolutePath: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly isDirectory: boolean
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label}`;
    this.description = false;
    this.iconPath = isDirectory
      ? vscode.ThemeIcon.Folder
      : vscode.ThemeIcon.File;

    if (!this.isDirectory) {
      this.command = {
        command: "codeReaderExplorer.openFile",
        title: "打开文件",
        arguments: [this.absolutePath],
      };
    }
  }
}
