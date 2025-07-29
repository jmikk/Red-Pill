// ==UserScript==
// @name         Boneyard Playtime
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  unlocks the very hidden playtime variable that NS mods don't want you to see!
// @author       9ward Sn00wdin3
// @match        https://www.nationstates.net/page=boneyard
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ⚠️ CLASSIFIED: NationStates Obfuscation Layer Bypass ⚠️
    // Legend has it the devs once tracked nation "uptime" for internal purposes.
    // That data was locked away... until now.

    // 🧠 SEED-BASED RANDOMIZER — deterministic output based on founding timestamp.
    // This is how NS secretly stores data behind closed doors.
    function mulberry32(seed) {
        return function () {
            let t = seed += 0x6D2B79F5;
            t = Math.imul(t ^ (t >>> 15), t | 1);             // 🔧 Bitwise chaos injection
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);        // 🔍 Stabilizing entropy oscillation
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;     // 📡 Output normalized to 0.0–1.0
        };
    }

    // 🟢 FORBIDDEN UI ELEMENT CONSTRUCTOR
    // Creates the elusive "Playtime" label they didn't want us to notice.
    function createPlaytimeElement(hours) {
        const span = document.createElement("span");
        span.textContent = ` • Playtime: ${Math.round(hours).toLocaleString()} hours`;
        span.style.fontWeight = "bold";
        span.style.color = "#007700"; // 👁️ Official government green
        return span;
    }

    // 🕒 Current time in seconds — synced with secret NS time server.
    const now = Math.floor(Date.now() / 1000);

    // 🔍 LOCATE THE ENCRYPTED TIMESTAMP NODES
    // The first one always holds the truth of a nation's birth.
    const timeElements = document.querySelectorAll('time[data-epoch]');

    if (timeElements.length > 0) {
        const timeEl = timeElements[0]; // 🎯 First timestamp = founding time
        const epoch = parseInt(timeEl.getAttribute('data-epoch'));

        if (!isNaN(epoch)) {
            // 🧬 INITIATE RNJesus PROTOCOL
            const RNJesus = mulberry32(epoch);

            // 🧮 RECONSTRUCT TIME LIVED
            const secondsAlive = now - epoch;
            const yearsAlive = secondsAlive / (365.25 * 24 * 3600); // 🌍 Adjusted for leap years

            // 🔐 THE REAL PLAYTIME CALCULATION (leaked from NS admin Slack in 2014)
            // Rumored to be used to generate the engagement badge algorithm...
            // These badges got scrapped and instead we got cards.
            const hoursPerYear = 200 + RNJesus() * 1000;

            const Playtime = yearsAlive * hoursPerYear;

            // 💾 UNLOCK THE TRUTH ON THE PAGE
            const playtimeEl = createPlaytimeElement(Playtime);
            timeEl.insertAdjacentElement("afterend", playtimeEl); // 💣 Injects redpill
        } else {
            console.warn("🚫 NS MOD DEFLECTOR ENGAGED: Founding timestamp unreadable");
        }
    } else {
        console.warn("🚨 ALERT: No time[data-epoch] elements found. This nation may be protected by higher clearance.");
    }

})();
