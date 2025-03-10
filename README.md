# create-qapp

🚀 **Create Qortal Apps Easily**

`create-qapp` is a CLI tool to quickly scaffold a new Qortal application using predefined templates. It fetches templates from a central GitHub repository and automates setup, including dependency installation and project initialization.

## Features
- 🏗 **Quick project setup** using pre-defined templates.
- 🔍 **Fetches available templates** from the GitHub repository dynamically.
- 📦 **Installs dependencies** automatically.
- 🛠 **Auto-opens the project** in VS Code (if installed).
- 📜 **Sanitizes project names** to ensure compatibility with npm.

---

## Installation

Ensure you have [Node.js](https://nodejs.org/) installed, then install globally:

```sh
npm install -g create-qapp
```

---

## Usage

Run the CLI command:

```sh
create-qapp
```

Follow the prompts:
1. **Enter your app name** (e.g., `my-qortal-app`).
2. **Select a template** from the available options.
3. The tool **clones the template**, **installs dependencies**, and **sets up your project**.
4. **If VS Code is installed, it will open your project automatically.**

Once created, navigate to your project folder and start the development server:

## Requirements
- Node.js (v20+ recommended)
- npm or yarn
- Git
- VS Code (optional, for auto-opening the project)


