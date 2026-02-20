import * as vscode from 'vscode';
import * as fs from 'fs';
// Import the native prayerTimeService which returns getPrayerTimes function (make sure we export/import it correctly)
import { getPrayerTimes } from '../src/utils/prayerTimeService.js';
// We also need formatPrayerTime to display 12hr vs 24hr format
import { formatPrayerTime } from '../src/utils/helpers.js';

let myStatusBarItem;
let prayerTimerInterval;
let myContext;
let lastAnnouncedPrayer = null;
let lastRamadanState = null;

export function activate(context) {
    myContext = context;

    // 1. Create the Status Bar Item
    myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    context.subscriptions.push(myStatusBarItem);

    // Initial default text before webview sends state
    myStatusBarItem.text = `$(clock) PrayerTime: Pending`;
    myStatusBarItem.show();

    // Start background timer immediately if we have cached config
    startBackgroundTimer();

    // 2. Register the Webview Panel Command
    let disposable = vscode.commands.registerCommand('prayer-time.open', () => {
        const panel = vscode.window.createWebviewPanel(
            'prayerTime',
            'Prayer Time',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'dist')]
            }
        );

        const htmlPath = vscode.Uri.joinPath(context.extensionUri, 'dist', 'index.html');
        
        try {
            let html = fs.readFileSync(htmlPath.fsPath, 'utf8');

            // Add <base> tag to correctly resolve relative assets in webview
            const distUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'dist'));
            
            html = html.replace(
                '<head>',
                `<head>\n    <base href="${distUri}/">`
            );

            panel.webview.html = html;

            // 3. Listen for Messages from the Webview (React App)
            panel.webview.onDidReceiveMessage(
                message => {
                    switch (message.command) {
                        case 'updateStatus':
                            // Realtime UI updates directly from the Webview
                            updateStatusBarItem(message.data);
                            return;
                        case 'saveSettings':
                            // Webview sent settings, save them to globalState
                            const { location, settings } = message.data;
                            if (location && settings) {
                                myContext.globalState.update('pt_location', location);
                                myContext.globalState.update('pt_settings', settings);
                                // Restart timer with new settings
                                startBackgroundTimer();
                            }
                            return;
                    }
                },
                undefined,
                context.subscriptions
            );

        } catch (error) {
            vscode.window.showErrorMessage('Failed to load Prayer Time webview. Have you built the extension?');
            console.error(error);
        }
    });

    context.subscriptions.push(disposable);
}

// ----------------------------------------------------------------------------
// Autonomous Background Timer Logic
// ----------------------------------------------------------------------------
function startBackgroundTimer() {
    if (prayerTimerInterval) {
        clearInterval(prayerTimerInterval);
    }

    // Default to Dhaka, Bangladesh (as requested by the extension branding)
    const defaultLocation = { name: "Dhaka", lat: 23.8103, lng: 90.4125 };
    const defaultSettings = {
        method: 3, // Muslim World League
        school: 1, // Hanafi
        midnightMode: 0, // Standard
        latitudeAdjustmentMethod: 3, // Angle Based
        timeFormat: "12hr"
    };

    const location = myContext.globalState.get('pt_location') || defaultLocation;
    const settings = myContext.globalState.get('pt_settings') || defaultSettings;

    // Run the cycle immediately
    cacheNextPrayerLoop(location, settings);

    // Then interval every 1 second
    prayerTimerInterval = setInterval(() => {
        cacheNextPrayerLoop(location, settings);
    }, 1000);
}

function cacheNextPrayerLoop(location, settings) {
    // 1. Get raw prayer times natively via adhan
    const data = getPrayerTimes(location, settings, new Date());
    if (!data) return;

    const timings = data.timings;
    const now = new Date();
    
    // Parse time directly into Date objects for absolute accurate millisecond math
    const parseAdhanTime = (timeStr, offsetDays = 0) => {
        if (!timeStr) return null;
        const [h, m] = timeStr.split(":").map(Number);
        const d = new Date(now);
        d.setHours(h, m, 0, 0);
        d.setDate(d.getDate() + offsetDays);
        return d;
    };

    const prayerOrder = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
    let nextPrayerName = "Fajr";
    let targetDate = parseAdhanTime(timings["Fajr"], 1); // Default to tomorrow's Fajr
    let currentPrayerName = "Isha";

    // Standard Next Prayer detection
    for (let i = 0; i < prayerOrder.length; i++) {
        const prayer = prayerOrder[i];
        const pTime = parseAdhanTime(timings[prayer]);
        
        if (pTime && now < pTime) {
            nextPrayerName = prayer;
            targetDate = pTime;
            currentPrayerName = i > 0 ? prayerOrder[i - 1] : "Isha";
            break;
        }
    }

    // -- NOTIFICATIONS LOGIC --
    if (lastAnnouncedPrayer && lastAnnouncedPrayer !== currentPrayerName) {
        if (currentPrayerName === "Sunrise") {
            vscode.window.showInformationMessage("Fajr time has ended.");
        } else if (lastAnnouncedPrayer === "Sunrise") {
            vscode.window.showInformationMessage(`${currentPrayerName} time has started.`);
        } else {
            vscode.window.showInformationMessage(`${lastAnnouncedPrayer} time has ended. ${currentPrayerName} time has started.`);
        }
    }
    lastAnnouncedPrayer = currentPrayerName;

    // --- RAMADAN OVERRIDE ---
    let displayPrayer = currentPrayerName === "Sunrise" ? "Salatud Doha" : currentPrayerName;
    
    if (settings.ramadanMode) {
        const fajrTime = parseAdhanTime(timings["Fajr"]);
        const maghribTime = parseAdhanTime(timings["Maghrib"]);
        
        const isFasting = (now >= fajrTime && now < maghribTime);

        if (lastRamadanState !== null && lastRamadanState !== isFasting) {
            if (isFasting) {
                vscode.window.showInformationMessage("Sehri time has ended! Fasting has begun.");
            } else {
                vscode.window.showInformationMessage("It's time for Iftar! Fasting has ended.");
            }
        }
        lastRamadanState = isFasting;

        if (isFasting) {
            // Fasting (Day)
            displayPrayer = "Iftar";
            targetDate = maghribTime;
        } else {
            // Eating (Night)
            displayPrayer = "Sehri";
            if (now >= maghribTime) {
                targetDate = parseAdhanTime(timings["Fajr"], 1); // Tomorrow's Fajr
            } else {
                targetDate = fajrTime; // Today's Fajr (it's past midnight)
            }
        }
    }

    // 2. Calculate remaining time to target
    const msRemaining = targetDate.getTime() - now.getTime();
    if (msRemaining <= 0) {
        return; // Boundary crossover
    }

    const totalSecs = Math.floor(msRemaining / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);

    let formattedRemaining = "";
    if (hrs > 0) formattedRemaining += `${hrs}h `;
    formattedRemaining += `${mins}m`;

    // Build Markdown Tooltip List
    let mdList = `**Today's Prayers (${location.name || 'Local'})**\n\n`;
    
    if (settings.ramadanMode) {
         mdList = `**Ramadan Mode (${location.name || 'Local'})**\n\n`;
         const sehriStr = formatPrayerTime(timings["Fajr"], settings.timeFormat);
         const iftarStr = formatPrayerTime(timings["Maghrib"], settings.timeFormat);
         mdList += `${displayPrayer === "Sehri" ? '▶ **' : ''}Sehri: ${sehriStr}${displayPrayer === "Sehri" ? '**' : ''}\n\n`;
         mdList += `${displayPrayer === "Iftar" ? '▶ **' : ''}Iftar: ${iftarStr}${displayPrayer === "Iftar" ? '**' : ''}\n\n`;
         mdList += `---\n\n`;
    }

    prayerOrder.forEach(p => {
        if (timings[p]) {
            const timeStr = formatPrayerTime(timings[p], settings.timeFormat);
            const isCurrent = (!settings.ramadanMode && p === currentPrayerName);
            mdList += `${isCurrent ? '▶ **' : ''}${p === "Sunrise" ? "Salatud Doha" : p}: ${timeStr}${isCurrent ? '**' : ''}\n\n`;
        }
    });

    // Fire UI Update!
    updateStatusBarItem({
        currentPrayer: displayPrayer,
        remainingTimeFormatted: formattedRemaining,
        prayerListMarkdown: mdList
    });
}

// ----------------------------------------------------------------------------
// Generic UI Updater
// ----------------------------------------------------------------------------
function updateStatusBarItem(data) {
    if (!data) return;

    const { currentPrayer, remainingTimeFormatted, prayerListMarkdown } = data;

    if (currentPrayer && remainingTimeFormatted) {
        myStatusBarItem.text = `$(watch) ${currentPrayer} in ${remainingTimeFormatted}`;
        const mdString = new vscode.MarkdownString(prayerListMarkdown);
        mdString.isTrusted = true;
        myStatusBarItem.tooltip = mdString;
        myStatusBarItem.show();
    } else {
        myStatusBarItem.text = `$(watch) PrayerTime: Calculating...`;
    }
}

export function deactivate() {
    if (prayerTimerInterval) {
        clearInterval(prayerTimerInterval);
    }
}
