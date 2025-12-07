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
exports.previewDiagram = previewDiagram;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const helpers_1 = require("../utils/helpers");
let currentPanel = undefined;
async function previewDiagram(context) {
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
    // Create a temporary Python script to get the diagram
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
        if hasattr(obj, 'generate_mermaid_diagram'):
            factory = obj
            break
    
    if factory:
        diagram = factory.generate_mermaid_diagram()
        print("DIAGRAM_START")
        print(diagram)
        print("DIAGRAM_END")
    else:
        print("ERROR: No IacFactory instance found")
except Exception as e:
    print(f"ERROR: {str(e)}")
`;
    const tempScriptPath = path.join(currentDir, '.iac_temp_preview.py');
    fs.writeFileSync(tempScriptPath, tempScript);
    try {
        const result = await (0, helpers_1.executePython)(tempScriptPath);
        const startIndex = result.indexOf('DIAGRAM_START');
        const endIndex = result.indexOf('DIAGRAM_END');
        if (startIndex !== -1 && endIndex !== -1) {
            const diagram = result.substring(startIndex + 'DIAGRAM_START'.length, endIndex).trim();
            // Create or show the webview panel
            if (currentPanel) {
                currentPanel.reveal(vscode.ViewColumn.Beside);
            }
            else {
                currentPanel = vscode.window.createWebviewPanel('iacFactoryPreview', 'IAC Factory Diagram Preview', vscode.ViewColumn.Beside, {
                    enableScripts: true,
                    retainContextWhenHidden: true
                });
                currentPanel.onDidDispose(() => {
                    currentPanel = undefined;
                }, null, context.subscriptions);
            }
            // Get theme
            const config = vscode.workspace.getConfiguration('iacFactory');
            const theme = config.get('diagramTheme', 'default');
            // Update the webview content
            currentPanel.webview.html = getWebviewContent(diagram, theme);
        }
        else {
            vscode.window.showErrorMessage(`Failed to generate diagram preview: ${result}`);
        }
    }
    catch (error) {
        vscode.window.showErrorMessage(`Error generating diagram preview: ${error}`);
    }
    finally {
        // Clean up temp script
        if (fs.existsSync(tempScriptPath)) {
            fs.unlinkSync(tempScriptPath);
        }
    }
}
function getWebviewContent(diagram, theme) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IAC Factory Diagram</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            font-family: var(--vscode-font-family);
            overflow: auto;
        }
        #diagram-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .mermaid {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div id="diagram-container">
        <div class="mermaid">
${diagram}
        </div>
    </div>
    <script>
        mermaid.initialize({ 
            startOnLoad: true,
            theme: '${theme}',
            securityLevel: 'loose'
        });
    </script>
</body>
</html>`;
}
//# sourceMappingURL=previewDiagram.js.map