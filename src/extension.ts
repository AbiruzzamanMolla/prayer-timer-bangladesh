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

    const apiUrl = `https://salat.habibur.com/api/?lat=${lat}&lng=${lng}&tzoffset=360&tzname=${tzname}`;

    const response = await axios.get(apiUrl);
    prayerTimes = response.data.data;

    const prayerNames = localize("prayers"); // Get localized prayer names

    allPrayerTimes = [
      `${prayerTimes.fajar18.short}`,
      `${prayerTimes.noon.short}`,
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

function setPrayerAlarms(times: string[]) {
  // Clear any existing alarms
  prayerAlarmTimeouts.forEach((timeout) => clearTimeout(timeout));
  prayerAlarmTimeouts = [];

  const currentTime = new Date();
  const currentSecs = Math.floor(currentTime.getTime() / 1000);

  // Schedule alarms for each prayer time
  times.forEach((time, index) => {
    const prayerTimeSecs = getPrayerTimeSecs(index);
    if (prayerTimeSecs > currentSecs) {
      const timeUntilPrayer = prayerTimeSecs - currentSecs;
      const timeout = setTimeout(() => {
        showPrayerNotification(index);
      }, timeUntilPrayer * 1000);
      prayerAlarmTimeouts.push(timeout);
    }
  });
}

function getPrayerTimeSecs(index: number) {
  const prayer = [
    prayerTimes.fajar18,
    prayerTimes.noon,
    prayerTimes.asar2,
    prayerTimes.magrib12,
    prayerTimes.esha,
  ];
  return prayer[index].secs;
}

function updatePrayerTimesStatusBar(
  prayerName: string,
  prayerTime: string,
  remainingTime: string
) {
  const location = locationInfo.name || "N/A";

  prayerTimesStatusBar.text = `${localize(
    "location"
  )}: ${location} | ${prayerName} - ${prayerTime} (${remainingTime})`;
  prayerTimesStatusBar.show();
}

function showPrayerNotification(index: number) {
  const prayerNames = localize("prayers");
  vscode.window.showInformationMessage(
    `${localize("timeForPrayer")} ${prayerNames[index]}`
  );
}

function showAllPrayerTimes() {
  const prayerNames = localize("prayers");

  const prayerTimesMessage = `${prayerNames[0]}: ${prayerTimes.fajar18.short}
${prayerNames[1]}: ${prayerTimes.noon.short}
${prayerNames[2]}: ${prayerTimes.asar2.short}
${prayerNames[3]}: ${prayerTimes.magrib12.short}
${prayerNames[4]}: ${prayerTimes.esha.short}`;

  vscode.window.showInformationMessage(prayerTimesMessage);
}

function loadHadiths() {
  const hadithFilePath = path.join(__dirname, "..", "hadith.json");

  if (fs.existsSync(hadithFilePath)) {
    const hadithData = fs.readFileSync(hadithFilePath, "utf8");
    hadiths = JSON.parse(hadithData);
  } else {
    vscode.window.showErrorMessage("Hadiths file not found.");
  }
}

function showHadithNotification() {
  if (hadiths.length === 0) {
    vscode.window.showErrorMessage("No hadiths available.");
    return;
  }

  const randomHadith = hadiths[Math.floor(Math.random() * hadiths.length)];
  const message = `"${randomHadith.text}"\n\n${localize("reference")}: ${
    randomHadith.reference
  }`;

  vscode.window.showInformationMessage(message);
}

export function deactivate() {
  prayerTimesStatusBar.dispose();
  prayerAlarmTimeouts.forEach((timeout) => clearTimeout(timeout));
}
