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
const CONFIG_KEY_TAB_NOTIFY_STATUS = "prayerTimerBangladesh.tabNotificationsActive";
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
let apiPrayerTimes: any; // To store all prayer data
let locationInfo: any; // To store location data
let hadiths: any[] = []; // To store hadiths
let updatePrayerTimesInterval: NodeJS.Timeout;
let currentWebviewPanel: vscode.WebviewPanel | undefined;

// Keys to store prayer times and location info in global state
const PRAYER_TIMES_KEY = "prayerTimesBangladesh";
const LOCATION_INFO_KEY = "locationInfoBangladesh";
const LAST_CLEAN_KEY = "lastCleanTimestamp"; // Key to store last clean timestamp
const CLEAN_INTERVAL_HOURS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

// Store previous config for comparison
let previousConfig: vscode.WorkspaceConfiguration | undefined;


/*
New Timer from Islamic Foundation
*/

// Time adjustment constants
const FAJR_START_AFTER_SAHRI_IN_MINUTE = 5;
const FORBIDDEN_TIME_END_AFTER_SUNRISE_IN_MINUTE = 10;
const FORBIDDEN_TIME_START_BEFORE_NOON_IN_MINUTE = -3;
const FORBIDDEN_TIME_END_AFTER_NOON_IN_MINUTE = 3;
const FORBIDDEN_TIME_START_BEFORE_MAGHRIB_IN_MINUTE = -13;
const SUNSET_TIME_BEFORE_MAGHRIB_IN_MINUTE = -3;

// Function to add minutes to time and adjust the hour and minute accordingly
function nt_addMinutes(hour: number, minute: number, additionalMinutes: number): { hour: number, minute: number } {
    let totalMinutes = hour * 60 + minute + additionalMinutes;
    let adjustedHour = Math.floor(totalMinutes / 60) % 24;
    let adjustedMinute = totalMinutes % 60;

    return { hour: adjustedHour, minute: adjustedMinute };
}

// Function to format time in 12-hour format with am/pm
function nt_formatTime(hour: number, minute: number): string {
    const period = hour >= 12 ? 'pm' : 'am';
    const adjustedHour = hour % 12 === 0 ? 12 : hour % 12;
    const formattedMinute = minute < 10 ? `0${minute}` : minute;
    return `${adjustedHour}:${formattedMinute}${period}`;
}

// Function to get today's prayer times from JSON
function nt_getTodaysPrayerTimes(): any {
    const timetablePath = path.join(__dirname, "..", "timetable.json");
    const timetable = JSON.parse(fs.readFileSync(timetablePath, 'utf8'));

    const today = new Date();
    const todayMonth = today.getMonth() + 1;  // getMonth() is zero-indexed
    const todayDay = today.getDate();

    return timetable.find((item: any) => item.month === todayMonth && item.day === todayDay);
}

function nt_getBootstrapCssPath(webview: vscode.Webview) {
  const bootstrapPath = vscode.Uri.file(
    path.join(__dirname, "..", "bootstrap.min.css")
  );
  return webview.asWebviewUri(bootstrapPath).toString();
}

// Function to generate HTML for displaying the prayer times
function nt_getPrayerTimesHtml(
  webview: vscode.Webview,
  prayerTimes: any
): string {
  if (!prayerTimes) {
    return "<h3>Prayer times not found for today.</h3>";
  }

  const fajrStart = nt_addMinutes(
    prayerTimes.sahriEndHour,
    prayerTimes.sahriEndMinute,
    FAJR_START_AFTER_SAHRI_IN_MINUTE
  );
  const forbiddenAfterSunriseEnd = nt_addMinutes(
    prayerTimes.sunriseHour,
    prayerTimes.sunriseMinute,
    FORBIDDEN_TIME_END_AFTER_SUNRISE_IN_MINUTE
  );
  const forbiddenBeforeNoonStart = nt_addMinutes(
    prayerTimes.noonHour,
    prayerTimes.noonMinute,
    FORBIDDEN_TIME_START_BEFORE_NOON_IN_MINUTE
  );
  const forbiddenAfterNoonEnd = nt_addMinutes(
    prayerTimes.noonHour,
    prayerTimes.noonMinute,
    FORBIDDEN_TIME_END_AFTER_NOON_IN_MINUTE
  );
  const sunsetBeforeMaghrib = nt_addMinutes(
    prayerTimes.magribStartHour,
    prayerTimes.magribStartMinute,
    SUNSET_TIME_BEFORE_MAGHRIB_IN_MINUTE
  );
  const forbiddenBeforeMaghribStart = nt_addMinutes(
    prayerTimes.magribStartHour,
    prayerTimes.magribStartMinute,
    FORBIDDEN_TIME_START_BEFORE_MAGHRIB_IN_MINUTE
  );

  const formatTime12h = (secs: number): string => {
    const date = new Date(secs * 1000); // Convert seconds to milliseconds
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const amPm = hours < 12 ? "AM" : "PM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;

    return `${formattedHours}:${minutes}:${seconds} ${amPm}`;
  };

  const getJamatTime = (prayer:string): string => {
    // Get configuration values with defaults
    const fajarJamatMinutes =
      vscode.workspace.getConfiguration().get<number>(CONFIG_KEY_FAJAR_JAMAT) ||
      30;
    const dhuhrJamatMinutes =
      vscode.workspace.getConfiguration().get<number>(CONFIG_KEY_DHUHR_JAMAT) ||
      30;
    const asrJamatMinutes =
      vscode.workspace.getConfiguration().get<number>(CONFIG_KEY_ASR_JAMAT) ||
      45;
    const maghribJamatMinutes =
      vscode.workspace
        .getConfiguration()
        .get<number>(CONFIG_KEY_MAGHRIB_JAMAT) || 30;
    const ishaJamatMinutes =
      vscode.workspace.getConfiguration().get<number>(CONFIG_KEY_ISHA_JAMAT) ||
      60;

    // Calculate the jamat times
    const dhuhrJamatTime = apiPrayerTimes.noon.secs + dhuhrJamatMinutes * 60; // Add jamat time in seconds
    const fajarJamatTime = apiPrayerTimes.fajar18.secs + fajarJamatMinutes * 60; // Corrected reference for Fajr
    const asrJamatTime = apiPrayerTimes.asar2.secs + asrJamatMinutes * 60; // Ensure seconds are handled correctly
    const maghribJamatTime =
      apiPrayerTimes.magrib12.secs + maghribJamatMinutes * 60; // Ensure seconds are handled correctly
    const ishaJamatTime = apiPrayerTimes.esha.secs + ishaJamatMinutes * 60; // Ensure seconds are handled correctly

    // Example function to format the timestamp to a readable time format
    function formatTimeFromSeconds(totalSeconds: number) {
      const date = new Date(totalSeconds * 1000);

      enum Language {
        English = "en-US",
        Bangla = "bn-BD",
      };

      let lang;
      const language = vscode.workspace.getConfiguration().get<string>(CONFIG_KEY_LANGUAGE) || "English";

      if (language === "Bangla") {
        lang = Language.Bangla;
      } else {
        lang = Language.English;
      }
      
      return date.toLocaleTimeString(lang, {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    }

    if (prayer === "fajar18") {
      return formatTimeFromSeconds(fajarJamatTime);
    } else if (prayer === "noon") {
      return formatTimeFromSeconds(dhuhrJamatTime);
    } else if (prayer === "asar2") {
      return formatTimeFromSeconds(asrJamatTime);
    } else if (prayer === "set") {
      return formatTimeFromSeconds(maghribJamatTime);
    } else if (prayer === "esha") {
      return formatTimeFromSeconds(ishaJamatTime);
    }

    return '';
  };

  const bootstrapCssPath = nt_getBootstrapCssPath(webview);

  const locationName =
    locationInfo?.name || locationInfo?.location || localize("location");

  return `
    <link rel="stylesheet" href="${bootstrapCssPath}">
    <div class="container mt-4">
        <div class="row">
            <div class="col-md-6 d-flex">
                <div class="card flex-fill">
                    <div class="card-header">
                      <h2 class="text-center mb-4">${localize(
                        "prayerTimes"
                      )}: (${localize("ifb")} ${localize(
    "dhaka"
  )} - ${new Date().getDate()}/${
    new Date().getMonth() + 1
  }/${new Date().getFullYear()})</h2>
                    </div>
                    <div class="card-body">
                        <table class="table table-bordered table-striped">
                            <thead class="thead-dark">
                                <tr>
                                    <th>${localize("waktu")}</th>
                                    <th>${localize("time")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>সাহরীর শেষ সময়</td>
                                    <td id="sahri-end">${nt_formatTime(
                                      prayerTimes.sahriEndHour,
                                      prayerTimes.sahriEndMinute
                                    )}</td>
                                </tr>
                                <tr>
                                    <td>ফজর শুরু</td>
                                    <td id="fajr-start">${nt_formatTime(
                                      fajrStart.hour,
                                      fajrStart.minute
                                    )}</td>
                                </tr>
                                <tr>
                                    <td>সূর্যোদয় ও নামাজের নিষিদ্ধ সময়</td>
                                    <td id="sunrise-forbidden">${nt_formatTime(
                                      prayerTimes.sunriseHour,
                                      prayerTimes.sunriseMinute
                                    )} - ${nt_formatTime(
    forbiddenAfterSunriseEnd.hour,
    forbiddenAfterSunriseEnd.minute
  )}</td>
                                </tr>
                                <tr>
                                    <td>যোহর শুরু</td>
                                    <td id="duhr-start">${nt_formatTime(
                                      prayerTimes.noonHour,
                                      prayerTimes.noonMinute
                                    )}</td>
                                </tr>
                                <tr>
                                    <td>দ্বিপ্রহর ও নামাজের নিষিদ্ধ সময়</td>
                                    <td id="noon-forbidden">${nt_formatTime(
                                      forbiddenBeforeNoonStart.hour,
                                      forbiddenBeforeNoonStart.minute
                                    )} - ${nt_formatTime(
    forbiddenAfterNoonEnd.hour,
    forbiddenAfterNoonEnd.minute
  )}</td>
                                </tr>
                                <tr>
                                    <td>আসর শুরু</td>
                                    <td id="asr-start">${nt_formatTime(
                                      prayerTimes.asrStartHour,
                                      prayerTimes.asrStartMinute
                                    )}</td>
                                </tr>
                                <tr>
                                    <td>সূর্যাস্ত ও নামাজের নিষিদ্ধ সময়</td>
                                    <td id="sunset-forbidden">${nt_formatTime(
                                      forbiddenBeforeMaghribStart.hour,
                                      forbiddenBeforeMaghribStart.minute
                                    )} - ${nt_formatTime(
    sunsetBeforeMaghrib.hour,
    sunsetBeforeMaghrib.minute
  )}</td>
                                </tr>
                                <tr>
                                    <td>মাগরিব শুরু</td>
                                    <td id="magrib-start">${nt_formatTime(
                                      prayerTimes.magribStartHour,
                                      prayerTimes.magribStartMinute
                                    )}</td>
                                </tr>
                                <tr>
                                    <td>এশা শুরু</td>
                                    <td id="isha-start">${nt_formatTime(
                                      prayerTimes.ishaStartHour,
                                      prayerTimes.ishaStartMinute
                                    )}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="col-md-6 d-flex">
                <div class="card flex-fill">
                    <div class="card-header">
                          <h2 class="text-center my-3">${localize(
                            "prayerTimes"
                          )}: ${locationName}</h2>
                    </div>
                    <div class="card-body">
                        <table class="table table-bordered table-striped">
                            <thead class="thead-dark">
                                <tr>
                                    <th>${localize("waktu")}</th>
                                    <th>${localize("time")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${localize("prayers")[0]}</td>
                                    <td>${formatTime12h(
                                      apiPrayerTimes.fajar18.secs
                                    )} (${localize("jamat")}: ${getJamatTime(
    "fajar18"
  )})</td>
                                </tr>
                                <tr>
                                    <td>${localize("prayers")[1]}</td>
                                    <td>${formatTime12h(
                                      apiPrayerTimes.noon.secs + 2 * 60
                                    )} (${localize("jamat")}: ${getJamatTime(
    "noon"
  )})</td>
                                </tr>
                                <tr>
                                    <td>${localize("prayers")[2]}</td>
                                    <td>${formatTime12h(
                                      apiPrayerTimes.asar2.secs
                                    )} (${localize("jamat")}: ${getJamatTime(
    "asar2"
  )})</td>
                                </tr>
                                <tr>
                                    <td>${localize("prayers")[3]}</td>
                                    <td>${formatTime12h(
                                      apiPrayerTimes.set.secs + 2 * 60
                                    )} (${localize("jamat")}: ${getJamatTime(
    "set"
  )})</td>
                                </tr>
                                <tr>
                                    <td>${localize("prayers")[4]}</td>
                                    <td>${formatTime12h(
                                      apiPrayerTimes.esha.secs
                                    )} (${localize("jamat")}: ${getJamatTime(
    "esha"
  )})</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

/*
New Timer from Islamic Foundation ends
*/

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

  /* register new timer from ifaba */

  let bdTimerCommand = vscode.commands.registerCommand(
    "prayer-timer-bangladesh.showBdPrayerTimes",
    () => {
      // Get today's prayer times
      const prayerTimes = nt_getTodaysPrayerTimes();

      // Create and show the Webview panel
      const panel = vscode.window.createWebviewPanel(
        "prayerTimes", // Identifies the type of the webview. Used internally
        "Bangladesh Prayer Times", // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in.
        {
          enableScripts: true, // Enable scripts in the webview
          localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath)),
          ],
        }
      );

      // Set the webview's HTML content
      panel.webview.html = nt_getPrayerTimesHtml(panel.webview, prayerTimes);
    }
  );

  context.subscriptions.push(bdTimerCommand);

  /* ends new timer from ifaba */

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
      apiPrayerTimes = savedPrayerTimes;
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
    apiPrayerTimes = prayerTimes;

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
      prayer: "Prayer",
      waktu: "Waktu",
      time: "Time",
      location: "Location",
      prayerTimes: "Prayer Times",
      nextPrayer: "Next",
      remainingTime: "left",
      until: "until starting",
      prayers: ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"],
      hadith: "Hadith",
      reference: "Reference",
      status: "Authenticity level",
      timeForPrayer: "It's time for",
      jamat: "Congregation",
      timeForJamat: "It's time for congregation",
      ifb: "Islamic Foundation Bangladesh",
      dhaka: "Dhaka",
    },
    Bangla: {
      prayer: "নামাজ",
      waktu: "ওয়াক্ত",
      time: "সময়",
      location: "অবস্থান",
      prayerTimes: "নামাজের সময়সূচী",
      nextPrayer: "পরবর্তী",
      remainingTime: "অবশিষ্ট",
      until: "পর",
      prayers: ["ফজর", "যোহর", "আসর", "মাগরিব", "ইশা"],
      hadith: "হাদিস",
      reference: "সূত্র",
      status: "হাদিসের মান",
      timeForPrayer: "নামাজের সময় হয়েছে",
      jamat: "জামাত",
      timeForJamat: "জামাতে সালাতের সময় হয়েছে",
      ifb: "ইসলামিক ফাউন্ডেশন বাংলাদেশ",
      dhaka: "ঢাকা",
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
        `${prayerName} ${localize("timeForJamat")}`
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
    `${localize("hadith")}: ${hadith.hadith}\n\n` + 
    `${localize("reference")}: ${hadith.reference}\n` + 
    `${localize("status")}: ${hadith.status}`,
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
  prayerTimesStatusBar.command = "prayer-timer-bangladesh.showBdPrayerTimes";

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

  const isTabNotifyActive = vscode.workspace
    .getConfiguration()
    .get<boolean>(CONFIG_KEY_TAB_NOTIFY_STATUS);

  alarmTimes.forEach((alarm) => {
    if (alarm.time > currentSecs) {
      const timeUntilAlarm = alarm.time - currentSecs;
      const timeout = setTimeout(() => {
        vscode.window.showInformationMessage(
          `${localize("timeForPrayer")} ${alarm.name}!`
        );
        if (isTabNotifyActive)  {
          showPrayerAlarmPopup(alarm.name);
        }
      }, timeUntilAlarm * 1000);

      prayerAlarmTimeouts.push(timeout);
    }
  });
}

function showPrayerAlarmPopup(prayerName: string) {
  if (currentWebviewPanel) {
    currentWebviewPanel.reveal(vscode.ViewColumn.One);
  } else {
    currentWebviewPanel = vscode.window.createWebviewPanel(
      "prayerAlarm", // Identifies the type of the webview. Used internally
      "Prayer Time Alert", // Title of the panel displayed to the user
      vscode.ViewColumn.One, // Editor column to show the new webview panel in
      {
        enableScripts: true, // Enable JavaScript in the webview
      }
    );

    // Set the HTML content for the webview
    currentWebviewPanel.webview.html = getWebviewContent(prayerName);

    // Handle the disposal of the panel
    currentWebviewPanel.onDidDispose(() => {
      currentWebviewPanel = undefined;
    });
  }
}

function getWebviewContent(prayerName: string): string {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Prayer Alarm - ${prayerName}</title>   

        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #fff3cd;
                color: #856404;
                padding: 20px;
                border: 1px solid #ffeeba;
                border-radius: 5px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            h1 {
                font-size: 36px;
                margin: 0;
            }
            .btn {
                background-color: #856404;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
            }
            .btn:hover {
                background-color: #705c2c;
            }
        </style>
    </head>
    <body>
        <h1>It's time for ${prayerName}!</h1>
    </body>
</html>`;
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
