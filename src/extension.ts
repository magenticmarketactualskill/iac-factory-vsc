import * as vscode from 'vscode';
import { generateDiagram } from './commands/generateDiagram';
import { generatePulumi } from './commands/generatePulumi';
import { previewDiagram } from './commands/previewDiagram';
import { ComponentTreeProvider } from './providers/componentTreeProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('IAC Factory extension is now active');

    // Register tree view provider
    const componentTreeProvider = new ComponentTreeProvider(context);
    vscode.window.registerTreeDataProvider('iacFactoryComponents', componentTreeProvider);

    // Register commands
    const generateDiagramCommand = vscode.commands.registerCommand(
        'iacFactory.generateDiagram',
        () => generateDiagram(context)
    );

    const generatePulumiCommand = vscode.commands.registerCommand(
        'iacFactory.generatePulumi',
        () => generatePulumi(context)
    );

    const previewDiagramCommand = vscode.commands.registerCommand(
        'iacFactory.previewDiagram',
        () => previewDiagram(context)
    );

    const refreshComponentsCommand = vscode.commands.registerCommand(
        'iacFactory.refreshComponents',
        () => componentTreeProvider.refresh()
    );

    // Add to subscriptions
    context.subscriptions.push(
        generateDiagramCommand,
        generatePulumiCommand,
        previewDiagramCommand,
        refreshComponentsCommand
    );

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
                    previewDiagram(context);
                }
            }
        }, null, context.subscriptions);
    }
}

export function deactivate() {
    console.log('IAC Factory extension is now deactivated');
}
