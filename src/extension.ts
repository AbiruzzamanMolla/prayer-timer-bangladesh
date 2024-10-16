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
const CONFIG_KEY_LANGUAGE = "prayerTimerBangladesh.language";
const CONFIG_KEY_JAMAT_ACTIVE = "prayerTimerBangladesh.jamatActive";
const CONFIG_KEY_FAJAR_JAMAT = "prayerTimerBangladesh.jamatFajarMinutes";
const CONFIG_KEY_DHUHR_JAMAT = "prayerTimerBangladesh.jamatDhuhrMinutes";
const CONFIG_KEY_ASR_JAMAT = "prayerTimerBangladesh.jamatAsrMinutes";
const CONFIG_KEY_MAGHRIB_JAMAT = "prayerTimerBangladesh.jamatMaghribMinutes";
const CONFIG_KEY_ISHA_JAMAT = "prayerTimerBangladesh.jamatIshaMinutes";

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

    setPrayerData();
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to fetch prayer times: ${error}`);
  }
}

function setPrayerData() {
  const prayerNames = localize("prayers");

  const fajarJamatMinutes = vscode.workspace.getConfiguration().get<number>(CONFIG_KEY_FAJAR_JAMAT) || 30;

  const dhuhrJamatMinutes = vscode.workspace.getConfiguration().get<number>(CONFIG_KEY_DHUHR_JAMAT) || 30;

  const asrJamatMinutes =
    vscode.workspace.getConfiguration().get<number>(CONFIG_KEY_ASR_JAMAT) || 45;
  const maghribJamatMinutes =
    vscode.workspace.getConfiguration().get<number>(CONFIG_KEY_MAGHRIB_JAMAT) ||
    30;
  const ishaJamatMinutes =
    vscode.workspace.getConfiguration().get<number>(CONFIG_KEY_ISHA_JAMAT) ||
    60;

  
  allPrayerTimes = [
    `${prayerTimes.fajar18.short}`,
    `${prayerTimes.noon.short}`,
    `${prayerTimes.asar2.short}`,
    `${prayerTimes.magrib12.short}`,
    `${prayerTimes.esha.short}`,
  ];

  const dhuhrJamatTime = new Date(
    prayerTimes.noon.secs + 120 * 1000 + dhuhrJamatMinutes * 60 * 1000
  );

  const fajarJamatTime = new Date(
    prayerTimes.noon.secs + 120 * 1000 + fajarJamatMinutes * 60 * 1000
  );

  const asrJamatTime = new Date(
    prayerTimes.asar2.secs * 1000 + asrJamatMinutes * 60 * 1000
  );

  const maghribJamatTime = new Date(
    prayerTimes.magrib12.secs * 1000 + maghribJamatMinutes * 60 * 1000
  );

  const ishaJamatTime = new Date(
    prayerTimes.esha.secs * 1000 + ishaJamatMinutes * 60 * 1000
  );

  const isActive = vscode.workspace
    .getConfiguration()
    .get<boolean>(CONFIG_KEY_ACTIVE);

  if (isActive) {
    const currentPrayer = getCurrentPrayer(
      prayerNames,
      allPrayerTimes,
      dhuhrJamatTime,
      fajarJamatTime,
      asrJamatTime,
      maghribJamatTime,
      ishaJamatTime
    );
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
        const updatedPrayer = getCurrentPrayer(
          prayerNames,
          allPrayerTimes,
          dhuhrJamatTime,
          fajarJamatTime,
          asrJamatTime,
          maghribJamatTime,
          ishaJamatTime
        );
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

      const isJamatActive = vscode.workspace
        .getConfiguration()
        .get<boolean>(CONFIG_KEY_JAMAT_ACTIVE);

      if (isJamatActive) {
        scheduleJamatNotification(fajarJamatTime, prayerNames[0]);
        scheduleJamatNotification(dhuhrJamatTime, prayerNames[1]);
        scheduleJamatNotification(asrJamatTime, prayerNames[2]);
        scheduleJamatNotification(maghribJamatTime, prayerNames[3]);
        scheduleJamatNotification(ishaJamatTime, prayerNames[4]);
      }
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
      jamat: "Congregation",
      timeForJamat: "It's time for congregation",
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
      jamat: "জামাত",
      timeForJamat: "জামাতে সালাতের সময় হয়েছে",
    },
  };

  return translations[language][key];
}

function getCurrentPrayer(
  prayerNames: string[],
  times: string[],
  dhuhrJamatTime: Date,
  fajarJamatTime: Date,
  asrJamatTime: Date,
  maghribJamatTime: Date,
  ishaJamatTime: Date
) {
  const currentTime = new Date();
  const currentSecs = Math.floor(currentTime.getTime() / 1000);
  const dhuhrJamatSecs = Math.floor(dhuhrJamatTime.getTime() / 1000);
  const fajarJamatSecs = Math.floor(fajarJamatTime.getTime() / 1000);
  const asrJamatSecs = Math.floor(asrJamatTime.getTime() / 1000);
  const maghribJamatSecs = Math.floor(maghribJamatTime.getTime() / 1000);
  const ishaJamatSecs = Math.floor(ishaJamatTime.getTime() / 1000);

  // Define prayer time ranges
  const prayerRanges = [
    {
      name: prayerNames[0], // Fajr
      start: prayerTimes.fajar18.secs,
      end: prayerTimes.rise.secs,
    },
    {
      name: prayerNames[0] + " " + localize("jamat"), // Fajar Jamat
      start: fajarJamatSecs,
      end: prayerTimes.rise.secs,
    },
    {
      name: prayerNames[1], // Dhuhr
      start: prayerTimes.noon.secs + 120,
      end: prayerTimes.asar2.secs,
    },
    {
      name: prayerNames[1] + " " + localize("jamat"), // Dhuhr Jamat
      start: dhuhrJamatSecs,
      end: prayerTimes.asar2.secs,
    },
    {
      name: prayerNames[2], // Asr
      start: prayerTimes.asar2.secs,
      end: prayerTimes.set.secs - 300, // 5 minutes before sunset (300 seconds)
    },
    {
      name: prayerNames[2] + " " + localize("jamat"), // Asr Jamat
      start: asrJamatSecs,
      end: prayerTimes.set.secs - 300, // 5 minutes before sunset (300 seconds)
    },
    {
      name: prayerNames[3], // Maghrib
      start: prayerTimes.set.secs + 120, // 2 minutes after sunset (120 seconds)
      end: prayerTimes.magrib12.secs,
    },
    {
      name: prayerNames[3] + " " + localize("jamat"), // Maghrib Jamat
      start: maghribJamatSecs,
      end: prayerTimes.magrib12.secs,
    },
    {
      name: prayerNames[4], // Isha
      start: prayerTimes.esha.secs,
      end: prayerTimes.fajar18.secs + 86400,
    }, // Add 24 hours for next day's Fajr
    {
      name: prayerNames[4] + " " + localize("jamat"), // Isha Jamat
      start: ishaJamatSecs,
      end: prayerTimes.fajar18.secs + 86400,
    },
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
    currentSecs < prayerTimes.noon.secs + 120
  ) {
    return getNextPrayerInfo(
      prayerNames[1],
      prayerTimes.noon.secs + 120,
      currentSecs
    );
  } else if (
    currentSecs >= prayerTimes.set.secs - 300 &&
    currentSecs < prayerTimes.set.secs + 120
  ) {
    return getNextPrayerInfo(
      prayerNames[3],
      prayerTimes.set.secs + 120,
      currentSecs
    );
  } else if (
    currentSecs >= prayerTimes.magrib12.secs &&
    currentSecs < prayerTimes.esha.secs
  ) {
    return getNextPrayerInfo(
      prayerNames[4],
      prayerTimes.esha.secs,
      currentSecs
    );
  }

  // This should never happen, but just in case
  return {
    name: "Unknown",
    time: "N/A",
    remainingTime: "N/A",
  };
}

function getNextPrayerInfo(
  prayerName: string,
  prayerTime: number,
  currentSecs: number
) {
  const remainingTime = prayerTime - currentSecs;
  const hours = Math.floor(remainingTime / 3600);
  const minutes = Math.floor((remainingTime % 3600) / 60);
  return {
    name: `${localize("nextPrayer")}: ${prayerName}`,
    time: new Date(prayerTime * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    remainingTime: `${hours}h ${minutes}m ${localize("until")} ${prayerName}`,
  };
}

function scheduleJamatNotification(jamatTime: Date, prayerName: string) {
  const currentTime = new Date();
  const timeUntilJamat = jamatTime.getTime() - currentTime.getTime();

  if (timeUntilJamat > 0) {
    setTimeout(() => {
      vscode.window.showInformationMessage(
        `${localize("timeForJamat")} ${prayerName}`
      );
    }, timeUntilJamat);
  }
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
      return prayerTimes.noon.secs + 120;
    case 2:
      return prayerTimes.asar2.secs;
    case 3:
      return prayerTimes.set.secs + 2*60;
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

  const formatTime12h = (secs: number): string => {
    const date = new Date(secs * 1000); // Convert seconds to milliseconds
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const amPm = hours < 12 ? "AM" : "PM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;

    return `${formattedHours}:${minutes}:${seconds} ${amPm}`;
  };

  const message = `
    ${localize("location")}: ${locationName}
    ${localize("prayers")[0]}: ${formatTime12h(prayerTimes.fajar18.secs)}
    ${localize("prayers")[1]}: ${formatTime12h(prayerTimes.noon.secs + 2*60)}
    ${localize("prayers")[2]}: ${formatTime12h(prayerTimes.asar2.secs)}
    ${localize("prayers")[3]}: ${formatTime12h(prayerTimes.set.secs + 2*60)}
    ${localize("prayers")[4]}: ${formatTime12h(prayerTimes.esha.secs)}
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
    { name: prayerNames[1], time: prayerTimes.noon.secs + 120 },
    { name: prayerNames[2], time: prayerTimes.asar2.secs },
    { name: prayerNames[3], time: prayerTimes.set.secs + 2 * 60 },
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
