import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Execute a Python script and return the output
 */
export async function executePython(scriptPath: string): Promise<string> {
    const config = vscode.workspace.getConfiguration('iacFactory');
    const pythonPath = config.get('pythonPath', 'python3');

    try {
        const { stdout, stderr } = await execAsync(`${pythonPath} "${scriptPath}"`);
        return stdout + stderr;
    } catch (error: any) {
        throw new Error(`Python execution failed: ${error.message}`);
    }
}

/**
 * Check if iac-factory is installed
 */
export async function isIacFactoryInstalled(): Promise<boolean> {
    const config = vscode.workspace.getConfiguration('iacFactory');
    const pythonPath = config.get('pythonPath', 'python3');

    try {
        const { stdout } = await execAsync(`${pythonPath} -c "import iac_factory; print('OK')"`);
        return stdout.trim() === 'OK';
    } catch {
        return false;
    }
}

/**
 * Show a message to install iac-factory
 */
export async function promptInstallIacFactory(): Promise<void> {
    const choice = await vscode.window.showWarningMessage(
        'iac-factory is not installed. Would you like to install it?',
        'Install',
        'Cancel'
    );

    if (choice === 'Install') {
        const config = vscode.workspace.getConfiguration('iacFactory');
        const pythonPath = config.get('pythonPath', 'python3');

        const terminal = vscode.window.createTerminal('IAC Factory Installation');
        terminal.show();
        terminal.sendText(`${pythonPath} -m pip install iac-factory`);
    }
}
