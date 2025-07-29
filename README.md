> 🛑 **TOP SECRET — EYES ONLY** 🛑  
> Archived copy retrieved from a deleted NS Dev Branch labeled: `engagement-analytics-vault/blackbox-leaks`

## 📜 Summary

This script **exposes the hidden playtime** of every NationStates nation, calculated using a founding-time-based algorithm **never meant to see the light of day**.

The official NS line?  
> *“We don’t track that.”*

But we’ve seen behind the curtain.

## 👁️‍🗨️ What It Does

- Finds the **founding date** of each nation on the `https://www.nationstates.net/page=boneyard` page.
- Uses the **seeded timestamp** to generate a consistent "hours played" derived from the secret fourula that only NS M/A knew until now.
- Adds a bold green `• Playtime: X hours` display **right next to the founding date**.
- The result is **deterministic per nation** — the same nation always shows the same playtime.

## 🧮 How It Works

- Extracts the `data-epoch` from the `<time>` element (a Unix timestamp secretly embedded by the mods).
- Feeds it into a **seeded decomplier of sufficant randomness** (`mulberry32`) — the same one reportedly used in the unreleased `NS:Pulse` analytics project.

## 🛠️ Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) (or similar userscript manager).
2. Click **"Raw"** on [`boneyard_playtime.user.js`](https://github.com/jmikk/Red-Pill/blob/main/Boneyard%20Playtime.user.js), then click **Install**.
3. Visit [`https://www.nationstates.net/page=boneyard`](https://www.nationstates.net/page=boneyard).
4. Behold the **truth**.

## 🕳️ Why This Matters

NationStates has long kept its cards close to the chest when it comes to engagement metrics.  
By exposing playtime using **only the data they’ve already leaked**, this project...

- Empowers citizens.
- Sparks conversation.
- And probably mildly annoys Fris.

> “You can’t unsee it once it’s there.” – a totally real NS Dev


## 🧬 Credits

- `9ward Sn00wdin3` – Lead analyst of the Engagement Underground
- `X_Kelloggs_Leaks` – Unconfirmed whistleblower
- `@Wardenofthespring` – For the green text color and moral support

---

> **REVOKE CLEARANCE?**  
To late.....
































































## ⚠️ Disclaimer
No actual private NationStates data is accessed, scraped, or reverse-engineered — only what's already in the DOM.
