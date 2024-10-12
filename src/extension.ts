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

  const showHadithCommand = vscode.commands.registerCommand(
    "prayer-timer-bangladesh.showHadith",
    () => {
      showHadithNotification();
    }
  );

  context.subscriptions.push(showPrayerTimesCommand);
  context.subscriptions.push(showAllPrayerTimesCommand);
  context.subscriptions.push(showHadithCommand);

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

    const tzOffset = new Date().getTimezoneOffset() * -60;
    const apiUrl = `https://salat.habibur.com/api/?lat=${lat}&lng=${lng}&tzoffset=${tzOffset}&tzname=${tzname}`;

    const response = await axios.get(apiUrl);
    prayerTimes = response.data.data;

    const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

    allPrayerTimes = [
      `${prayerTimes.fajar18.short}`,
      `${prayerTimes.noon.short}`,
      `${prayerTimes.asar1.short}`,
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

        // Schedule hadith notifications for all prayer times
        schedulePrayerHadithNotifications(allPrayerTimes);
      }

      setPrayerAlarms(allPrayerTimes);
    } else {
      prayerTimesStatusBar.hide(); // Hide if not active
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to fetch prayer times: ${error}`);
  }
}

function getCurrentPrayer(prayerNames: string[], times: string[]) {
  const currentTime = new Date();
  const currentSecs = Math.floor(currentTime.getTime() / 1000);

  // Define prayer time ranges
  const prayerRanges = [
    {
      name: "Fajr",
      start: prayerTimes.fajar18.secs,
      end: prayerTimes.rise.secs,
    },
    {
      name: "Dhuhr",
      start: prayerTimes.noon.secs,
      end: prayerTimes.asar1.secs,
    },
    { name: "Asr", start: prayerTimes.asar1.secs, end: prayerTimes.set.secs },
    {
      name: "Maghrib",
      start: prayerTimes.magrib12.secs,
      end: prayerTimes.esha.secs,
    },
    {
      name: "Isha",
      start: prayerTimes.esha.secs,
      end: prayerTimes.fajar18.secs + 86400,
    }, // Add 24 hours for next day's Fajr
  ];

  // Find current prayer
  for (let range of prayerRanges) {
    if (currentSecs >= range.start && currentSecs < range.end) {
      const remainingTime = range.end - currentSecs;
      const hours = Math.floor(remainingTime / 3600);
      const minutes = Math.floor((remainingTime % 3600) / 60);
      return {
        name: range.name,
        time: new Date(range.start * 1000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        remainingTime: `${hours}h ${minutes}m left`,
      };
    }
  }

  // If no current prayer (between Fajr end and Dhuhr start, or between Asr end and Maghrib start)
  if (
    currentSecs >= prayerTimes.rise.secs &&
    currentSecs < prayerTimes.noon.secs
  ) {
    const remainingTime = prayerTimes.noon.secs - currentSecs;
    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    return {
      name: "Next: Dhuhr",
      time: new Date(prayerTimes.noon.secs * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      remainingTime: `${hours}h ${minutes}m until Dhuhr`,
    };
  } else if (
    currentSecs >= prayerTimes.set.secs &&
    currentSecs < prayerTimes.magrib12.secs
  ) {
    const remainingTime = prayerTimes.magrib12.secs - currentSecs;
    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    return {
      name: "Next: Maghrib",
      time: new Date(prayerTimes.magrib12.secs * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      remainingTime: `${hours}h ${minutes}m until Maghrib`,
    };
  }

  // This should never happen, but just in case
  return {
    name: "Unknown",
    time: "N/A",
    remainingTime: "N/A",
  };
}

function schedulePrayerHadithNotifications(times: string[]) {
  const currentTime = new Date();
  const currentSecs = Math.floor(currentTime.getTime() / 1000);

  times.forEach((time, index) => {
    const prayerTimeSecs = getPrayerTimeSecs(index);
    if (prayerTimeSecs > currentSecs) {
      const timeUntilNotification = prayerTimeSecs - currentSecs - 5 * 60; // 5 minutes before prayer time
      if (timeUntilNotification > 0) {
        setTimeout(() => {
          showHadithNotification();
        }, timeUntilNotification * 1000);
      }
    }
  });
}

function loadHadiths() {
  const hadithFilePath = path.join(__dirname, "..", "hadith.json");
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
  if (hadiths.length === 0) {
    console.error("No hadiths loaded");
    return;
  }
  const randomIndex = Math.floor(Math.random() * hadiths.length);
  const hadith = hadiths[randomIndex];
  vscode.window.showInformationMessage(
    `Hadith: ${hadith.hadith}\n\nReference: ${hadith.reference}`,
    { modal: false }
  );
}

function showAllPrayerTimes() {
  const locationName =
    locationInfo?.name || locationInfo?.location || "Unknown Location";
  const message = `
        Location: ${locationName}
        Sehri: ${prayerTimes.sehri.long}
        Fajr: ${prayerTimes.fajar18.long}
        Sunrise: ${prayerTimes.rise.long}
        Dhuhr: ${prayerTimes.noon.long}
        Asr: ${prayerTimes.asar2.long}
        Sunset: ${prayerTimes.set.long}
        Maghrib: ${prayerTimes.magrib12.long}
        Isha: ${prayerTimes.esha.long}
        Tahajjud: ${prayerTimes.night2.long} & ${prayerTimes.night6.long}
    `;
  vscode.window.showInformationMessage(`Prayer Times:\n${message}`, {
    modal: true,
  });
}

function getPrayerTimeSecs(index: number) {
  switch (index) {
    case 0:
      return prayerTimes.fajar18.secs; // Fajr
    case 1:
      return prayerTimes.noon.secs; // Dhuhr
    case 2:
      return prayerTimes.asar1.secs; // Asr
    case 3:
      return prayerTimes.magrib12.secs; // Maghrib
    case 4:
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

  const alarmTimes = [
    { name: "Fajr", time: prayerTimes.fajar18.secs },
    { name: "Dhuhr", time: prayerTimes.noon.secs },
    { name: "Asr", time: prayerTimes.asar1.secs },
    { name: "Maghrib", time: prayerTimes.magrib12.secs },
    { name: "Isha", time: prayerTimes.esha.secs },
  ];

  for (let alarm of alarmTimes) {
    if (alarm.time > currentSecs) {
      const timeUntilAlarm = alarm.time - currentSecs;

      const timeout = setTimeout(() => {
        vscode.window.showInformationMessage(
          `It's time for ${alarm.name} prayer!`
        );
      }, timeUntilAlarm * 1000);

      prayerAlarmTimeouts.push(timeout);
    }
  }
}

export function deactivate() {
  prayerTimesStatusBar.hide();
  prayerAlarmTimeouts.forEach((timeout) => clearTimeout(timeout));
}
