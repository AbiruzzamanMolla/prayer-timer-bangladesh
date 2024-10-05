import * as vscode from 'vscode';
import axios from 'axios';

const apiUrl = 'https://salat.habibur.com/api/?lat=23.7483066&lng=90.4323979&tzoffset=360&tzname=Asia/Dhaka';

let prayerTimesStatusBar: vscode.StatusBarItem;
let prayerAlarmTimeouts: NodeJS.Timeout[] = [];

export function activate(context: vscode.ExtensionContext) {
   // Register the command
   const disposable = vscode.commands.registerCommand('prayer-timer-bangladesh.showPrayerTimes', async () => {
      try {
         const response = await axios.get(apiUrl);
         const prayerTimes = response.data.data;

         const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
         const times = [
            prayerTimes.fajar18.short,
            prayerTimes.noon.short,
            prayerTimes.asar1.short,
            prayerTimes.magrib12.short,
            prayerTimes.esha.short
         ];

         // Display the prayer times in the status bar
         updatePrayerTimesStatusBar(prayerNames, times);

         // Set alarms for the prayer times
         setPrayerAlarms(times);
      } catch (error) {
         vscode.window.showErrorMessage(`Failed to fetch prayer times: ${error}`);
      }
   });

   context.subscriptions.push(disposable);

   // Initialize status bar
   prayerTimesStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
   context.subscriptions.push(prayerTimesStatusBar);

   // Automatically load prayer times on startup
   vscode.commands.executeCommand('prayer-timer-bangladesh.showPrayerTimes');
}

function updatePrayerTimesStatusBar(prayerNames: string[], times: string[]) {
   let displayText = 'Prayer Times: ';
   for (let i = 0; i < prayerNames.length; i++) {
      displayText += `${prayerNames[i]}: ${times[i]} `;
   }

   prayerTimesStatusBar.text = displayText;
   prayerTimesStatusBar.show();
}

function setPrayerAlarms(times: string[]) {
   // Clear previous alarms
   prayerAlarmTimeouts.forEach(timeout => clearTimeout(timeout));
   prayerAlarmTimeouts = [];

   const currentTime = new Date();
   const currentHour = currentTime.getHours();
   const currentMinutes = currentTime.getMinutes();

   for (let time of times) {
      const [hour, minute] = time.split(':').map(Number);

      if (hour > currentHour || (hour === currentHour && minute > currentMinutes)) {
         const alarmTime = new Date();
         alarmTime.setHours(hour);
         alarmTime.setMinutes(minute);

         const timeUntilAlarm = alarmTime.getTime() - currentTime.getTime();

         const timeout = setTimeout(() => {
            vscode.window.showInformationMessage(`It's time for prayer! (${time})`);
         }, timeUntilAlarm);

         prayerAlarmTimeouts.push(timeout);
      }
   }
}

export function deactivate() {
   prayerTimesStatusBar.hide();
   prayerAlarmTimeouts.forEach(timeout => clearTimeout(timeout));
}
