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
exports.executePython = executePython;
exports.isIacFactoryInstalled = isIacFactoryInstalled;
exports.promptInstallIacFactory = promptInstallIacFactory;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Execute a Python script and return the output
 */
async function executePython(scriptPath) {
    const config = vscode.workspace.getConfiguration('iacFactory');
    const pythonPath = config.get('pythonPath', 'python3');
    try {
        const { stdout, stderr } = await execAsync(`${pythonPath} "${scriptPath}"`);
        return stdout + stderr;
    }
    catch (error) {
        throw new Error(`Python execution failed: ${error.message}`);
    }
}
/**
 * Check if iac-factory is installed
 */
async function isIacFactoryInstalled() {
    const config = vscode.workspace.getConfiguration('iacFactory');
    const pythonPath = config.get('pythonPath', 'python3');
    try {
        const { stdout } = await execAsync(`${pythonPath} -c "import iac_factory; print('OK')"`);
        return stdout.trim() === 'OK';
    }
    catch {
        return false;
    }
}
/**
 * Show a message to install iac-factory
 */
async function promptInstallIacFactory() {
    const choice = await vscode.window.showWarningMessage('iac-factory is not installed. Would you like to install it?', 'Install', 'Cancel');
    if (choice === 'Install') {
        const config = vscode.workspace.getConfiguration('iacFactory');
        const pythonPath = config.get('pythonPath', 'python3');
        const terminal = vscode.window.createTerminal('IAC Factory Installation');
        terminal.show();
        terminal.sendText(`${pythonPath} -m pip install iac-factory`);
    }
}
//# sourceMappingURL=helpers.js.map