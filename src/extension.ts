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
const CONFIG_KEY_LANGUAGE = "prayerTimerBangladesh.language"; // New key for language selection

let prayerTimesStatusBar: vscode.StatusBarItem;
let prayerAlarmTimeouts: NodeJS.Timeout[] = [];
let allPrayerTimes: string[] = []; // To store all prayer times
let prayerTimes: any; // To store all prayer data
let locationInfo: any; // To store location data
let hadiths: any[] = []; // To store hadiths
let updatePrayerTimesInterval: NodeJS.Timeout;

// Keys to store prayer times and location info in global state
const PRAYER_TIMES_KEY = "prayerTimesBangladesh";
const LOCATION_INFO_KEY = "locationInfoBangladesh";
const LAST_CLEAN_KEY = "lastCleanTimestamp"; // Key to store last clean timestamp
const CLEAN_INTERVAL_HOURS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

// Store previous config for comparison
let previousConfig: vscode.WorkspaceConfiguration | undefined;

export function activate(context: vscode.ExtensionContext) {
  // Check if it's time to clean local storage
  const lastClean = context.globalState.get<number>(LAST_CLEAN_KEY);
  const currentTime = new Date().getTime();

  if (!lastClean || currentTime - lastClean > CLEAN_INTERVAL_HOURS) {
    // If more than 12 hours have passed, clear the stored data
    context.globalState.update(PRAYER_TIMES_KEY, undefined);
    context.globalState.update(LOCATION_INFO_KEY, undefined);
    console.log("Cleared local storage after 12 hours.");

    // Update the last clean timestamp to the current time
    context.globalState.update(LAST_CLEAN_KEY, currentTime);
  }

  // Load previous configuration to track changes
  previousConfig = vscode.workspace.getConfiguration();

  // Monitor settings changes
  vscode.workspace.onDidChangeConfiguration((event) => {
    const newConfig = vscode.workspace.getConfiguration();
    if (event.affectsConfiguration("prayerTimerBangladesh")) {
      if (settingsChanged(previousConfig, newConfig)) {
        context.globalState.update(PRAYER_TIMES_KEY, undefined);
        context.globalState.update(LOCATION_INFO_KEY, undefined);
        vscode.window.showInformationMessage(
          "Settings changed. Restarting Prayer Timer Bangladesh extension and clearing stored data."
        );
        vscode.commands.executeCommand("workbench.action.reloadWindow");
      }
    }
    previousConfig = newConfig;
  });

  loadHadiths(); // Load hadiths on activation

  const showPrayerTimesCommand = vscode.commands.registerCommand(
    "prayer-timer-bangladesh.showPrayerTimes",
    async () => {
      await loadPrayerTimes(context);
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

  const resetPrayerTimesCommand = vscode.commands.registerCommand(
    "prayer-timer-bangladesh.resetPrayerTimes",
    () => {
      context.globalState.update(PRAYER_TIMES_KEY, undefined); // Clear the stored prayer times
      context.globalState.update(LOCATION_INFO_KEY, undefined); // Clear the stored location info
      vscode.window.showInformationMessage(
        "Prayer times and location info have been reset."
      );
      console.log("Prayer times and location info cleared from global state.");
    }
  );

  context.subscriptions.push(showPrayerTimesCommand);
  context.subscriptions.push(showAllPrayerTimesCommand);
  context.subscriptions.push(showHadithCommand);
  context.subscriptions.push(resetPrayerTimesCommand);

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

function settingsChanged(
  oldConfig: vscode.WorkspaceConfiguration | undefined,
  newConfig: vscode.WorkspaceConfiguration
): boolean {
  if (!oldConfig) {return true;} // On first run, assume settings changed
  return (
    oldConfig.get(CONFIG_KEY_LAT) !== newConfig.get(CONFIG_KEY_LAT) ||
    oldConfig.get(CONFIG_KEY_LNG) !== newConfig.get(CONFIG_KEY_LNG) ||
    oldConfig.get(CONFIG_KEY_TZNAME) !== newConfig.get(CONFIG_KEY_TZNAME) ||
    oldConfig.get(CONFIG_KEY_POSITION) !== newConfig.get(CONFIG_KEY_POSITION) ||
    oldConfig.get(CONFIG_KEY_ACTIVE) !== newConfig.get(CONFIG_KEY_ACTIVE) ||
    oldConfig.get(CONFIG_KEY_LANGUAGE) !== newConfig.get(CONFIG_KEY_LANGUAGE)
  );
}

async function loadPrayerTimes(context: vscode.ExtensionContext) {
  try {
    const savedPrayerTimes = context.globalState.get<any>(PRAYER_TIMES_KEY);
    const savedLocationInfo = context.globalState.get<any>(LOCATION_INFO_KEY);

    if (savedPrayerTimes && savedLocationInfo) {
      prayerTimes = savedPrayerTimes;
      locationInfo = savedLocationInfo;
      setPrayerData();
      console.log("Loaded prayer times and location info from global state.");
    } else {
      await fetchPrayerTimes(context);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to load prayer times: ${error}`);
  }
}

async function fetchPrayerTimes(context: vscode.ExtensionContext) {
  try {
    const lat = vscode.workspace.getConfiguration().get<number>(CONFIG_KEY_LAT);
    const lng = vscode.workspace.getConfiguration().get<number>(CONFIG_KEY_LNG);
    const tzname = vscode.workspace
      .getConfiguration()
      .get<string>(CONFIG_KEY_TZNAME);

    const apiUrl = `https://salat.habibur.com/api/?lat=${lat}&lng=${lng}&tzoffset=360&tzname=${tzname}`;

    const response = await axios.get(apiUrl);
    const rLocation = response.data.tzname || "Unknown";
    const rName = response.data.name || "Unknown";

    prayerTimes = response.data.data;

    locationInfo = {
      location: rLocation,
      name: rName,
    };

    context.globalState.update(PRAYER_TIMES_KEY, prayerTimes);
    context.globalState.update(LOCATION_INFO_KEY, locationInfo);
    console.log(
      "Prayer times and location info fetched and saved to global state."
    );

    setPrayerData();
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to fetch prayer times: ${error}`);
  }
}

function setPrayerData() {
  const prayerNames = localize("prayers");

  allPrayerTimes = [
    `${prayerTimes.fajar18.short}`,
    `${prayerTimes.noon.short}`,
    `${prayerTimes.asar2.short}`,
    `${prayerTimes.magrib12.short}`,
    `${prayerTimes.esha.short}`,
  ];

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

      // Clear any existing interval before setting a new one
      if (updatePrayerTimesInterval) {
        clearInterval(updatePrayerTimesInterval);
      }

      // Set an interval to update the remaining time every minute
      updatePrayerTimesInterval = setInterval(() => {
        const updatedPrayer = getCurrentPrayer(prayerNames, allPrayerTimes);
        if (updatedPrayer) {
          updatePrayerTimesStatusBar(
            updatedPrayer.name,
            updatedPrayer.time,
            updatedPrayer.remainingTime
          );
        }
      }, 60000); // 60,000 ms = 1 minute

      setPrayerAlarms(allPrayerTimes); // Schedule the prayer alarms
      schedulePrayerHadithNotifications(allPrayerTimes); // Schedule hadith notifications
    }
  } else {
    prayerTimesStatusBar.hide(); // Hide if not active
  }
}

function localize(key: string) {
  const language =
    vscode.workspace.getConfiguration().get<string>(CONFIG_KEY_LANGUAGE) ||
    "English";

  const translations: any = {
    English: {
      location: "Location",
      prayerTimes: "Prayer Times",
      nextPrayer: "Next",
      remainingTime: "left",
      until: "until",
      prayers: ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"],
      hadith: "Hadith",
      reference: "Reference",
      timeForPrayer: "It's time for",
    },
    Bangla: {
      location: "অবস্থান",
      prayerTimes: "নামাজের সময়সূচী",
      nextPrayer: "পরবর্তী",
      remainingTime: "অবশিষ্ট",
      until: "পর্যন্ত",
      prayers: ["ফজর", "যোহর", "আসর", "মাগরিব", "ইশা"],
      hadith: "হাদিস",
      reference: "উদ্ধৃতি",
      timeForPrayer: "নামাজের সময় হয়েছে",
    },
  };

  return translations[language][key];
}

function getCurrentPrayer(prayerNames: string[], times: string[]) {
  const currentTime = new Date();
  const currentSecs = Math.floor(currentTime.getTime() / 1000);

  // Define prayer time ranges
  const prayerRanges = [
    {
      name: prayerNames[0], // Fajr
      start: prayerTimes.fajar18.secs,
      end: prayerTimes.rise.secs,
    },
    {
      name: prayerNames[1], // Dhuhr
      start: prayerTimes.noon.secs,
      end: prayerTimes.asar2.secs,
    },
    {
      name: prayerNames[2], // Asr
      start: prayerTimes.asar2.secs,
      end: prayerTimes.set.secs,
    },
    {
      name: prayerNames[3], // Maghrib
      start: prayerTimes.magrib12.secs,
      end: prayerTimes.esha.secs,
    },
    {
      name: prayerNames[4], // Isha
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
        remainingTime: `${hours}h ${minutes}m ${localize("remainingTime")}`,
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
      name: `${localize("nextPrayer")}: ${prayerNames[1]}`,
      time: new Date(prayerTimes.noon.secs * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      remainingTime: `${hours}h ${minutes}m ${localize("until")} ${
        prayerNames[1]
      }`,
    };
  } else if (
    currentSecs >= prayerTimes.set.secs &&
    currentSecs < prayerTimes.magrib12.secs
  ) {
    const remainingTime = prayerTimes.magrib12.secs - currentSecs;
    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    return {
      name: `${localize("nextPrayer")}: ${prayerNames[3]}`,
      time: new Date(prayerTimes.magrib12.secs * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      remainingTime: `${hours}h ${minutes}m ${localize("until")} ${
        prayerNames[3]
      }`,
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

function getPrayerTimeSecs(index: number): number {
  switch (index) {
    case 0:
      return prayerTimes.fajar18.secs;
    case 1:
      return prayerTimes.noon.secs;
    case 2:
      return prayerTimes.asar2.secs;
    case 3:
      return prayerTimes.magrib12.secs;
    case 4:
      return prayerTimes.esha.secs;
    default:
      return 0;
  }
}

function showHadithNotification() {
  if (hadiths.length === 0) {
    console.error("No hadiths loaded");
    return;
  }
  const randomIndex = Math.floor(Math.random() * hadiths.length);
  const hadith = hadiths[randomIndex];
  vscode.window.showInformationMessage(
    `${localize("hadith")}: ${hadith.hadith}\n\n${localize("reference")}: ${
      hadith.reference
    }`,
    { modal: false }
  );
}

function updatePrayerTimesStatusBar(
  prayerName: string,
  prayerTime: string,
  remainingTime: string
) {
  prayerTimesStatusBar.text = `🕌 ${prayerName} ($(clock) ${remainingTime})`;
  prayerTimesStatusBar.tooltip = `${prayerName}: ${prayerTime}`;
  prayerTimesStatusBar.command = "prayer-timer-bangladesh.showAllPrayerTimes";

  prayerTimesStatusBar.show();
}

function showAllPrayerTimes() {
  const locationName =
    locationInfo?.name || locationInfo?.location || localize("location");
  const message = `
    ${localize("location")}: ${locationName}
    ${localize("prayers")[0]}: ${prayerTimes.fajar18.long}
    ${localize("prayers")[1]}: ${prayerTimes.noon.long}
    ${localize("prayers")[2]}: ${prayerTimes.asar2.long}
    ${localize("prayers")[3]}: ${prayerTimes.magrib12.long}
    ${localize("prayers")[4]}: ${prayerTimes.esha.long}
  `;
  vscode.window.showInformationMessage(
    `${localize("prayerTimes")}:\n${message}`,
    { modal: true }
  );
}

function setPrayerAlarms(times: string[]) {
  const prayerNames = localize("prayers");
  const alarmTimes = [
    { name: prayerNames[0], time: prayerTimes.fajar18.secs },
    { name: prayerNames[1], time: prayerTimes.noon.secs },
    { name: prayerNames[2], time: prayerTimes.asar2.secs },
    { name: prayerNames[3], time: prayerTimes.magrib12.secs },
    { name: prayerNames[4], time: prayerTimes.esha.secs },
  ];

  const currentTime = new Date();
  const currentSecs = Math.floor(currentTime.getTime() / 1000);

  alarmTimes.forEach((alarm) => {
    if (alarm.time > currentSecs) {
      const timeUntilAlarm = alarm.time - currentSecs;
      const timeout = setTimeout(() => {
        vscode.window.showInformationMessage(
          `${localize("timeForPrayer")} ${alarm.name}!`
        );
      }, timeUntilAlarm * 1000);

      prayerAlarmTimeouts.push(timeout);
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

export function deactivate() {
  prayerTimesStatusBar.hide();
  prayerAlarmTimeouts.forEach((timeout) => clearTimeout(timeout));
}
