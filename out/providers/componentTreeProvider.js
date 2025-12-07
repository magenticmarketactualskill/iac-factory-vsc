"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentTreeProvider = void 0;
const vscode = __importStar(require("vscode"));
const iacParser_1 = require("../parsers/iacParser");
class ComponentTreeProvider {
    constructor(context) {
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'python') {
            return Promise.resolve([]);
        }
        const code = editor.document.getText();
        if (!iacParser_1.IacParser.hasIacFactoryImport(code)) {
            return Promise.resolve([]);
        }
        const factory = iacParser_1.IacParser.parse(code);
        if (!factory) {
            return Promise.resolve([]);
        }
        if (!element) {
            // Root level - show factory and domain groups
            return Promise.resolve([
                new TreeItem(`Factory: ${factory.name}`, vscode.TreeItemCollapsibleState.Expanded, 'factory'),
                ...this.getDomainGroups(factory)
            ]);
        }
        else if (element.contextValue === 'domain') {
            // Domain level - show components in this domain
            return Promise.resolve(this.getComponentsInDomain(factory, element.label));
        }
        return Promise.resolve([]);
    }
    getDomainGroups(factory) {
        const domains = new Set(factory.components.map(c => c.domainType));
        return Array.from(domains).sort().map(domain => {
            const count = factory.components.filter(c => c.domainType === domain).length;
            return new TreeItem(`${domain} (${count})`, vscode.TreeItemCollapsibleState.Collapsed, 'domain');
        });
    }
    getComponentsInDomain(factory, domainLabel) {
        const domain = domainLabel.split(' ')[0]; // Extract domain name from "Domain (count)"
        return factory.components
            .filter(c => c.domainType === domain)
            .map(c => {
            const item = new TreeItem(`${c.name} (${c.type})`, vscode.TreeItemCollapsibleState.None, 'component');
            item.description = c.technology;
            item.tooltip = `Type: ${c.type}\nDomain: ${c.domainType}\nTechnology: ${c.technology}`;
            return item;
        });
    }
}
exports.ComponentTreeProvider = ComponentTreeProvider;
class TreeItem extends vscode.TreeItem {
    constructor(label, collapsibleState, contextValue) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.contextValue = contextValue;
        // Set icons based on context
        if (contextValue === 'factory') {
            this.iconPath = new vscode.ThemeIcon('symbol-namespace');
        }
        else if (contextValue === 'domain') {
            this.iconPath = new vscode.ThemeIcon('folder');
        }
        else if (contextValue === 'component') {
            this.iconPath = new vscode.ThemeIcon('symbol-class');
        }
    }
}
//# sourceMappingURL=componentTreeProvider.js.map