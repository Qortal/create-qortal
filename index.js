#!/usr/bin/env node

import { Command } from 'commander';
import { execSync } from 'child_process';
import degit from 'degit';
import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import inquirer from 'inquirer';

const program = new Command();

const GITHUB_USERNAME = "Qortal";
const REPO_NAME = "qapp-templates"; // Single repo storing all templates

/**
 * Function to fetch available templates from GitHub repo
 */
const fetchTemplates = async () => {
  const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents`;
  try {
    const response = await fetch(url);
    const contents = await response.json();

    if (!Array.isArray(contents)) {
      throw new Error("Unexpected response format from GitHub.");
    }

    // Filter out only directories (folders inside the repo)
    return contents
      .filter(item => item.type === "dir")
      .map(item => item.name);
  } catch (error) {
    console.error("❌ Error fetching templates:", error.message);
    return [];
  }
};

/**
 * Function to sanitize project name for npm
 */
const sanitizePackageName = (name) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/[^a-z0-9-]/g, '') // Remove invalid characters
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
};

program
  .name('create-qapp')
  .description('Create a new Qortal App')
  .version('1.0.0')
  .action(async () => {
    // Ask for project name
    const { projectName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Enter the name of your app:',
        validate: input => input.trim() !== '' ? true : 'Project name cannot be empty.',
      }
    ]);

    const sanitizedProjectName = sanitizePackageName(projectName);
    if (!sanitizedProjectName) {
      console.error('❌ Error: Invalid project name. Use letters, numbers, and dashes only.');
      process.exit(1);
    }

    console.log("\n🔍 Fetching available templates...\n");
    const templates = await fetchTemplates();

    if (templates.length === 0) {
      console.error("❌ No templates found. Check your GitHub repository structure.");
      process.exit(1);
    }

    // Show template selection menu
    const { selectedTemplate } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedTemplate',
        message: 'Select a template:',
        choices: templates,
      }
    ]);

    console.log(`\n🚀 Creating project "${sanitizedProjectName}" using template "${selectedTemplate}"...\n`);
    
    const projectPath = path.resolve(process.cwd(), sanitizedProjectName);
    if (fs.existsSync(projectPath)) {
      console.error(`❌ Error: Directory "${sanitizedProjectName}" already exists.`);
      process.exit(1);
    }

    // Clone only the selected template (subdirectory)
    const repoPath = `${GITHUB_USERNAME}/${REPO_NAME}/${selectedTemplate}`;
    const emitter = degit(repoPath, { cache: false, force: true });

    try {
      await emitter.clone(projectPath);
      console.log("✅ Template cloned successfully!");

      // Modify package.json
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        packageJson.name = sanitizedProjectName;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log("📦 Updated package.json with project name.");
      }

      // Change directory before running npm install
      process.chdir(sanitizedProjectName);
      console.log("\n📦 Installing dependencies...");
      execSync(`npm install`, { stdio: 'inherit' });

      console.log(`\n🎉 Project "${sanitizedProjectName}" is ready!`);
      console.log(`\nNext steps:\n  cd ${sanitizedProjectName}\n  npm run dev`);

       // Check if VS Code is installed and open the project
       try {
        execSync('code --version', { stdio: 'ignore' }); // Check if 'code' command exists
        console.log("\n💻 Opening project in VS Code...");
        execSync(`code ${projectPath}`, { stdio: 'inherit' });
      } catch (error) {
        console.log("\n⚠️ VS Code not found or not installed. Open the project manually.");
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
      process.exit(1);
    }
  });

program.parse();
