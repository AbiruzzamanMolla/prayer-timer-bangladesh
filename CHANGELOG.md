# Change Log

All notable changes to the **[Prayer Timer Bangladesh](https://marketplace.visualstudio.com/items?itemName=azmolla.prayer-timer-bangladesh)** extension will be documented here.

# Changelog


## [1.2.2] - 2024-11-03
### Fixed
- Translations changed


## [1.2.0-1] - 2024-10-31
### Added
- Added Prayer end time notification before 10 minutes

### Fixed (1.2.1)
- Fixed Notification issue

## [1.1.7-8-9] - 2024-10-22
### Fixed
- Fully Multilanguage text and times 

## [1.1.5-6] - 2024-10-22
### Fixed
- Fix Jamat Timer issue

## [1.1.4] - 2024-10-22
### Added 
- add active inactive settings for notification using tab

### Change
- updated hadith notification 

### Fix
- translation issue

## [1.1.3] - 2024-10-20
### Added
- Show Jamat time in all prayer time table

## [1.1.2] - 2024-10-20
### Added
- Now Both time will be shown on command and on click the status bar timer

## [1.1.1] - 2024-10-19
### Fixed
- Update document

## [1.1.0] - 2024-10-19
### Fixed
- Fixed Bootstrap design for IFB table

## [1.0.9] - 2024-10-19
### Added
- Added Islamic Foundation Prayer Timer


## [1.0.8] - 2024-10-17
### Added
- Added popup window notification for prayer.

## [1.0.7] - 2024-10-16
### Fixed
- All Prayer times issues

## [1.0.6] - 2024-10-16
### Fixed
- Magrib Prayer Time issue

## [1.0.5] - 2024-10-16
### Added
- Prayer Jamat/congregation notifications
- Active Jamat notifications from settings

## [1.0.4] - 2024-10-14
### Added
- Store Prayer time to local storage.

### Fixed
- Location missing issue fixed.

## [1.0.3] - 2024-10-14
### Fixed
- removed text "Prayer Timer:"

## [1.0.2] - 2024-10-13
### Fixed
- update status bar timer every 60 sec.

## [1.0.1] - 2024-10-13
### Added
- Emoji and Icon in status bar
- Changed Extention Icon

## [1.0.0] - 2024-10-12
### Added
- Multi-Language Support (English & Bangla)
- New command: "Show Random Hadith" to manually trigger a hadith notification.
- Hadith notifications: Display hadith related to prayer times five minutes before each prayer.
- Support for configuring GPS coordinates with default values for latitude and longitude.
- Timezone setting defaulted to `Asia/Dhaka`.
- Option to customize the position of the time display in the status bar (`left` or `right`).
- Option to toggle the visibility of prayer times in the status bar.
- Icon for the extension.

### Changed
- Adjusted the text in the status bar to indicate the remaining time for Isha as "Isha (time Awaal wakth left)".
- Improved notification logic: Notifications for prayer times have been refined to provide accurate remaining time messages.
- Updated hadith data structure in `hadith.json`.

### Fixed
- Error handling for cases when no hadiths are loaded.
- Corrected status messages to reflect accurate prayer times based on the current clock.
- Fixed the behavior during the prohibited time between Asr End and Maghrib, displaying a message indicating that prayer is prohibited and the remaining time until Maghrib (e.g., `Prohibited Time: No prayer (Maghrib in 25m)`).
- Proper initialization of commands upon startup.
- Corrected prayer time display based on GPS coordinates.

### Improved
- Enhanced the display format for currently active prayer time to show remaining time (e.g., `Prayer Time: Asr (2h 30m left)`).
- Optimized the logic for calculating and displaying the currently active prayer time and its remaining duration.
- Refactored relevant functions for better clarity and maintainability.

## [0.4.202420125-6-7-8-9] - 2024-10-12
### Added
- New command: "Show Random Hadith" to manually trigger a hadith notification.
- Error handling for cases when no hadiths are loaded.

## [0.4.202420063] - 2024-10-06
### Added
- **Hadith Notifications**: Display hadith related to prayer times five minutes before each prayer.
- **Midnight Handling**: Updated Isha and Tahajjud timings to be displayed until the next Fajr.

### Changed
- **Status Bar Display**: Adjusted the text to indicate the remaining time for Isha as "Isha (time Awaal wakth left)".
- **Configuration Options**: Updated hadith data structure in `hadith.json`.

### Fixed
- **Time Management Issues**: Corrected status messages to reflect accurate prayer times based on the current clock.


## Changelog for Version 0.3.5

- **Enhanced Status Bar Behavior**: Fixed the issue where the status bar incorrectly displayed that Isha time was over until Sehri. Now, it shows the time remaining until Sehri if it's after Isha.
- **Improved Notification Logic**: Notifications for prayer times have been refined to provide accurate remaining time messages.
- **Hadith Integration**: Added a feature to display hadith notifications 5 minutes before each prayer time, with hadiths stored in `hadith.json`.


### Changelog for Version 0.3.4
- **New Feature**: Added a notification to display a random hadith related to prayer 5 minutes before each prayer time.
- **Data Storage**: Introduced a `hadith.json` file to store hadiths and their references.
- **Dependency Update**: Included the `fs` module for reading JSON files.
- **Error Handling**: Added error handling for loading and parsing hadiths.
- **Code Optimization**: Refactored relevant functions for better clarity and maintainability.


## [0.3.2] - 2024-10-06

### Fixed
- Updated Version Number

## [0.3.2] - 2024-10-06

### Added
- Enhanced the display format for currently active prayer time to show remaining time (e.g., `Prayer Time: Asr (2h 30m left)`).

### Fixed
- Corrected the behavior during the **prohibited time** between **Asr End** and **Maghrib**. Now the extension displays a message indicating that **prayer is prohibited** and the remaining time until **Maghrib** (e.g., `Prohibited Time: No prayer (Maghrib in 25m)`).

### Improved
- Optimized the logic for calculating and displaying the **currently active prayer time** and its remaining duration.

## [0.3.1] - 2024-10-06

### Added
- Updated status bar to show the currently active prayer along with the remaining time until the next prayer.

## [0.2.4] - 2024-10-05

### Added
- Update Documentation
- Update Changelog
- Add Homepage Link

## [0.2.3] - 2024-10-05

### Added
- Icon for the extension.

## [0.2.2] - 2024-10-05

### Added
- Support for configuring GPS coordinates with default values for latitude and longitude.
- Timezone setting defaulted to `Asia/Dhaka`.
- Option to customize the position of the time display in the status bar (`left` or `right`).
- Option to toggle the visibility of prayer times in the status bar.

### Fixed
- Proper initialization of commands upon startup.
- Corrected prayer time display based on GPS coordinates.

## [0.1.0] - 2024-10-05

### Added
- Basic framework for the extension.
- Setup of configuration files and dependencies.
- Preliminary testing for functionality.

## [Beta]

### Added
- Initial release of the Prayer Timer Bangladesh extension.
- Feature to display prayer times based on GPS location.
- Commands to display current prayer times and show all prayer times.
- Configuration options for latitude, longitude, timezone, display position, and visibility in the status bar.

---

For more details on changes, visit the [GitHub repository](https://github.com/abiruzzamanmolla/prayer-timer-bangladesh).
