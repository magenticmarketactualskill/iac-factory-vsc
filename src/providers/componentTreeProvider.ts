import * as vscode from 'vscode';
import { IacParser, IacFactory, IacComponent } from '../parsers/iacParser';

export class ComponentTreeProvider implements vscode.TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TreeItem): Thenable<TreeItem[]> {
        const editor = vscode.window.activeTextEditor;
        
        if (!editor || editor.document.languageId !== 'python') {
            return Promise.resolve([]);
        }

        const code = editor.document.getText();
        
        if (!IacParser.hasIacFactoryImport(code)) {
            return Promise.resolve([]);
        }

        const factory = IacParser.parse(code);
        
        if (!factory) {
            return Promise.resolve([]);
        }

        if (!element) {
            // Root level - show factory and domain groups
            return Promise.resolve([
                new TreeItem(
                    `Factory: ${factory.name}`,
                    vscode.TreeItemCollapsibleState.Expanded,
                    'factory'
                ),
                ...this.getDomainGroups(factory)
            ]);
        } else if (element.contextValue === 'domain') {
            // Domain level - show components in this domain
            return Promise.resolve(this.getComponentsInDomain(factory, element.label as string));
        }

        return Promise.resolve([]);
    }

    private getDomainGroups(factory: IacFactory): TreeItem[] {
        const domains = new Set(factory.components.map(c => c.domainType));
        return Array.from(domains).sort().map(domain => {
            const count = factory.components.filter(c => c.domainType === domain).length;
            return new TreeItem(
                `${domain} (${count})`,
                vscode.TreeItemCollapsibleState.Collapsed,
                'domain'
            );
        });
    }

    private getComponentsInDomain(factory: IacFactory, domainLabel: string): TreeItem[] {
        const domain = domainLabel.split(' ')[0]; // Extract domain name from "Domain (count)"
        return factory.components
            .filter(c => c.domainType === domain)
            .map(c => {
                const item = new TreeItem(
                    `${c.name} (${c.type})`,
                    vscode.TreeItemCollapsibleState.None,
                    'component'
                );
                item.description = c.technology;
                item.tooltip = `Type: ${c.type}\nDomain: ${c.domainType}\nTechnology: ${c.technology}`;
                return item;
            });
    }
}

class TreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue: string
    ) {
        super(label, collapsibleState);

        // Set icons based on context
        if (contextValue === 'factory') {
            this.iconPath = new vscode.ThemeIcon('symbol-namespace');
        } else if (contextValue === 'domain') {
            this.iconPath = new vscode.ThemeIcon('folder');
        } else if (contextValue === 'component') {
            this.iconPath = new vscode.ThemeIcon('symbol-class');
        }
    }
}
