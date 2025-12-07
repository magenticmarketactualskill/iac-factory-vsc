import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { executePython } from '../utils/helpers';

export async function generatePulumi(context: vscode.ExtensionContext): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
    }

    if (editor.document.languageId !== 'python') {
        vscode.window.showErrorMessage('Active file is not a Python file');
        return;
    }

    const code = editor.document.getText();
    
    if (!code.includes('iac_factory') && !code.includes('IacFactory')) {
        vscode.window.showErrorMessage('No IAC Factory code found in the current file');
        return;
    }

    // Save the current file
    await editor.document.save();

    const currentFilePath = editor.document.uri.fsPath;
    const currentDir = path.dirname(currentFilePath);
    const outputPath = path.join(currentDir, '__main__.py');

    // Create a temporary Python script to generate Pulumi code
    const tempScript = `
import sys
sys.path.insert(0, '${currentDir}')

# Import the user's module
import importlib.util
spec = importlib.util.spec_from_file_location("user_module", "${currentFilePath}")
user_module = importlib.util.module_from_spec(spec)

try:
    spec.loader.exec_module(user_module)
    
    # Try to find the factory instance
    factory = None
    for name in dir(user_module):
        obj = getattr(user_module, name)
        if hasattr(obj, 'generate_pulumi_code'):
            factory = obj
            break
    
    if factory:
        pulumi_code = factory.generate_pulumi_code()
        with open("${outputPath}", "w") as f:
            f.write(pulumi_code)
        print("SUCCESS")
    else:
        print("ERROR: No IacFactory instance found")
except Exception as e:
    print(f"ERROR: {str(e)}")
`;

    const tempScriptPath = path.join(currentDir, '.iac_temp_generate_pulumi.py');
    fs.writeFileSync(tempScriptPath, tempScript);

    try {
        const result = await executePython(tempScriptPath);
        
        if (result.includes('SUCCESS')) {
            vscode.window.showInformationMessage(`Pulumi code generated: ${outputPath}`);
            
            // Open the generated Pulumi code
            const doc = await vscode.workspace.openTextDocument(outputPath);
            await vscode.window.showTextDocument(doc, { preview: false, viewColumn: vscode.ViewColumn.Beside });
        } else {
            vscode.window.showErrorMessage(`Failed to generate Pulumi code: ${result}`);
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Error generating Pulumi code: ${error}`);
    } finally {
        // Clean up temp script
        if (fs.existsSync(tempScriptPath)) {
            fs.unlinkSync(tempScriptPath);
        }
    }
}
