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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const generateDiagram_1 = require("./commands/generateDiagram");
const generatePulumi_1 = require("./commands/generatePulumi");
const previewDiagram_1 = require("./commands/previewDiagram");
const componentTreeProvider_1 = require("./providers/componentTreeProvider");
function activate(context) {
    console.log('IAC Factory extension is now active');
    // Register tree view provider
    const componentTreeProvider = new componentTreeProvider_1.ComponentTreeProvider(context);
    vscode.window.registerTreeDataProvider('iacFactoryComponents', componentTreeProvider);
    // Register commands
    const generateDiagramCommand = vscode.commands.registerCommand('iacFactory.generateDiagram', () => (0, generateDiagram_1.generateDiagram)(context));
    const generatePulumiCommand = vscode.commands.registerCommand('iacFactory.generatePulumi', () => (0, generatePulumi_1.generatePulumi)(context));
    const previewDiagramCommand = vscode.commands.registerCommand('iacFactory.previewDiagram', () => (0, previewDiagram_1.previewDiagram)(context));
    const refreshComponentsCommand = vscode.commands.registerCommand('iacFactory.refreshComponents', () => componentTreeProvider.refresh());
    // Add to subscriptions
    context.subscriptions.push(generateDiagramCommand, generatePulumiCommand, previewDiagramCommand, refreshComponentsCommand);
    // Listen to active editor changes
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && editor.document.languageId === 'python') {
            componentTreeProvider.refresh();
        }
    }, null, context.subscriptions);
    // Listen to document changes
    vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document.languageId === 'python') {
            componentTreeProvider.refresh();
        }
    }, null, context.subscriptions);
    // Auto-preview if enabled
    const config = vscode.workspace.getConfiguration('iacFactory');
    if (config.get('autoPreview')) {
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && editor.document.languageId === 'python') {
                const text = editor.document.getText();
                if (text.includes('iac_factory') || text.includes('IacFactory')) {
                    (0, previewDiagram_1.previewDiagram)(context);
                }
            }
        }, null, context.subscriptions);
    }
}
function deactivate() {
    console.log('IAC Factory extension is now deactivated');
}
//# sourceMappingURL=extension.js.map