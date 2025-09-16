// ==UserScript==
// @name         NS Ad Block all
// @namespace    Block-all-ads
// @version      1.0
// @description  Toggle with "/".
// @match        https://www.nationstates.net/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(() => {
  // ===== CONFIG =====
  // SOURCE_MODE: "INLINE" (no-network inline SVG/CSS) or "PLACEHOLDER" (picsum/placehold)
  const SOURCE_MODE = "INLINE"; // change to "PLACEHOLDER" if you want external placeholder images
  const TILE_SIZE = { w: 300, h: 250 }; // classic MPU size; try {w:160,h:600} for skyscrapers
  const GAP = 8;              // space between tiles
  const ROTATE_EVERY_MS = 5000; // rotate ad contents
  const Z = 2_147_483_647;    // super high z-index
  const TOGGLE_KEY = "/";     // forward slash

  // Fake data sets
  const FAKE_BRANDS = [
    "AcmeSoft", "ZippyCola", "Nimbus Air", "Moonbeam Cards",
    "HyperShoes", "KiteBank", "Nimbus Fiber", "Aurora Travel"
  ];
  const FAKE_TAGLINES = [
    "Upgrade your everything.", "Now with 200% more speed.",
    "Because you deserve shiny.", "The choice of future you.",
    "Stop scrolling, start living.", "Premium. For everyone.",
    "Tap to be amazed.", "Deal of the solar century."
  ];
  const FAKE_CTAS = ["Learn More", "Shop Now", "Get Offer", "Try Free", "Book Today", "Download"];

  const PLACEHOLDER_SOURCES = [
    // Picsum random scenic photos; cache-busting with Math.random()
    () => `https://picsum.photos/seed/${Math.floor(Math.random()*1e9)}/${TILE_SIZE.w}/${TILE_SIZE.h}`,
    // Placehold.co with playful text
    () => `https://placehold.co/${TILE_SIZE.w}x${TILE_SIZE.h}?text=Ad&fontsize=36`
  ];

  const WALL_ID = "fake-ad-wall";
  let enabled = true;
  let rotateTimer = null;

  function rand(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

  // --- Ad creative factories ---
  function makeInlineAdCard() {
    // A single DIV card with gradient bg + inline SVG icon; fully self-contained.
    const brand = rand(FAKE_BRANDS);
    const tagline = rand(FAKE_TAGLINES);
    const cta = rand(FAKE_CTAS);

    const card = document.createElement("a");
    card.href = "javascript:void(0)"; // prank: doesn’t navigate
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", "Sponsored");
    card.style.cssText = `
      display:block;
      width:100%;height:100%;
      background: linear-gradient(135deg, #111 0%, #333 50%, #111 100%);
      color:#fff; text-decoration:none;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      border-radius:12px; overflow:hidden; position:relative;
      box-shadow:0 8px 24px rgba(0,0,0,.4);
    `;

    const svgWrap = document.createElement("div");
    svgWrap.style.cssText = `
      position:absolute; inset:0; opacity:.14; filter:blur(1px)
    `;
    svgWrap.innerHTML = `
      <svg viewBox="0 0 300 250" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#00E5FF"/><stop offset="1" stop-color="#7C4DFF"/>
          </linearGradient>
        </defs>
        <g fill="url(#g)">
          <circle cx="50" cy="60" r="40"/>
          <circle cx="260" cy="60" r="30"/>
          <rect x="100" y="140" width="160" height="60" rx="12"/>
          <rect x="30" y="110" width="120" height="24" rx="12"/>
          <rect x="30" y="150" width="60" height="24" rx="12"/>
        </g>
      </svg>
    `;
    card.appendChild(svgWrap);

    const content = document.createElement("div");
    content.style.cssText = `
      position:absolute; inset:0; padding:14px;
      display:flex; flex-direction:column; justify-content:space-between;
    `;
    content.innerHTML = `
      <div>
        <div style="font-weight:700; font-size:14px; opacity:.8; letter-spacing:.08em; text-transform:uppercase">Advertisement</div>
        <div style="font-weight:800; font-size:18px; margin-top:6px">${brand}</div>
        <div style="font-size:13px; opacity:.9; margin-top:4px">${tagline}</div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:12px;opacity:.75">Sponsored</div>
        <div style="background:#fff;color:#111;font-weight:700;border-radius:999px;padding:8px 12px;font-size:12px">${cta}</div>
      </div>
    `;
    card.appendChild(content);
    return card;
  }

  function makePlaceholderAdCard() {
    const brand = rand(FAKE_BRANDS);
    const tagline = rand(FAKE_TAGLINES);
    const cta = rand(FAKE_CTAS);
    const imgUrl = rand(PLACEHOLDER_SOURCES)();

    const card = document.createElement("a");
    card.href = "javascript:void(0)";
    card.style.cssText = `
      display:block;width:100%;height:100%;position:relative;
      border-radius:12px; overflow:hidden; text-decoration:none;
      color:#fff; background:#000; box-shadow:0 8px 24px rgba(0,0,0,.35)
    `;

    const img = document.createElement("img");
    img.src = imgUrl;
    img.alt = "Sponsored";
    img.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.9";
    card.appendChild(img);

    const badge = document.createElement("div");
    badge.textContent = "Advertisement";
    badge.style.cssText = `
      position:absolute;top:8px;left:8px;background:rgba(0,0,0,.55);
      backdrop-filter:saturate(140%) blur(2px);
      padding:4px 8px;border-radius:6px;font-size:11px
    `;
    card.appendChild(badge);

    const bottom = document.createElement("div");
    bottom.style.cssText = `
      position:absolute;left:0;right:0;bottom:0;padding:10px 12px;
      background:linear-gradient(180deg, transparent, rgba(0,0,0,.7))
    `;
    bottom.innerHTML = `
      <div style="font-weight:800;font-size:16px">${brand}</div>
      <div style="font-size:12px;opacity:.9">${tagline}</div>
      <div style="margin-top:6px;display:inline-block;background:#fff;color:#111;font-weight:700;border-radius:999px;padding:6px 10px;font-size:12px">${cta}</div>
    `;
    card.appendChild(bottom);
    return card;
  }

  function makeCard() {
    return SOURCE_MODE === "PLACEHOLDER" ? makePlaceholderAdCard() : makeInlineAdCard();
  }

  // --- Wall / tiling ---
  function ensureWall() {
    let wall = document.getElementById(WALL_ID);
    if (!wall) {
      wall = document.createElement("div");
      wall.id = WALL_ID;
      wall.style.cssText = `
        position:fixed; inset:0; z-index:${Z};
        pointer-events:auto; background:transparent;
      `;
      document.documentElement.appendChild(wall);
    }
    return wall;
  }

  function buildTiles() {
    const wall = ensureWall();
    wall.innerHTML = ""; // clear
    const cols = Math.max(1, Math.ceil((window.innerWidth + GAP) / (TILE_SIZE.w + GAP)));
    const rows = Math.max(1, Math.ceil((window.innerHeight + GAP) / (TILE_SIZE.h + GAP)));

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = document.createElement("div");
        cell.style.cssText = `
          position:absolute;
          left:${x * (TILE_SIZE.w + GAP)}px;
          top:${y * (TILE_SIZE.h + GAP)}px;
          width:${TILE_SIZE.w}px; height:${TILE_SIZE.h}px; overflow:hidden;
        `;
        const card = makeCard();
        cell.appendChild(card);
        wall.appendChild(cell);
      }
    }
  }

  function destroyWall() {
    const wall = document.getElementById(WALL_ID);
    if (wall) wall.remove();
  }

  function rotateCreatives() {
    if (!enabled) return;
    const wall = ensureWall();
    // Replace each cell’s content with a new card (cheap but reliable).
    [...wall.children].forEach(cell => {
      cell.innerHTML = "";
      cell.appendChild(makeCard());
    });
  }

  function startRotate() {
    stopRotate();
    rotateTimer = setInterval(rotateCreatives, ROTATE_EVERY_MS);
  }
  function stopRotate() {
    if (rotateTimer) { clearInterval(rotateTimer); rotateTimer = null; }
  }

  function toggle() {
    enabled = !enabled;
    if (enabled) {
      buildTiles();
      startRotate();
    } else {
      stopRotate();
      destroyWall();
    }
  }

  // Events
  document.addEventListener("keydown", (e) => {
    if (e.key === TOGGLE_KEY) {
      e.preventDefault();
      toggle();
    }
  }, true);

  window.addEventListener("resize", () => {
    if (enabled) buildTiles();
  });

  // Kickoff
  const init = () => { if (enabled) { buildTiles(); startRotate(); } };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
