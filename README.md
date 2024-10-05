# Prayer Timer Bangladesh Extension Documentation

## Overview

**Name**: prayer-timer-bangladesh
**Display Name**: Prayer Timer Bangladesh
**Description**: An extension to show prayer times based on GPS location in Bangladesh.
**Version**: 0.0.1
**Categories**: Other

## Requirements

- **VS Code Version**: ^1.94.0 or higher
- **Node.js**: Latest version recommended

## Activation Events

This extension activates on the following events:

- `onStartupFinished`: Activates when VS Code has finished starting.
- `onCommand:prayer-timer-bangladesh.showPrayerTimes`: Activates when the user executes the command to show prayer times.

## Main Entry Point

The main file of the extension is located at:
```
./out/extension.js
```

## Commands

The extension contributes the following command:

- **Command**: `prayer-timer-bangladesh.showPrayerTimes`
  **Title**: Display Prayer Times
  This command displays the current prayer times based on the user's GPS location.

## Scripts

The following scripts are defined in the extension:

- **vscode:prepublish**: Prepares the extension for publishing by running the `compile` script.
- **compile**: Compiles TypeScript files using `tsc` (TypeScript compiler) with the specified project configuration.
- **watch**: Watches for changes in TypeScript files and compiles them on-the-fly.
- **pretest**: Compiles the TypeScript files and lints the source code.
- **lint**: Runs ESLint to check the source code for linting errors.
- **test**: Runs the extension tests using `vscode-test`.

## Development Dependencies

The following development dependencies are included:

- **@types/mocha**: Type definitions for Mocha testing framework.
- **@types/node**: Type definitions for Node.js.
- **@types/vscode**: Type definitions for the Visual Studio Code API.
- **@typescript-eslint/eslint-plugin**: ESLint plugin for TypeScript.
- **@typescript-eslint/parser**: ESLint parser for TypeScript.
- **@vscode/test-cli**: CLI for running VS Code tests.
- **@vscode/test-electron**: Test runner for Electron-based extensions.
- **eslint**: Linter for JavaScript and TypeScript code.
- **typescript**: TypeScript compiler.

## Dependencies

The extension requires the following runtime dependency:

- **axios**: A promise-based HTTP client for making requests.

## Installation

To install the extension, clone the repository and run:

```bash
npm install
```

## Building the Extension

To build the extension, use the following command:

```bash
npm run compile
```

To watch for changes and automatically compile, use:

```bash
npm run watch
```

## Running Tests

To run tests, execute the following command:

```bash
npm run test
```

## Known Issues

- **GPS Location**: The extension may not work properly if GPS access is denied.
- **Time Zone Adjustments**: Users may need to adjust their time zone settings for accurate prayer times.

## Contribution

If you'd like to contribute to this extension, feel free to submit a pull request or open an issue.

---

### Conclusion

This documentation provides an overview of the **prayer-timer-bangladesh** extension, detailing its features, commands, and installation instructions. Be sure to keep it updated as you make changes and add new features to the extension.

Let me know if you need any further adjustments or additions!