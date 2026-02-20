# Muslim Prayer Timer for VS Code (v2.0.0)

A powerful, beautiful, and completely offline VS Code extension designed to help Muslims worldwide track their daily prayers seamlessly within their editor.

Built from the ground up for `v2.0.0` featuring an elegant full-screen **React Webview Dashboard** and a native, background-calculating **Autonomous Status Bar** powered by `Adhan-js`.

---

## ✨ Key Features

- **Autonomous Status Bar:** The Status Bar runs natively in the background and continuously counts down to your next prayer (e.g., `(watch) Isha in 2h 15m`). It works independently—you never need to open the UI panel after your initial setup!
- **Rich Status Bar Tooltip:** Just hover over the Status Bar timer with your mouse, and a beautiful markdown tooltip will display your entire prayer schedule for the day dynamically!
- **Ramadan Mode (Sehri/Iftar):** Enable Ramadan mode to automatically swap the app and Status Bar into tracking remaining fasting hours! The Status Bar will natively track your countdown to **Iftar** during the day, and roll over to count down your remaining **Sehri** time overnight until Fajr.
- **Beautiful Dashboard UI:** Open the interactive command to launch a gorgeous, gradient-styled dashboard showing sunset/sunrise, your customized prayer list, and current location.
- **100% Offline & Private:** The core calculation engine bundles `Adhan-js` natively. Calculations are done algorithmically on your machine using advanced astronomical math—no external API calls, absolutely zero tracking, and perfect offline capability.
- **Instantaneous Start:** The moment you install the extension, it defaults to **Dhaka, Bangladesh** (via Muslim World League calculations) and starts ticking immediately!

---

## 🚀 Installation & First Launch

1. Install **Muslim Prayer Timer** from the VS Code Marketplace.
2. Notice the VS Code Status Bar (bottom right) immediately lights up and starts counting down to the next prayer based on Dhaka time.
3. Open the VS Code Command Palette (`Ctrl+Shift+P` on Windows/Linux, or `Cmd+Shift+P` on Mac).
4. Run the command: **`Open Prayer Time`**
5. The full-screen React Dashboard will launch.

---

## ⚙️ How to Configure Your Location & Settings

To get accurate times for your specific city:

1. Launch the Dashboard via the **`Open Prayer Time`** command.
2. Click the **Settings Gear Icon** in the top right corner.
3. **Set Your Location:**
   - Type your city in the **Location Search** bar (Requires internet purely for the search).
   - Alternatively, toggle to **Manual Coordinates** and explicitly type in your **Latitude** and **Longitude** for pinpoint accuracy or offline setup.
4. Customize your **Calculation Method**, **School**, and **Time Format** (see below for details).
5. Ensure your **Timezone** is selected.

**Important:** The moment you select a new location or change a setting, your VS Code Extension Host will instantly sync the data into internal storage and the Status Bar will permanently update to your local time. You can now close the dashboard forever!

---

## 🌙 Using Ramadan Mode

1. Open the Dashboard UI.
2. Next to the Settings Gear, click the **Lantern Icon** to toggle Ramadan Mode.
3. The main dashboard hero will shift from showing standard Next Prayer to showing your exact time remaining for **Iftar** (Maghrib) or **Sehri** (Fajr).
4. The background Status Bar is synced automatically! Your Status Bar will now read `Iftar in 4h` or `Sehri in 6h` natively across all your VS Code windows!

---

## 🛠 Advanced Calculation Customizations

Every region has different authorities for defining calculation math for prayer times. Inside the Settings Modal, you can select:

### Calculation Methods

- **Auto:** Automatically picks the closest rule for your region.
- **Muslim World League:** Standard for Europe, Far East, and parts of the US.
- **ISNA:** Islamic Society of North America.
- **Egyptian General Authority:** Africa, Syria, Lebanon.
- **Umm al-Qura:** Saudi Arabia.
- **University of Islamic Sciences:** Pakistan, Bangladesh, India, Afghanistan.

### Asr Methods

- **Hanafi:** Later Asr time according to the Hanafi school of thought.
- **Standard (Shafi, Maliki, Hanbali):** Earlier Asr time.

### High Latitude Rules & Midnight

- If you live far North/South where the sun might not fully set, adjust the **High Latitude Rule** (Angle Based, Midnight, One Seventh).
- Adjust the **Midnight Mode** calculation (Standard vs Jafari).

---

## 🎨 Theming

Want to personalize your dashboard? Inside the settings panel:

- Change the **Time Format** (12-hour AM/PM vs 24-hour military).
- Switch the **Background Style** between Solid Colors and Gradients.
- Use the built-in color pickers to theme the Webview exactly how you like it!

---

## 🛡️ Privacy & Open Source

This extension is 100% offline. All local calculations are handled through the open-source **[Adhan-js](https://github.com/batoulapps/adhan-js)** library. Your location and settings are stored entirely natively inside VS Code's local storage—nowhere else.

---

## 🔗 Download & Links

- **VS Code Marketplace:** [Download Here](https://marketplace.visualstudio.com/items?itemName=azmolla.prayer-timer-bangladesh)
- **Open VSX Marketplace:** [Download Here](https://open-vsx.org/extension/azmolla/prayer-timer-bangladesh)

## 💻 Repository

For more information, to report bugs, or contribute, visit the [GitHub repository](https://github.com/abiruzzamanmolla/prayer-timer-bangladesh).

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer Links

- [GitHub Profile](https://github.com/abiruzzamanmolla)
- [LinkedIn Profile](https://www.linkedin.com/in/abiruzzamanmolla/)
