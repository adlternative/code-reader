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
  constructor(
    private context: vscode.ExtensionContext,
    private workspaceRoot: string
  ) {}

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
      return Promise.resolve(this.getFiles(element.relativeFilePath));
    } else {
      return Promise.resolve(this.getFiles("/"));
    }
  }

  private getFiles(relativeDirPath: string): CodeReaderTreeItem[] {
    let dir = path.join(this.workspaceRoot, relativeDirPath);

    if (!fs.existsSync(dir)) {
      vscode.window.showInformationMessage(`${dir} does not exist`);
      return [];
    }

    const files: fs.Dirent[] = fs.readdirSync(dir, { withFileTypes: true });
    if (files.length === 0) {
      vscode.window.showInformationMessage("No files found in test directory");
      return [];
    }
    const directories: fs.Dirent[] = [];
    const filesOnly: fs.Dirent[] = [];

    files.forEach((file) => {
      if (file.isDirectory() && file.name !== ".git") {
        directories.push(file);
      } else {
        filesOnly.push(file);
      }
    });

    // 按名称排序
    directories.sort((a, b) => a.name.localeCompare(b.name));
    filesOnly.sort((a, b) => a.name.localeCompare(b.name));

    // 合并并创建 TreeItem 对象
    return [...directories, ...filesOnly].map((file) => {
      let relativeFilePath = path.join(relativeDirPath, file.name);

      return new CodeReaderTreeItem(
        file.name,
        relativeFilePath,
        file.isDirectory(),
        this.workspaceRoot,
        this.context.workspaceState.get(relativeFilePath, false)
      );
    });
  }
}

export class CodeReaderTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly relativeFilePath: string,
    public readonly isDirectory: boolean,
    public readonly workspaceRoot: string,
    public readonly checked: boolean
  ) {
    super(
      label,
      isDirectory
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
    );
    this.tooltip = `${this.label}`;
    this.description = false;
    this.iconPath = isDirectory
      ? vscode.ThemeIcon.Folder
      : vscode.ThemeIcon.File;

    this.checkboxState = checked
      ? vscode.TreeItemCheckboxState.Checked
      : vscode.TreeItemCheckboxState.Unchecked;
    if (!this.isDirectory) {
      this.command = {
        command: "codeReaderExplorer.openFile",
        title: "打开文件",
        arguments: [path.join(workspaceRoot, this.relativeFilePath)],
      };
    }
  }
}
