import * as vscode from 'vscode';
import axios from 'axios';

const apiUrl = 'https://salat.habibur.com/api/?lat=24.0298&lng=90.7061&tzoffset=360&tzname=Asia/Dhaka';

let prayerTimesStatusBar: vscode.StatusBarItem;
let prayerAlarmTimeouts: NodeJS.Timeout[] = [];
let allPrayerTimes: { short: string; secs: number }[] = []; // To store all prayer times

export function activate(context: vscode.ExtensionContext) {
    // Register the command to show prayer times
    const showPrayerTimesCommand = vscode.commands.registerCommand('prayer-timer-bangladesh.showPrayerTimes', async () => {
        await fetchPrayerTimes();
    });

    // Register the command to show all prayer times
    const showAllPrayerTimesCommand = vscode.commands.registerCommand('prayer-timer-bangladesh.showAllPrayerTimes', () => {
        showAllPrayerTimes();
    });

    context.subscriptions.push(showPrayerTimesCommand);
    context.subscriptions.push(showAllPrayerTimesCommand);

    // Initialize status bar
    prayerTimesStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    context.subscriptions.push(prayerTimesStatusBar);

    // Automatically load prayer times on startup
    vscode.commands.executeCommand('prayer-timer-bangladesh.showPrayerTimes');
}

async function fetchPrayerTimes() {
    try {
        const response = await axios.get(apiUrl);
        const prayerTimes = response.data.data;

        const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        allPrayerTimes = [
            { short: prayerTimes.fajar18.short, secs: prayerTimes.fajar18.secs },
            { short: prayerTimes.noon.short, secs: prayerTimes.noon.secs },
            { short: prayerTimes.asar1.short, secs: prayerTimes.asar1.secs },
            { short: prayerTimes.magrib12.short, secs: prayerTimes.magrib12.secs },
            { short: prayerTimes.esha.short, secs: prayerTimes.esha.secs },
        ];

        // Display only the current prayer time in the status bar
        const currentPrayer = getCurrentPrayer(prayerNames, allPrayerTimes);
        if (currentPrayer) {
            updatePrayerTimesStatusBar(currentPrayer.name, currentPrayer.time);
        }

        // Set alarms for the prayer times
        setPrayerAlarms(allPrayerTimes);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to fetch prayer times: ${error}`);
    }
}

function showAllPrayerTimes() {
    const message = allPrayerTimes.map(p => p.short).join('\n'); // Join all prayer times with a newline for display
    vscode.window.showInformationMessage(`Prayer Times:\n${message}`, { modal: true }); // Show all times in an information message
}

function getCurrentPrayer(prayerNames: string[], prayerTimes: { short: string; secs: number }[]) {
    const currentTimeInSecs = Math.floor(new Date().getTime() / 1000); // Current time in seconds

    // Loop through the prayer times and find the next one
    for (let i = 0; i < prayerTimes.length; i++) {
        const prayerTimeInSecs = prayerTimes[i].secs; // Get the prayer time in seconds

        // Check if the current time is before the next prayer time
        if (prayerTimeInSecs > currentTimeInSecs) {
            return { name: prayerNames[i], time: prayerTimes[i].short };
        }
    }

    // If no prayer is upcoming, return the last prayer
    return { name: prayerNames[prayerNames.length - 1], time: prayerTimes[prayerTimes.length - 1].short };
}

function updatePrayerTimesStatusBar(prayerName: string, prayerTime: string) {
    prayerTimesStatusBar.text = `${prayerName}: ${prayerTime}`;
    prayerTimesStatusBar.tooltip = 'Click to see all prayer times';
    prayerTimesStatusBar.command = 'prayer-timer-bangladesh.showAllPrayerTimes'; // Link the command to the status bar item
    prayerTimesStatusBar.show();
}

function setPrayerAlarms(prayerTimes: { short: string; secs: number }[]) {
    // Clear previous alarms
    prayerAlarmTimeouts.forEach(timeout => clearTimeout(timeout));
    prayerAlarmTimeouts = [];

    const currentTimeInSecs = Math.floor(new Date().getTime() / 1000);

    for (let prayer of prayerTimes) {
        const prayerTimeInSecs = prayer.secs;

        if (prayerTimeInSecs > currentTimeInSecs) {
            const timeUntilAlarm = prayerTimeInSecs - currentTimeInSecs;

            const timeout = setTimeout(() => {
                vscode.window.showInformationMessage(`It's time for prayer! (${prayer.short})`);
            }, timeUntilAlarm * 1000); // Convert seconds to milliseconds

            prayerAlarmTimeouts.push(timeout);
        }
    }
}

export function deactivate() {
    prayerTimesStatusBar.hide();
    prayerAlarmTimeouts.forEach(timeout => clearTimeout(timeout));
}