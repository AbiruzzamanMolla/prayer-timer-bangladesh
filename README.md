
# Prayer Timer Bangladesh Documentation

## Overview

**Prayer Timer Bangladesh** is a Visual Studio Code extension that displays prayer times based on the user's GPS location in Bangladesh. The extension provides quick access to prayer times directly from the editor, enhancing productivity and ensuring timely prayers.

### Features

- Displays current prayer times based on GPS coordinates.
- Supports multiple commands to show specific or all prayer times.
- Configurable settings for latitude, longitude, timezone, display position, and visibility in the status bar.

## Installation

1. **Prerequisites**: Ensure you have [Visual Studio Code](https://code.visualstudio.com/) version 1.94.0 or higher installed.
2. **Install via Marketplace**:
   - Open Visual Studio Code.
   - Navigate to the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window.
   - Search for **Prayer Timer Bangladesh** and click **Install**.

3. **Install from Source**:
   - Clone the repository:
     ```bash
     git clone https://github.com/AbiruzzamanMolla/prayer-timer-bangladesh.git
     ```
   - Navigate to the cloned directory:
     ```bash
     cd prayer-timer-bangladesh
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Compile the TypeScript files:
     ```bash
     npm run compile
     ```
   - Launch the extension in the Extension Development Host:
     ```bash
     npm run watch
     ```

## Usage

### Commands

- **Display Prayer Times**
  - Command: `prayer-timer-bangladesh.showPrayerTimes`
  - Description: Displays the current prayer times in the status bar.

- **Show All Prayer Times**
  - Command: `prayer-timer-bangladesh.showAllPrayerTimes`
  - Description: Shows a detailed list of all prayer times.

### Activation

The extension activates upon the following events:
- When Visual Studio Code starts.
- When the command `prayer-timer-bangladesh.showPrayerTimes` is executed.

## Configuration

To customize the extension settings, navigate to the settings.json file and add the following configurations:

```json
"prayerTimerBangladesh.lat": 24.0298,  // Latitude for prayer times (default: 24.0298)
"prayerTimerBangladesh.lng": 90.7061,  // Longitude for prayer times (default: 90.7061)
"prayerTimerBangladesh.tzname": "Asia/Dhaka",  // Timezone name for prayer times (default: Asia/Dhaka)
"prayerTimerBangladesh.position": "right",  // Position of the time display in the status bar (default: right)
"prayerTimerBangladesh.active": true  // Whether to show the prayer time in the status bar (default: true)
```

### Settings Breakdown

| Setting                            | Type    | Default Value  | Description                                          |
|------------------------------------|---------|----------------|------------------------------------------------------|
| `prayerTimerBangladesh.lat`        | number  | 24.0298        | Latitude for prayer times.                           |
| `prayerTimerBangladesh.lng`        | number  | 90.7061        | Longitude for prayer times.                          |
| `prayerTimerBangladesh.tzname`     | string  | Asia/Dhaka     | Timezone name for prayer times.                      |
| `prayerTimerBangladesh.position`   | string  | right          | Position of the time display in the status bar.     |
| `prayerTimerBangladesh.active`     | boolean | true           | Whether to show the prayer time in the status bar.  |

## Development

### Prerequisites

- Node.js (version 14 or higher)
- Visual Studio Code (version 1.94.0 or higher)

### Scripts

- **Compile**: Compiles the TypeScript files.
  ```bash
  npm run compile
  ```

- **Watch**: Automatically recompiles TypeScript files when changes are made.
  ```bash
  npm run watch
  ```

- **Lint**: Runs ESLint to check for code quality and style.
  ```bash
  npm run lint
  ```

- **Test**: Runs tests using the Visual Studio Code test framework.
  ```bash
  npm run test
  ```

### Repository

For more details or to contribute, please visit the repository:

[Prayer Timer Bangladesh GitHub Repository](https://github.com/AbiruzzamanMolla/prayer-timer-bangladesh.git)

## Dependencies

This extension relies on the following packages:
- `axios`: For making HTTP requests to fetch prayer times.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Acknowledgments

Thanks to all contributors and users for their support and feedback.

---

Feel free to modify any section to suit your needs or add more details as necessary. This document should give users a comprehensive understanding of how to install, use, and contribute to your extension.