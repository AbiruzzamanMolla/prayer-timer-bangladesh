import * as vscode from "vscode";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";

// Default configuration keys
const CONFIG_KEY_LAT = "prayerTimerBangladesh.lat";
const CONFIG_KEY_LNG = "prayerTimerBangladesh.lng";
const CONFIG_KEY_TZNAME = "prayerTimerBangladesh.tzname";
const CONFIG_KEY_POSITION = "prayerTimerBangladesh.position";
const CONFIG_KEY_ACTIVE = "prayerTimerBangladesh.active";

let prayerTimesStatusBar: vscode.StatusBarItem;
let prayerAlarmTimeouts: NodeJS.Timeout[] = [];
let allPrayerTimes: string[] = []; // To store all prayer times
let prayerTimes: any; // To store all prayer data
let locationInfo: any; // To store all prayer data
let hadiths: any[] = []; // To store hadiths

export function activate(context: vscode.ExtensionContext) {
  loadHadiths(); // Load hadiths on activation

  const showPrayerTimesCommand = vscode.commands.registerCommand(
    "prayer-timer-bangladesh.showPrayerTimes",
    async () => {
      await fetchPrayerTimes();
    }
  );

  const showAllPrayerTimesCommand = vscode.commands.registerCommand(
    "prayer-timer-bangladesh.showAllPrayerTimes",
    () => {
      showAllPrayerTimes();
    }
  );

  context.subscriptions.push(showPrayerTimesCommand);
  context.subscriptions.push(showAllPrayerTimesCommand);

  const position = vscode.workspace
    .getConfiguration()
    .get<string>(CONFIG_KEY_POSITION);
  prayerTimesStatusBar = vscode.window.createStatusBarItem(
    position === "left"
      ? vscode.StatusBarAlignment.Left
      : vscode.StatusBarAlignment.Right,
    100
  );
  context.subscriptions.push(prayerTimesStatusBar);

  vscode.commands.executeCommand("prayer-timer-bangladesh.showPrayerTimes");
}

async function fetchPrayerTimes() {
  try {
    const lat = vscode.workspace.getConfiguration().get<number>(CONFIG_KEY_LAT);
    const lng = vscode.workspace.getConfiguration().get<number>(CONFIG_KEY_LNG);
    const tzname = vscode.workspace
      .getConfiguration()
      .get<string>(CONFIG_KEY_TZNAME);

    const apiUrl = `https://salat.habibur.com/api/?lat=${lat}&lng=${lng}&tzoffset=360&tzname=${tzname}`;

    const response = await axios.get(apiUrl);
    prayerTimes = response.data.data;

    const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

    allPrayerTimes = [
      `${prayerTimes.fajar18.short}`,
      `${prayerTimes.noon.short}`,
      `${prayerTimes.asar1.short}`,
      `${prayerTimes.asar2.short}`,
      `${prayerTimes.magrib12.short}`,
      `${prayerTimes.esha.short}`,
    ];

    locationInfo = {
      location: response.data.tzname,
      name: response.data.name,
    };

    const isActive = vscode.workspace
      .getConfiguration()
      .get<boolean>(CONFIG_KEY_ACTIVE);
    if (isActive) {
      const currentPrayer = getCurrentPrayer(prayerNames, allPrayerTimes);
      if (currentPrayer) {
        updatePrayerTimesStatusBar(
          currentPrayer.name,
          currentPrayer.time,
          currentPrayer.remainingTime
        );

        // Show hadith notification 5 minutes before the current prayer time
        const currentTime = new Date();
        const prayerTimeDate = new Date(currentPrayer.time); // Convert prayer time string to Date
        const timeDiff = prayerTimeDate.getTime() - currentTime.getTime();
        if (timeDiff <= 5 * 60 * 1000) {
          // 5 minutes in milliseconds
          showHadithNotification();
        }
      }

      setPrayerAlarms(allPrayerTimes);
    } else {
      prayerTimesStatusBar.hide(); // Hide if not active
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to fetch prayer times: ${error}`);
  }
}

function loadHadiths() {
  const hadithFilePath = path.join(__dirname, "hadith.json");
  fs.readFile(hadithFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error loading hadiths:", err);
      return;
    }
    try {
      hadiths = JSON.parse(data);
    } catch (error) {
      console.error("Error parsing hadiths:", error);
    }
  });
}

function showHadithNotification() {
  const randomIndex = Math.floor(Math.random() * hadiths.length);
  const hadith = hadiths[randomIndex];
  vscode.window.showInformationMessage(
    `${hadith.hadith} - ${hadith.reference}`
  );
}

function showAllPrayerTimes() {
  const locationName =
    locationInfo?.name || locationInfo?.location || "Unknown Location";
  const message = `
        Location: ${locationName}
        Sehri: ${prayerTimes.sehri.long}
        Fajr: ${prayerTimes.fajar18.long}
        Ishraq: ${prayerTimes.ishraq.long}
        Rise: ${prayerTimes.rise.long}
        Dhuhr: ${prayerTimes.noon.long}
        Asar: ${prayerTimes.asar1.long} - ${prayerTimes.asar2.long}
        Maghrib: ${prayerTimes.magrib12.long} (End: ${prayerTimes.esha.long})
        Isha: ${prayerTimes.esha.long}
        Tahajjud: ${prayerTimes.night2.long} & ${prayerTimes.night6.long}
        Set: ${prayerTimes.set.long}
    `;
  vscode.window.showInformationMessage(`Prayer Times:\n${message}`, {
    modal: true,
  });
}

function getCurrentPrayer(prayerNames: string[], times: string[]) {
  const currentTime = new Date();
  const currentSecs = Math.floor(currentTime.getTime() / 1000);

  for (let i = 0; i < times.length; i++) {
    const prayerTimeSecs = getPrayerTimeSecs(i);

    if (prayerTimeSecs > currentSecs) {
      const remainingTime = prayerTimeSecs - currentSecs;
      const hours = Math.floor(remainingTime / 3600);
      const minutes = Math.floor((remainingTime % 3600) / 60);
      return {
        name: prayerNames[i],
        time: times[i],
        remainingTime: `${hours}h ${minutes}m left`,
      };
    }
  }

  return {
    name: prayerNames[prayerNames.length - 1],
    time: times[times.length - 1],
    remainingTime: "Prayer time is over.",
  };
}

function getPrayerTimeSecs(index: number) {
  switch (index) {
    case 0:
      return prayerTimes.fajar18.secs; // Fajr
    case 1:
      return prayerTimes.noon.secs; // Dhuhr
    case 2:
      return prayerTimes.asar1.secs; // Asar start
    case 3:
      return prayerTimes.asar2.secs; // Asar end
    case 4:
      return prayerTimes.magrib12.secs; // Maghrib
    case 5:
      return prayerTimes.esha.secs; // Isha
    default:
      return 0;
  }
}

function updatePrayerTimesStatusBar(
  prayerName: string,
  prayerTime: string,
  remainingTime: string
) {
  prayerTimesStatusBar.text = `Prayer Time: ${prayerName} (${remainingTime} left)`;
  prayerTimesStatusBar.tooltip = "Click to see all prayer times";
  prayerTimesStatusBar.command = "prayer-timer-bangladesh.showAllPrayerTimes";

  prayerTimesStatusBar.show();
}

function setPrayerAlarms(times: string[]) {
  prayerAlarmTimeouts.forEach((timeout) => clearTimeout(timeout));
  prayerAlarmTimeouts = [];

  const currentTime = new Date();
  const currentSecs = Math.floor(currentTime.getTime() / 1000);

  for (let time of times) {
    const prayerTimeSecs = getPrayerTimeSecs(times.indexOf(time));

    if (prayerTimeSecs > currentSecs) {
      const timeUntilAlarm = prayerTimeSecs - currentSecs;

      const timeout = setTimeout(() => {
        vscode.window.showInformationMessage(`It's time for prayer! (${time})`);
      }, timeUntilAlarm * 1000);

      prayerAlarmTimeouts.push(timeout);
    }
  }
}

export function deactivate() {
  prayerTimesStatusBar.hide();
  prayerAlarmTimeouts.forEach((timeout) => clearTimeout(timeout));
}
