# IAC Factory for VS Code

[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue.svg)](https://marketplace.visualstudio.com/items?itemName=iac-factory.iac-factory-vsc)

Welcome to the **IAC Factory** extension for Visual Studio Code! This extension provides a rich set of tools to streamline your workflow when using the `iac-factory` Python package. It helps you design, visualize, and generate Infrastructure as Code (IaC) with ease, directly within your editor.

`iac-factory` is a Python package that simplifies the creation of Pulumi IaC components and C4 architecture diagrams using a simple, domain-driven approach. This extension brings its powerful features into your development environment.

## Features

The IAC Factory extension offers the following key features to enhance your productivity:

### 1.  **Intelligent Code Snippets**

Quickly scaffold your infrastructure with a comprehensive set of code snippets. You can instantly generate code for:

*   **Factory Initialization**: Start a new infrastructure definition.
*   **Component Creation**: Add `Gateway`, `Container`, `Lambda`, `Cache`, `Rdms`, and `Archive` components.
*   **Connections**: Define relationships between your components.
*   **Code Generation**: Create boilerplate for generating Mermaid diagrams and Pulumi code.

![Code Snippets](https://i.imgur.com/example.gif) *(placeholder for snippet gif)*

### 2.  **Live Diagram Preview**

Visualize your infrastructure in real-time with a live Mermaid C4 diagram preview. The preview panel opens alongside your code and automatically updates as you make changes.

*   **Side-by-Side View**: See your architecture diagram evolve as you write code.
*   **Auto-Refresh**: The diagram is automatically regenerated on file save.
*   **Configurable Themes**: Choose from `default`, `dark`, `forest`, and `neutral` themes.

![Diagram Preview](https://i.imgur.com/example.png) *(placeholder for preview image)*

### 3.  **Component Explorer**

Navigate your infrastructure with ease using the Component Explorer tree view. This panel, located in the Explorer sidebar, provides a structured overview of your components, grouped by domain.

*   **Hierarchical View**: See all components organized by their domain (`Public`, `Web`, `Application`, `Data`).
*   **Quick Navigation**: Easily identify and locate component definitions in your code.
*   **Refresh on Demand**: Manually refresh the tree to reflect the latest changes.

![Component Explorer](https://i.imgur.com/example.png) *(placeholder for tree view image)*

### 4.  **One-Click Code Generation**

Generate your final Mermaid diagram and Pulumi code with a single click. The extension provides commands to:

*   **Generate Mermaid Diagram**: Creates a Markdown file (`architecture_diagram.md`) with the C4 diagram.
*   **Generate Pulumi Code**: Creates a Python file (`__main__.py`) ready for use with Pulumi.

These commands can be accessed from the editor context menu or the command palette.

## Installation

Follow these steps to install and configure the IAC Factory extension.

### Prerequisites

Before you begin, ensure you have the following installed:

1.  **Visual Studio Code**: Version 1.75 or higher.
2.  **Python**: Version 3.8 or higher.
3.  **`iac-factory` Python Package**: The core package that this extension relies on.

If you don\'t have `iac-factory` installed, you can install it via pip:

```bash
python3 -m pip install iac-factory
```

### Installation from VSIX

Since this is a custom-built extension, you will need to install it from the `.vsix` file provided.

1.  **Download the VSIX file**: Get the `iac-factory-vsc-1.0.0.vsix` file.
2.  **Open VS Code**.
3.  Go to the **Extensions** view (Ctrl+Shift+X).
4.  Click the **...** (More Actions) menu in the top-right corner of the Extensions view.
5.  Select **Install from VSIX...**
6.  Locate and select the `iac-factory-vsc-1.0.0.vsix` file.
7.  Reload VS Code when prompted.

## Quick Start: Example Workflow

Let\'s walk through an example of how to use the extension to define a simple web application architecture.

### 1. Create a Python File

Create a new file named `my_app.py`.

### 2. Use Code Snippets

In the new file, start typing `iacexample` and press Enter to insert the complete example snippet. This will generate a basic infrastructure with a gateway, web app, API service, and database.

Your code will look like this:

```python
from iac_factory import IacFactory, Gateway, Container, Rdms, Cache

# Initialize factory
factory = IacFactory(name="My Infrastructure")

# Define components
api_gateway = Gateway("API Gateway", domain_type="Public", technology="AWS API Gateway")
web_app = Container("Web App", domain_type="Web", technology="React")
api_service = Container("API Service", domain_type="Application", technology="Node.js")
database = Rdms("Database", domain_type="Data", technology="PostgreSQL")

# Add components
factory.add_component(api_gateway)
factory.add_component(web_app)
factory.add_component(api_service)
factory.add_component(database)

# Define connections
factory.add_connection(web_app, api_gateway, "Makes API calls", "HTTPS")
factory.add_connection(api_gateway, api_service, "Routes requests", "HTTP")
factory.add_connection(api_service, database, "Queries data", "SQL")

# Generate outputs
factory.save_mermaid_diagram("architecture.md")
factory.save_pulumi_code("infrastructure.py")
```

### 3. Preview the Diagram

Open the Command Palette (Ctrl+Shift+P) and run **IAC Factory: Preview Diagram**. A new panel will open to the side, displaying the Mermaid C4 diagram of your infrastructure.

### 4. Explore Components

Open the Explorer sidebar and look for the **IAC Factory Components** view. You will see your components neatly organized by domain.

### 5. Generate Code

Right-click anywhere in the editor and select **IAC Factory: Generate Mermaid Diagram**. This will create an `architecture_diagram.md` file. Do the same for **IAC Factory: Generate Pulumi Code** to get your `__main__.py` file.

## Configuration

You can customize the extension\'s behavior via the VS Code settings:

*   `iacFactory.autoPreview` (boolean, default: `false`): Automatically open the diagram preview for files containing `iac-factory` code.
*   `iacFactory.pythonPath` (string, default: `python3`): Path to the Python interpreter to use for running `iac-factory` scripts.
*   `iacFactory.diagramTheme` (string, default: `default`): The theme for the Mermaid diagram preview. Options: `default`, `dark`, `forest`, `neutral`.

## Contributing

This project is open-source and contributions are welcome. Please feel free to submit issues or pull requests on the [GitHub repository](https://github.com/magenticmarketactualskill/iac-factory-vsc).

## License

This extension is licensed under the MIT License.
