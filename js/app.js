/**
 * RILO Mobile App - Interactive Engine (Bintaro Edition)
 * Mendukung Autentikasi (Google/Email), Multi-Bahasa (ID/EN),
 * Peta Bintaro tanpa tombol scan ganda, dan Point Card Compact.
 */

let currentDepositSession = {
  selectedBox: null,
  activeMode: "piece", // 'piece' atau 'kg'
  pieceCounts: {},
  kgWeights: {}
};

let homeMapInstance = null;
let fullMapInstance = null;

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  setupAuth();
  setupLanguage();
  setupNavigation();
  setupQrScanner();
  setupDepositModeSwitcher();
  setupDepositItems();
  setupRewardCategoryFilters();
  setupNewsCategoryChips();
  setupProfileForm();
  renderAllViews();
  setTimeout(initBintaroHomeMap, 300);
}

// Format Angka Ribuan
const fmt = (n) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(n);

// Format Tanggal
function formatDate(dStr) {
  try {
    const lang = AppState.currentLang === "en" ? "en-US" : "id-ID";
    return new Date(dStr + "T12:00:00").toLocaleDateString(lang, {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } catch (e) {
    return dStr;
  }
}

// Helper I18n Terjemahan
function t(key) {
  const lang = AppState.currentLang || "id";
  const dict = AppState.translations[lang] || AppState.translations.id;
  return dict[key] || key;
}

// === TOAST NOTIFICATION ===
let toastTimer;
function showToast(message, isSuccess = true) {
  const toast = document.getElementById("mobileToastBar");
  if (!toast) return;

  document.getElementById("toastBarIcon").innerHTML = isSuccess ? ICONS.check : ICONS.pin;
  document.getElementById("toastBarMsg").textContent = message;

  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("visible");
  }, 3200);
}

// === 1. FITUR AUTENTIKASI (GOOGLE & EMAIL SIGN-IN) ===
let authMode = "signin"; // 'signin' atau 'signup'

function setupAuth() {
  const authOverlay = document.getElementById("authOverlayScreen");
  const tabSignIn = document.getElementById("tabAuthSignIn");
  const tabSignUp = document.getElementById("tabAuthSignUp");
  const authForm = document.getElementById("authCredentialsForm");
  const btnGoogle = document.getElementById("btnGoogleSignInAction");
  const btnGuest = document.getElementById("btnGuestDemoAction");

  // Tab switcher SignIn vs SignUp
  if (tabSignIn && tabSignUp) {
    tabSignIn.addEventListener("click", () => {
      authMode = "signin";
      tabSignIn.classList.add("active");
      tabSignUp.classList.remove("active");
      document.getElementById("authSubmitBtnText").textContent = t("btnEmailLogin");
      document.getElementById("authSignUpExtraFields").style.display = "none";
    });

    tabSignUp.addEventListener("click", () => {
      authMode = "signup";
      tabSignUp.classList.add("active");
      tabSignIn.classList.remove("active");
      document.getElementById("authSubmitBtnText").textContent = t("tabSignUp");
      document.getElementById("authSignUpExtraFields").style.display = "block";
    });
  }

  // Google Sign-In Action
  if (btnGoogle) {
    btnGoogle.addEventListener("click", () => {
      AppState.auth.isLoggedIn = true;
      AppState.auth.loginMethod = "google";
      authOverlay.classList.add("hidden");
      showToast(AppState.currentLang === "en" ? "Signed in with Google as Kaila Zanita" : "Berhasil masuk dengan Google!", true);
      setTimeout(initBintaroHomeMap, 300);
    });
  }

  // Email Submit Action
  if (authForm) {
    authForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("authInputEmail").value.trim();
      const name = document.getElementById("authInputName") ? document.getElementById("authInputName").value.trim() : "";

      if (authMode === "signup" && name) {
        AppState.user.name = name;
        AppState.user.avatar = name[0].toUpperCase();
      }
      if (email) AppState.user.email = email;

      AppState.auth.isLoggedIn = true;
      AppState.auth.loginMethod = "email";
      authOverlay.classList.add("hidden");

      showToast(AppState.currentLang === "en" ? "Welcome to RILO Bintaro!" : "Selamat datang di RILO Bintaro!", true);
      renderAllViews();
      setTimeout(initBintaroHomeMap, 300);
    });
  }

  // Guest Demo Action (One Click)
  if (btnGuest) {
    btnGuest.addEventListener("click", () => {
      AppState.auth.isLoggedIn = true;
      AppState.auth.loginMethod = "guest";
      authOverlay.classList.add("hidden");
      showToast(AppState.currentLang === "en" ? "Demo Mode Activated" : "Mode Demo Aktif", true);
      setTimeout(initBintaroHomeMap, 300);
    });
  }

  // Tombol Logout di Tab Profil
  const btnLogout = document.getElementById("btnLogoutAppAction");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      if (confirm(AppState.currentLang === "en" ? "Are you sure you want to sign out?" : "Apakah kamu yakin ingin keluar dari akun?")) {
        AppState.auth.isLoggedIn = false;
        authOverlay.classList.remove("hidden");
        switchView("home");
      }
    });
  }
}

// === 2. FITUR MULTI-BAHASA (ID & EN) ===
function setupLanguage() {
  const btnLangId = document.getElementById("btnLangId");
  const btnLangEn = document.getElementById("btnLangEn");

  if (btnLangId && btnLangEn) {
    btnLangId.addEventListener("click", () => setLanguage("id"));
    btnLangEn.addEventListener("click", () => setLanguage("en"));
  }
}

function setLanguage(lang) {
  AppState.currentLang = lang;

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  // Re-render semua komponen dengan bahasa yang dipilih
  applyLanguageTranslations();
  updateCategoryLabels(lang);
  renderAllViews();
  setupDepositItems();
  setupRewardCategoryFilters();
  setupNewsCategoryChips();
  showToast(lang === "en" ? "Language changed to English" : "Bahasa diubah ke Bahasa Indonesia", true);
}

function updateCategoryLabels(lang) {
  const isEn = lang === "en";
  const chips = document.querySelectorAll("#exchangeFilterBar .chip-filter-btn");
  chips.forEach((chip) => {
    const f = chip.getAttribute("data-filter");
    if (f === "all") chip.textContent = isEn ? "All" : "Semua";
    else if (f === "e-Wallet") chip.textContent = "e-Wallet";
    else if (f === "Kuliner") chip.textContent = isEn ? "Food" : "Kuliner";
    else if (f === "Belanja") chip.textContent = isEn ? "Shopping" : "Belanja";
    else if (f === "Merchandise") chip.textContent = isEn ? "Merch" : "Merchandise";
    else if (f === "Donasi") chip.textContent = isEn ? "Donate" : "Donasi";
  });
}

function applyLanguageTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });
}

// === ROUTER & NAVIGATION ===
let currentView = "home";

function switchView(viewName) {
  currentView = viewName;

  document.querySelectorAll(".view-panel").forEach((panel) => {
    panel.classList.remove("active");
  });

  const target = document.getElementById(`panel-${viewName}`);
  if (target) {
    target.classList.add("active");
  }

  // Update navbar state
  document.querySelectorAll(".bnd-item").forEach((btn) => {
    if (btn.dataset.nav === viewName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  const scrollArea = document.getElementById("mainScrollView");
  if (scrollArea) scrollArea.scrollTo({ top: 0, behavior: "smooth" });

  if (viewName === "home") {
    setTimeout(() => { if (homeMapInstance) homeMapInstance.invalidateSize(); }, 200);
  }
  if (viewName === "map-full") {
    setTimeout(initFullBintaroMap, 200);
  }
  if (viewName === "transactions") renderTransactions();
  if (viewName === "rewards") renderRewards();
  if (viewName === "impact") renderImpact();
  if (viewName === "my-vouchers") renderMyVouchers();
}

function setupNavigation() {
  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.nav;
      if (target === "deposit") {
        openQrScanFlow();
      } else {
        switchView(target);
      }
    });
  });

  document.addEventListener("click", (e) => {
    // 1. Tangani filter chips kategori voucher di halaman Hadiah
    const chip = e.target.closest("#exchangeFilterBar .chip-filter-btn");
    if (chip) {
      e.preventDefault();
      e.stopPropagation();
      document.querySelectorAll("#exchangeFilterBar .chip-filter-btn").forEach((b) => b.classList.remove("active"));
      chip.classList.add("active");
      activeRewardFilter = chip.getAttribute("data-filter") || "all";
      renderRewards();
      return;
    }

    // 2. Tangani navigasi view universal
    const trigger = e.target.closest("[data-go]");
    if (trigger) {
      const page = trigger.dataset.go;
      if (page === "deposit") {
        openQrScanFlow();
      } else {
        switchView(page);
      }
    }
  });

  const btnReset = document.getElementById("btnResetDemo");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (confirm(AppState.currentLang === "en" ? "Restore demo sample data to initial state?" : "Kembalikan data demo ke nilai awal? Semua saldo poin dan transaksi sesi ini akan direset.")) {
        resetAppState();
        renderAllViews();
        showToast(AppState.currentLang === "en" ? "Demo data restored." : "Data demo dikembalikan ke awal.", true);
        switchView("home");
      }
    });
  }
}

// === 3. PETA DROP POINT BINTARO (TANPA TOMBOL SCAN DI DALAM MAP) ===
function initBintaroHomeMap() {
  const mapEl = document.getElementById("homeDropMap");
  if (!mapEl || homeMapInstance) return;

  if (typeof L === "undefined") {
    mapEl.innerHTML = `
      <div style="height:100%;display:flex;align-items:center;justify-content:center;background:#f1f5f9;color:#64748b;font-size:12px;gap:8px;">
        ${ICONS.mapLocation} <span>Peta Drop Point: Bintaro Jaya</span>
      </div>
    `;
    return;
  }

  // Koordinat Bintaro Jaya Sektor 7 & Bintaro Xchange
  homeMapInstance = L.map("homeDropMap", {
    center: [-6.2840, 106.7275],
    zoom: 14,
    zoomControl: false,
    attributionControl: false
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18
  }).addTo(homeMapInstance);

  // Tambahkan markers titik Drop Box di Bintaro
  AppState.qrLocations.forEach((box) => {
    const customIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: `<div class="rilo-map-marker" title="${box.name}">R</div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    const marker = L.marker([box.lat, box.lng], { icon: customIcon }).addTo(homeMapInstance);
    // Popup murni informatif tanpa tombol scan
    marker.bindPopup(`
      <div style="font-family:inherit;font-size:12px;padding:2px;">
        <strong style="color:var(--rilo-wine);">${box.name}</strong><br>
        <span style="color:#64748b;">${box.location} • ${box.distance}</span><br>
        <small style="color:#15803d;font-weight:700;">${AppState.currentLang === "en" ? box.slotsAvailableEn : box.slotsAvailable}</small>
      </div>
    `);
  });
}

function initFullBintaroMap() {
  const fullEl = document.getElementById("fullDropMapContainer");
  if (!fullEl || fullMapInstance) return;

  if (typeof L === "undefined") return;

  fullMapInstance = L.map("fullDropMapContainer", {
    center: [-6.2840, 106.7275],
    zoom: 14,
    zoomControl: true,
    attributionControl: false
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18
  }).addTo(fullMapInstance);

  AppState.qrLocations.forEach((box) => {
    const customIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: `<div class="rilo-map-marker">R</div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    const marker = L.marker([box.lat, box.lng], { icon: customIcon }).addTo(fullMapInstance);
    marker.bindPopup(`
      <div style="font-family:inherit;font-size:12px;padding:2px;">
        <strong style="color:var(--rilo-wine);">${box.name}</strong><br>
        <span style="color:#64748b;">${box.location}</span><br>
        <small style="color:#15803d;font-weight:700;">${AppState.currentLang === "en" ? box.slotsAvailableEn : box.slotsAvailable}</small>
      </div>
    `);
  });

  renderFullMapBoxList();
}

let mapSearchQuery = "";

function filterMapLocationsList(query) {
  mapSearchQuery = (query || "").toLowerCase();
  renderFullMapBoxList();
}

let expandedStationId = null;

function renderFullMapBoxList() {
  const container = document.getElementById("fullMapListLocations");
  const countEl = document.getElementById("fullMapCountText");
  if (!container) return;

  const isEn = AppState.currentLang === "en";

  const list = AppState.qrLocations.filter((b) => {
    if (!mapSearchQuery) return true;
    return b.name.toLowerCase().includes(mapSearchQuery) || 
           b.location.toLowerCase().includes(mapSearchQuery) || 
           (b.address && b.address.toLowerCase().includes(mapSearchQuery));
  });

  if (countEl) {
    countEl.textContent = isEn ? `${list.length} Stations Ready` : `${list.length} Titik Siap Terima`;
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:28px 16px;background:#fff;border-radius:14px;border:1px solid var(--border-line);">
        <p style="font-size:12px;color:var(--text-sub);">${isEn ? 'No drop point matches search.' : 'Tidak ada titik yang cocok dengan pencarian.'}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map((b) => {
    const isExpanded = expandedStationId === b.id;
    const statusText = isEn ? (b.statusEn || "Ready to Accept") : (b.status || "Siap Terima");
    const slotsText = isEn ? (b.slotsAvailableEn || b.slotsAvailable) : b.slotsAvailable;

    return `
      <div class="box-station-card ${isExpanded ? 'expanded' : ''}" onclick="toggleStationDetailCard('${b.id}')">
        <div class="bsc-header-row">
          <div class="bsc-meta">
            <strong>${b.name}</strong>
            <span>${b.location}</span>
          </div>
          <div class="bsc-badges">
            <span class="bsc-dist-pill">${b.distance}</span>
            <span class="bsc-status-pill">${statusText}</span>
            <span class="bsc-chevron-icon">${ICONS.chevronDown}</span>
          </div>
        </div>

        <div class="bsc-expanded-detail">
          <div class="bed-row">
            <span>Alamat Lengkap</span>
            <strong>${b.address || b.location}</strong>
          </div>
          <div class="bed-row">
            <span>Tipe Fasilitas</span>
            <strong>${b.type}</strong>
          </div>
          <div class="bed-row">
            <span>Kapasitas Tersedia</span>
            <strong style="color:var(--eco-emerald);">${slotsText}</strong>
          </div>
          <div class="bed-row">
            <span>Jam Operasional</span>
            <strong>${b.operatingHours}</strong>
          </div>
          <div class="bed-row">
            <span>Kemasan Diterima</span>
            <strong>${b.accepted || 'Botol Plastik PET, Kaleng Minuman'}</strong>
          </div>

          ${b.note ? `<div class="bed-note-box">${b.note}</div>` : ''}

          <button type="button" class="btn-locate-map-chip" onclick="event.stopPropagation(); focusMapStationMarker('${b.id}');">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
            ${isEn ? 'Focus on Map' : 'Arahkan Peta ke Titik Ini'}
          </button>
        </div>
      </div>
    `;
  }).join("");
}

window.toggleStationDetailCard = function(boxId) {
  expandedStationId = (expandedStationId === boxId) ? null : boxId;
  renderFullMapBoxList();
  if (expandedStationId) {
    focusMapStationMarker(expandedStationId, false);
  }
};

window.focusMapStationMarker = function(boxId, notify = true) {
  const box = AppState.qrLocations.find(x => x.id === boxId);
  if (box && fullMapInstance) {
    fullMapInstance.setView([box.lat, box.lng], 16, { animate: true });
    if (notify) {
      showToast(`Peta terarah ke ${box.name}`, true);
    }
  }
};

// === FLOW SCAN QR DROP BOX (FIGMA SCAN QR COMMUNITY SPEC) ===
let isScannerFlashlightOn = false;

window.toggleScannerFlashlight = function() {
  isScannerFlashlightOn = !isScannerFlashlightOn;
  const btn = document.getElementById("btnToggleScannerFlash");
  const viewport = document.getElementById("qrFigmaViewport");
  const isEn = AppState.currentLang === "en";

  if (btn) {
    btn.classList.toggle("active-flash", isScannerFlashlightOn);
  }
  if (viewport) {
    viewport.style.background = isScannerFlashlightOn 
      ? "radial-gradient(circle at center, #38252d 0%, #171114 100%)" 
      : "radial-gradient(circle at center, #1e1519 0%, #0d0a0c 100%)";
  }

  showToast(isScannerFlashlightOn 
    ? (isEn ? "Flashlight turned on" : "Lampu kilat dinyalakan") 
    : (isEn ? "Flashlight turned off" : "Lampu kilat dimatikan"), true);
};

function openQrScanFlow() {
  if (!currentDepositSession.selectedBox) {
    currentDepositSession.selectedBox = AppState.qrLocations[0];
  }
  renderQrDetectedBox();
  switchView("scan-qr");
}

function renderQrDetectedBox() {
  const container = document.getElementById("qrDetectedHubCard");
  if (!container) return;

  const box = currentDepositSession.selectedBox || AppState.qrLocations[0];
  const isEn = AppState.currentLang === "en";

  container.innerHTML = `
    <div class="dhp-head">
      <strong>${box.name}</strong>
      <span style="font-size:11px;font-weight:700;color:var(--eco-emerald);">● ${isEn ? box.statusEn : box.status}</span>
    </div>
    <div class="dhp-desc">
      ${box.location} • ${box.distance}<br>
      <span style="color:var(--rilo-wine);font-weight:700;">${isEn ? box.slotsAvailableEn : box.slotsAvailable}</span> • ${box.operatingHours}
    </div>
    <div style="margin-bottom:12px;">
      <select id="selectQrBoxDropdown" class="input-kg-val" style="font-size:12px;padding:6px 10px;" onchange="changeQrBoxTarget(this.value)">
        ${AppState.qrLocations.map((b) => `<option value="${b.id}" ${b.id === box.id ? 'selected' : ''}>${b.name} (${b.distance})</option>`).join("")}
      </select>
    </div>
    <button class="btn-solid-wine" id="btnConfirmQrScanAction">
      <span>${ICONS.scanQr}</span> ${t("btnConnectBox")}
    </button>
  `;

  document.getElementById("btnConfirmQrScanAction").onclick = () => {
    showToast(`${t("btnConnectBox")} (${box.name})`, true);
    document.getElementById("activeHubTitle").textContent = box.name;
    document.getElementById("activeHubSubtitle").textContent = `${box.location} • ${isEn ? box.slotsAvailableEn : box.slotsAvailable}`;

    setTimeout(() => {
      switchView("deposit-input");
    }, 350);
  };
}

window.changeQrBoxTarget = function (boxId) {
  const box = AppState.qrLocations.find((b) => b.id === boxId);
  if (box) {
    currentDepositSession.selectedBox = box;
    renderQrDetectedBox();
  }
};

function setupQrScanner() {
  // Handled in renderQrDetectedBox
}

// === FLOW INPUT SETORAN SAMPAH ===
function setupDepositModeSwitcher() {
  const pillPiece = document.getElementById("pillModePiece");
  const pillKg = document.getElementById("pillModeKg");
  const panelPiece = document.getElementById("panelPieceItems");
  const panelKg = document.getElementById("panelKgItems");

  if (pillPiece && pillKg) {
    pillPiece.addEventListener("click", () => {
      pillPiece.classList.add("active");
      pillKg.classList.remove("active");
      panelPiece.style.display = "block";
      panelKg.style.display = "none";
      currentDepositSession.activeMode = "piece";
      calculateDepositTotal();
    });

    pillKg.addEventListener("click", () => {
      pillKg.classList.add("active");
      pillPiece.classList.remove("active");
      panelPiece.style.display = "none";
      panelKg.style.display = "block";
      currentDepositSession.activeMode = "kg";
      calculateDepositTotal();
    });
  }
}

let activeDepositCategory = "all";

function filterDepositCategory(cat, btn) {
  document.querySelectorAll("#depositPieceCategoryChips .dep-cat-pill").forEach(p => p.classList.remove("active"));
  if (btn) btn.classList.add("active");
  activeDepositCategory = cat;
  setupDepositItems();
}

function quickAddKgWeight(itemId, addAmount) {
  const current = currentDepositSession.kgWeights[itemId] || 0;
  const next = parseFloat((current + addAmount).toFixed(1));
  currentDepositSession.kgWeights[itemId] = next;

  const inputEl = document.getElementById(`kg_input_${itemId}`);
  if (inputEl) inputEl.value = next;

  calculateDepositTotal();
}

function setupDepositItems() {
  const isEn = AppState.currentLang === "en";

  // 1. Kategori Per Piece
  const pieceContainer = document.getElementById("panelPieceItems");
  if (pieceContainer) {
    const categories = [
      { idKey: "Botol Plastik PET", enKey: "PET Plastic Bottles" },
      { idKey: "Kaleng Minuman", enKey: "Beverage Cans" },
      { idKey: "Tutup Botol", enKey: "Bottle Caps" },
      { idKey: "Botol Kaca", enKey: "Glass Bottles" },
      { idKey: "Kemasan Karton Minuman", enKey: "Beverage Cartons" }
    ];

    let html = "";
    categories.forEach((cat) => {
      if (activeDepositCategory !== "all" && activeDepositCategory !== cat.idKey) {
        return;
      }

      const itemsInCat = AppState.itemsPerPiece.filter((i) => i.category === cat.idKey);
      html += `<div class="group-title-bar">
        <span>${isEn ? cat.enKey : cat.idKey}</span>
        <span style="font-size:10px;font-weight:600;color:var(--text-muted);">${itemsInCat.length} ukuran</span>
      </div>`;

      itemsInCat.forEach((item) => {
        const count = currentDepositSession.pieceCounts[item.id] || 0;
        const iconSvg = getMaterialIcon(item.iconType);
        const titleText = isEn ? item.labelEn : item.label;
        const unitText = isEn ? item.unitLabelEn : item.unitLabel;
        const hasItemClass = count > 0 ? "has-items" : "";

        html += `
          <div class="piece-stepper-card ${hasItemClass}" id="card_${item.id}">
            <div class="psc-left">
              <div class="psc-icon">${iconSvg}</div>
              <div class="psc-info">
                <strong>${titleText}</strong>
                <span>+${item.pointsPerUnit} pts / ${unitText}</span>
              </div>
            </div>
            <div class="counter-stepper">
              <button class="btn-count-step" type="button" onclick="stepPiece('${item.id}', -1)">−</button>
              <span class="count-display-num" id="val_${item.id}">${count}</span>
              <button class="btn-count-step" type="button" onclick="stepPiece('${item.id}', 1)">+</button>
            </div>
          </div>
        `;
      });
    });

    pieceContainer.innerHTML = html;
  }

  // 2. Kategori Per Kg (Kiloan dengan Quick Add Chips)
  const kgContainer = document.getElementById("panelKgItems");
  if (kgContainer) {
    kgContainer.innerHTML = AppState.itemsPerKg.map((item) => {
      const w = currentDepositSession.kgWeights[item.id] || 0;
      const iconSvg = getMaterialIcon(item.iconType);
      const titleText = isEn ? item.labelEn : item.label;
      const descText = isEn ? item.descEn : item.desc;
      return `
        <div class="kg-material-card">
          <div class="kmc-head">
            <strong>${iconSvg} ${titleText}</strong>
            <span class="kmc-rate">${item.rate} pts / kg</span>
          </div>
          <div class="kmc-desc">${descText}</div>
          <div class="kmc-input-row">
            <input type="number" 
                   class="input-kg-val" 
                   id="kg_input_${item.id}"
                   step="0.1" 
                   min="0" 
                   max="200" 
                   placeholder="0.0 kg" 
                   value="${w > 0 ? w : ''}" 
                   oninput="setKgWeight('${item.id}', this.value)" />
            <span style="font-size:12px;font-weight:800;color:var(--text-sub);">kg</span>
          </div>
          <div class="quick-kg-chips">
            <button type="button" class="btn-quick-kg" onclick="quickAddKgWeight('${item.id}', 0.5)">+0.5 kg</button>
            <button type="button" class="btn-quick-kg" onclick="quickAddKgWeight('${item.id}', 1.0)">+1 kg</button>
            <button type="button" class="btn-quick-kg" onclick="quickAddKgWeight('${item.id}', 2.0)">+2 kg</button>
            <button type="button" class="btn-quick-kg" onclick="quickAddKgWeight('${item.id}', 5.0)">+5 kg</button>
          </div>
        </div>
      `;
    }).join("");
  }

  const btnConfirm = document.getElementById("btnConfirmDepositAction");
  if (btnConfirm) {
    btnConfirm.addEventListener("click", submitFinalDeposit);
  }

  calculateDepositTotal();
}

window.stepPiece = function (itemId, delta) {
  const current = currentDepositSession.pieceCounts[itemId] || 0;
  const next = Math.max(0, current + delta);
  currentDepositSession.pieceCounts[itemId] = next;

  const el = document.getElementById(`val_${itemId}`);
  if (el) el.textContent = next;

  const card = document.getElementById(`card_${itemId}`);
  if (card) {
    card.classList.toggle("has-items", next > 0);
  }

  calculateDepositTotal();
};

window.setKgWeight = function (itemId, val) {
  const num = Math.max(0, parseFloat(val) || 0);
  currentDepositSession.kgWeights[itemId] = num;
  calculateDepositTotal();
};

function calculateDepositTotal() {
  let totalPoints = 0;
  let totalCount = 0;
  let totalWeight = 0;

  AppState.itemsPerPiece.forEach((item) => {
    const qty = currentDepositSession.pieceCounts[item.id] || 0;
    if (qty > 0) {
      totalPoints += qty * item.pointsPerUnit;
      totalCount += qty;
      if (item.category.includes("Botol Plastik")) totalWeight += qty * 0.035;
      else if (item.category.includes("Kaleng")) totalWeight += qty * 0.015;
      else if (item.category.includes("Tutup")) totalWeight += qty * 0.002;
      else if (item.category.includes("Kaca")) totalWeight += qty * 0.35;
      else totalWeight += qty * 0.02;
    }
  });

  AppState.itemsPerKg.forEach((item) => {
    const w = currentDepositSession.kgWeights[item.id] || 0;
    if (w > 0) {
      totalPoints += Math.round(w * item.rate);
      totalWeight += w;
    }
  });

  const estPtsEl = document.getElementById("checkoutTotalPointsDisplay");
  const estSubEl = document.getElementById("checkoutTotalSummaryDisplay");
  const btn = document.getElementById("btnConfirmDepositAction");

  if (estPtsEl) estPtsEl.textContent = `+${fmt(totalPoints)} pts`;

  if (estSubEl) {
    if (currentDepositSession.activeMode === "piece") {
      estSubEl.textContent = `${totalCount} ${t("itemsSelected")}`;
    } else {
      estSubEl.textContent = `${fmt(totalWeight)} ${t("kgRecorded")}`;
    }
  }

  if (btn) {
    btn.disabled = totalPoints <= 0;
  }
}

function submitFinalDeposit() {
  const box = currentDepositSession.selectedBox || AppState.qrLocations[0];
  let summaryText = "";
  let totalPoints = 0;
  let totalWeight = 0;
  const isEn = AppState.currentLang === "en";

  if (currentDepositSession.activeMode === "piece") {
    const summaryItems = [];
    AppState.itemsPerPiece.forEach((item) => {
      const qty = currentDepositSession.pieceCounts[item.id] || 0;
      if (qty > 0) {
        totalPoints += qty * item.pointsPerUnit;
        summaryItems.push(`${qty}x ${isEn ? item.labelEn : item.label}`);
        totalWeight += qty * 0.04;
      }
    });
    summaryText = summaryItems.slice(0, 3).join(", ") + (summaryItems.length > 3 ? "..." : "");
  } else {
    const summaryItems = [];
    AppState.itemsPerKg.forEach((item) => {
      const w = currentDepositSession.kgWeights[item.id] || 0;
      if (w > 0) {
        totalPoints += Math.round(w * item.rate);
        totalWeight += w;
        summaryItems.push(`${fmt(w)} kg ${isEn ? item.labelEn.split(" ")[0] : item.label.split(" ")[0]}`);
      }
    });
    summaryText = summaryItems.join(", ");
  }

  if (totalPoints <= 0) {
    showToast(isEn ? "Select at least 1 item to deposit." : "Pilih minimal 1 jenis sampah untuk disetor.", false);
    return;
  }

  const newTx = {
    id: `DEP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`,
    date: new Date().toISOString().slice(0, 10),
    time: isEn ? "Just now" : "Baru saja",
    qrBox: box.name,
    mode: currentDepositSession.activeMode === "piece" ? "Satuan (Per Piece)" : "Kiloan (Per Kg)",
    modeEn: currentDepositSession.activeMode === "piece" ? "By Piece" : "By Kg",
    summary: summaryText,
    weightApprox: parseFloat(totalWeight.toFixed(1)) || 0.5,
    pointsEarned: totalPoints,
    status: "Selesai",
    statusEn: "Completed"
  };

  AppState.deposits.unshift(newTx);
  AppState.user.points += totalPoints;
  AppState.user.totalWeight += newTx.weightApprox;
  AppState.user.completedDeposits += 1;

  // Reset counters
  currentDepositSession.pieceCounts = {};
  currentDepositSession.kgWeights = {};
  setupDepositItems();

  renderAllViews();
  showToast(isEn ? `Deposit recorded! +${fmt(totalPoints)} pts earned.` : `Setoran berhasil! +${fmt(totalPoints)} poin diperoleh.`, true);

  setTimeout(() => {
    switchView("transactions");
  }, 400);
}

// === NEWS ENGINE (FIGMA NEWS APP UI KIT SPEC) ===
let activeNewsCategory = "all";

function setupNewsCategoryChips() {
  document.querySelectorAll("#homeNewsAppChips .nac-chip").forEach(chip => {
    chip.onclick = function(e) {
      e.preventDefault();
      document.querySelectorAll("#homeNewsAppChips .nac-chip").forEach(c => c.classList.remove("active"));
      this.classList.add("active");
      activeNewsCategory = this.getAttribute("data-news-cat") || "all";
      renderNewsSection();
    };
  });
}

function renderNewsSection() {
  const container = document.getElementById("homeNewsCardsCarousel");
  const fullContainer = document.getElementById("allNewsFeedListContainer");
  const isEn = AppState.currentLang === "en";

  const list = (AppState.newsArticles || []).filter(n => {
    if (activeNewsCategory === "all") return true;
    return n.category === activeNewsCategory;
  });

  // 1. Render Carousel Horizontal di Home
  if (container) {
    if (list.length === 0) {
      container.innerHTML = `<div style="padding:20px;font-size:12px;color:var(--text-sub);">${isEn ? 'No news in this category.' : 'Belum ada berita di kategori ini.'}</div>`;
    } else {
      container.innerHTML = list.map(item => {
        const cat = isEn ? item.categoryEn : item.category;
        const title = isEn ? item.titleEn : item.title;
        const desc = isEn ? item.descEn : item.desc;
        const time = isEn ? item.timeAgoEn : item.timeAgo;
        const readText = isEn ? "Read Story ›" : "Baca Selengkapnya ›";

        return `
          <div class="news-figma-card" onclick="openNewsDetailModal('${item.id}')">
            <div class="nfc-image-wrap">
              <img src="${item.imageUrl}" alt="${title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=700&q=80'" />
              <span class="nfc-badge-floating">${cat}</span>
            </div>
            <div class="nfc-body">
              <div class="nfc-meta-row">
                <span class="author">${item.author}</span>
                <span>•</span>
                <span>${time}</span>
              </div>
              <h5>${title}</h5>
              <p>${desc}</p>
              <div class="nfc-footer-row">
                <span class="nfc-time-ago">${time}</span>
                <span class="nfc-read-more">${readText}</span>
              </div>
            </div>
          </div>
        `;
      }).join("");
    }
  }

  // 2. Render Full News Feed di Halaman Komunitas & Berita
  if (fullContainer) {
    fullContainer.innerHTML = (AppState.newsArticles || []).map(item => {
      const cat = isEn ? item.categoryEn : item.category;
      const title = isEn ? item.titleEn : item.title;
      const time = isEn ? item.timeAgoEn : item.timeAgo;

      return `
        <div class="clean-item-card" onclick="openNewsDetailModal('${item.id}')" style="align-items:flex-start;">
          <img src="${item.imageUrl}" alt="${title}" style="width:68px;height:68px;border-radius:10px;object-fit:cover;flex-shrink:0;margin-top:2px;" onerror="this.src='https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=700&q=80'" />
          <div class="cic-text" style="flex:1;min-width:0;padding-left:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
              <span class="ncs-category-tag tag-campus" style="font-size:9px;padding:1px 6px;">${cat}</span>
              <small style="font-size:10px;color:var(--text-muted);">${time}</small>
            </div>
            <strong style="font-size:12px;white-space:normal;line-height:1.35;margin-bottom:3px;">${title}</strong>
            <span style="font-size:10px;color:var(--text-sub);">${item.author}</span>
          </div>
        </div>
      `;
    }).join("");
  }
}

window.openNewsDetailModal = function(newsId) {
  const item = (AppState.newsArticles || []).find(n => n.id === newsId);
  if (!item) return;

  const isEn = AppState.currentLang === "en";
  const title = isEn ? item.titleEn : item.title;
  const content = isEn ? item.contentEn : item.content;
  const cat = isEn ? item.categoryEn : item.category;

  const modalBox = document.getElementById("modalSheetDynamicBox");
  modalBox.innerHTML = `
    <div class="news-detail-sheet">
      <img src="${item.imageUrl}" alt="${title}" onerror="this.src='https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=700&q=80'" />
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
        <span class="ncs-category-tag tag-campus">${cat}</span>
        <span style="font-size:11px;color:var(--text-muted);">${item.author} • ${isEn ? item.timeAgoEn : item.timeAgo}</span>
      </div>
      <h3 style="font-size:16px;line-height:1.35;margin-bottom:12px;font-weight:850;">${title}</h3>
      <p style="font-size:12px;line-height:1.65;color:var(--text-sub);margin-bottom:20px;">${content}</p>
      <button class="btn-solid-wine" onclick="closeModalSheet()">${isEn ? 'Close News' : 'Tutup Berita'}</button>
    </div>
  `;

  openModalSheet();
};

// === RENDER UTAMA SEMUA VIEW ===
function renderAllViews() {
  applyLanguageTranslations();
  renderHome();
  renderNewsSection();
  renderTransactions();
  renderRewards();
  renderImpact();
  renderGuides();
  renderProfile();
}

// 1. Beranda (Home)
function renderHome() {
  const user = AppState.user;
  const isEn = AppState.currentLang === "en";

  document.getElementById("locationTagText").textContent = user.locationTag;
  document.getElementById("homeGreetingName").textContent = isEn ? `Hello, ${user.name.split(" ")[0]}!` : `Halo, ${user.name.split(" ")[0]}!`;
  const heroTitle = isEn ? "★ Eco Hero" : "★ Pahlawan Hijau";
  const pillEl = document.getElementById("userLevelPill");
  if (pillEl) pillEl.textContent = heroTitle;

  const cardPillEl = document.getElementById("walletCardLevelPill");
  if (cardPillEl) cardPillEl.textContent = heroTitle;
  document.getElementById("homeAvatarText").textContent = user.avatar || user.name[0];

  // Point Compact Strip Card
  document.getElementById("walletPointsBigVal").textContent = fmt(user.points);
  const rupiahVal = Math.round(user.points * 10);
  document.getElementById("walletConversionRupiah").textContent = `≈ Rp ${fmt(rupiahVal)}`;

  // Nearest Drop Box Info (Bintaro Xchange)
  const nearestBox = AppState.qrLocations[0];
  document.getElementById("nearestDropBoxName").textContent = nearestBox.name;
  document.getElementById("nearestDropBoxSub").textContent = `${nearestBox.location} • ${nearestBox.distance}`;
  document.getElementById("nearestDropBoxStatus").textContent = isEn ? nearestBox.statusEn : nearestBox.status;

  // 3 Aktivitas Terakhir
  const recentList = document.getElementById("homeRecentActivityContainer");
  if (recentList) {
    const list = AppState.deposits.slice(0, 3);
    if (list.length === 0) {
      recentList.innerHTML = `<div style="text-align:center;padding:16px;font-size:12px;color:var(--text-sub);">${isEn ? 'No recent deposits.' : 'Belum ada riwayat setoran.'}</div>`;
    } else {
      recentList.innerHTML = list.map((tx) => `
        <div class="clean-item-card" onclick="openTxReceiptModal('${tx.id}')">
          <div class="cic-left">
            <div class="cic-icon-wrap">${ICONS.history}</div>
            <div class="cic-text">
              <strong>${tx.summary}</strong>
              <span>${formatDate(tx.date)} • ${tx.qrBox}</span>
            </div>
          </div>
          <div class="cic-right">
            <div class="cic-points">+${fmt(tx.pointsEarned)} pts</div>
            <span class="badge-tag-status">${isEn ? tx.statusEn : tx.status}</span>
          </div>
        </div>
      `).join("");
    }
  }
}

// 2. Riwayat Transaksi
function renderTransactions() {
  const container = document.getElementById("transactionsFullListContainer");
  if (!container) return;
  const isEn = AppState.currentLang === "en";

  if (AppState.deposits.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px;background:#fff;border-radius:14px;border:1px solid var(--border-line);">
        <p style="font-size:12px;color:var(--text-sub);">${isEn ? 'No recorded deposits yet.' : 'Belum ada catatan setoran sampah.'}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = AppState.deposits.map((tx) => `
    <div class="clean-item-card" onclick="openTxReceiptModal('${tx.id}')">
      <div class="cic-left">
        <div class="cic-icon-wrap">${ICONS.history}</div>
        <div class="cic-text">
          <strong>${tx.summary}</strong>
          <span>${formatDate(tx.date)} • ${tx.qrBox}</span>
        </div>
      </div>
      <div class="cic-right">
        <div class="cic-points">+${fmt(tx.pointsEarned)} pts</div>
        <span class="badge-tag-status">${isEn ? tx.statusEn : tx.status}</span>
      </div>
    </div>
  `).join("");
}

// 3. Rewards & Penukaran (Exchange RuntahPedia Style)
let activeRewardFilter = "all";

// Modal Pilihan e-Wallet (Official Logos & Flow Baru)
window.openEwalletSelectionModal = function() {
  const isEn = AppState.currentLang === "en";
  const content = document.getElementById("modalSheetDynamicBox");

  const ewallets = (AppState.payoutChannels || []).filter(c => c.category === "ewallet");

  content.innerHTML = `
    <div style="text-align:center;margin-bottom:16px;">
      <h3 style="font-size:16px;font-weight:850;margin-bottom:4px;">
        ${isEn ? 'Select e-Wallet Partner' : 'Pilih Dompet Digital (e-Wallet)'}
      </h3>
      <span style="font-size:11px;color:var(--text-sub);">
        ${isEn ? 'Points will be converted directly into your active balance' : 'Poin langsung dikonversi menjadi saldo aktif tanpa potongan admin'}
      </span>
    </div>

    <div class="wallet-channel-select-list">
      ${ewallets.map(w => {
        let logoSvg = ICONS.gopay;
        if (w.name.includes("DANA")) logoSvg = ICONS.dana;
        else if (w.name.includes("Shopee")) logoSvg = ICONS.shopeepay;
        else if (w.name.includes("OVO")) logoSvg = ICONS.ovo;

        return `
          <div class="wallet-channel-row" onclick="openPayoutModal('${w.id}')">
            <div class="wcr-left">
              <div class="wcr-logo-box">${logoSvg}</div>
              <div class="wcr-info">
                <strong>${w.name}</strong>
                <span>${isEn ? w.descEn : w.desc}</span>
              </div>
            </div>
            <button type="button" class="btn-solid-wine" style="padding:6px 14px;font-size:11px;width:auto;box-shadow:none;">
              ${t("btnCashoutAction")}
            </button>
          </div>
        `;
      }).join("")}
    </div>

    <button type="button" class="btn-solid-wine" style="background:var(--surface-subtle);color:var(--text-main);box-shadow:none;" onclick="closeModalSheet()">
      ${isEn ? 'Close' : 'Tutup'}
    </button>
  `;

  openModalSheet();
};

// Modal Alur Khusus Transfer Bank (Jenis Bank > Rekening > Nominal > Transfer > Selesai)
let bankTransferState = {
  selectedBank: null,
  accountNumber: "",
  accountName: "",
  selectedDenom: 2500
};

window.openBankTransferFlowModal = function(step = 1) {
  const isEn = AppState.currentLang === "en";
  const content = document.getElementById("modalSheetDynamicBox");
  const banks = (AppState.payoutChannels || []).filter(c => c.category === "bank");

  if (step === 1) {
    // LANGKAH 1: PILIH JENIS BANK
    content.innerHTML = `
      <div style="text-align:center;margin-bottom:14px;">
        <div class="bank-step-indicator">
          <span class="bank-step-dot active">1</span>
          <span>${isEn ? 'Bank' : 'Jenis Bank'}</span>
          <span>•</span>
          <span class="bank-step-dot">2</span>
          <span>${isEn ? 'Account' : 'Rekening'}</span>
          <span>•</span>
          <span class="bank-step-dot">3</span>
          <span>${isEn ? 'Amount' : 'Nominal'}</span>
        </div>
        <h3 style="font-size:16px;font-weight:850;margin-bottom:4px;">
          ${isEn ? 'Select Destination Bank' : 'Pilih Rekening Bank Tujuan'}
        </h3>
        <span style="font-size:11px;color:var(--text-sub);">
          ${isEn ? 'Direct bank transfer to Indonesian commercial banks' : 'Transfer langsung ke rekening bank umum di Indonesia'}
        </span>
      </div>

      <div class="wallet-channel-select-list">
        ${banks.map(b => {
          let bankLogoSvg = ICONS.bca;
          if (b.name.includes("Mandiri")) bankLogoSvg = ICONS.mandiri;
          else if (b.name.includes("BRI")) bankLogoSvg = ICONS.bri;

          return `
            <div class="wallet-channel-row" onclick="chooseBankAndNext('${b.id}')">
              <div class="wcr-left">
                <div class="wcr-logo-box">
                  ${bankLogoSvg}
                </div>
                <div class="wcr-info">
                  <strong style="color:${b.color};">${b.name}</strong>
                  <span>${isEn ? b.descEn : b.desc}</span>
                </div>
              </div>
              <span style="color:var(--rilo-wine);font-size:14px;font-weight:800;">›</span>
            </div>
          `;
        }).join("")}
      </div>

      <button type="button" class="btn-solid-wine" style="background:var(--surface-subtle);color:var(--text-main);box-shadow:none;" onclick="closeModalSheet()">
        ${isEn ? 'Cancel' : 'Batal'}
      </button>
    `;
    openModalSheet();
  } else if (step === 2) {
    // LANGKAH 2: INPUT NOMOR REKENING & NAMA PENERIMA
    const bank = bankTransferState.selectedBank || banks[0];

    content.innerHTML = `
      <div style="text-align:center;margin-bottom:14px;">
        <div class="bank-step-indicator">
          <span class="bank-step-dot">✓</span>
          <span>${bank.name}</span>
          <span>•</span>
          <span class="bank-step-dot active">2</span>
          <span>${isEn ? 'Account' : 'Rekening'}</span>
          <span>•</span>
          <span class="bank-step-dot">3</span>
          <span>${isEn ? 'Amount' : 'Nominal'}</span>
        </div>
        <h3 style="font-size:16px;font-weight:850;margin-bottom:4px;">
          ${isEn ? 'Enter ' + bank.name + ' Account' : 'Masukkan Rekening ' + bank.name}
        </h3>
        <span style="font-size:11px;color:var(--text-sub);">
          ${isEn ? 'Ensure the beneficiary name matches your bank book' : 'Pastikan nama penerima sesuai buku tabungan'}
        </span>
      </div>

      <form id="formBankStep2" onsubmit="event.preventDefault(); submitBankStep2();">
        <div style="margin-bottom:12px;text-align:left;">
          <label style="font-size:11px;font-weight:750;display:block;margin-bottom:4px;">
            ${isEn ? 'Bank Account Number' : 'Nomor Rekening Bank'}
          </label>
          <input type="number" id="bankInputAccNumber" class="input-kg-val" style="width:100%;font-size:14px;font-weight:750;" placeholder="Contoh: 1234567890" value="${bankTransferState.accountNumber}" required />
        </div>
        <div style="margin-bottom:16px;text-align:left;">
          <label style="font-size:11px;font-weight:750;display:block;margin-bottom:4px;">
            ${isEn ? 'Beneficiary Name' : 'Nama Lengkap Pemilik Rekening'}
          </label>
          <input type="text" id="bankInputAccName" class="input-kg-val" style="width:100%;font-size:13px;" placeholder="Contoh: Kaila Zanita" value="${bankTransferState.accountName || AppState.user.name}" required />
        </div>

        <div style="display:flex;gap:10px;">
          <button type="button" class="btn-solid-wine" style="background:var(--surface-subtle);color:var(--text-main);box-shadow:none;" onclick="openBankTransferFlowModal(1)">
            ${isEn ? 'Back' : 'Kembali'}
          </button>
          <button type="submit" class="btn-solid-wine">
            ${isEn ? 'Next: Amount' : 'Lanjut: Pilih Nominal'}
          </button>
        </div>
      </form>
    `;
  } else if (step === 3) {
    // LANGKAH 3: PILIH NOMINAL TRANSFER & KONFIRMASI TRANSFER
    const bank = bankTransferState.selectedBank || banks[0];
    const denoms = (AppState.payoutDenominations || []).filter(d => d.points >= 2000);

    content.innerHTML = `
      <div style="text-align:center;margin-bottom:14px;">
        <div class="bank-step-indicator">
          <span class="bank-step-dot">✓</span>
          <span>${bank.name}</span>
          <span>•</span>
          <span class="bank-step-dot">✓</span>
          <span>Rekening</span>
          <span>•</span>
          <span class="bank-step-dot active">3</span>
          <span>${isEn ? 'Transfer' : 'Pencairan'}</span>
        </div>
        <h3 style="font-size:16px;font-weight:850;margin-bottom:2px;">
          ${isEn ? 'Confirm Bank Transfer' : 'Konfirmasi Transfer Bank'}
        </h3>
        <span style="font-size:11px;color:var(--text-sub);">
          ${bank.name} • ${bankTransferState.accountNumber} (${bankTransferState.accountName})
        </span>
      </div>

      <div style="margin-bottom:12px;">
        <label style="font-size:11px;font-weight:750;color:var(--text-main);display:block;margin-bottom:6px;">
          ${isEn ? 'Select Transfer Amount' : 'Pilih Nominal Saldo'}
        </label>
        <div class="denom-grid-chips">
          ${denoms.map(d => {
            const isSelected = d.points === bankTransferState.selectedDenom;
            const isEligible = AppState.user.points >= d.points;
            return `
              <div class="denom-chip-btn ${isSelected ? 'active' : ''}" 
                   onclick="selectBankDenomination(${d.points}, this)"
                   style="${!isEligible ? 'opacity:0.5;' : ''}">
                <strong>${d.label}</strong>
                <span>${fmt(d.points)} pts</span>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <div style="background:var(--rilo-wine-soft);border:1px dashed var(--rilo-wine-border);border-radius:12px;padding:12px;text-align:center;margin-bottom:16px;">
        <span style="font-size:10px;color:var(--text-sub);text-transform:uppercase;font-weight:700;">
          ${isEn ? 'Points Required' : 'Poin yang Dipotong'}
        </span>
        <div style="font-size:22px;font-weight:850;color:var(--rilo-wine);margin:2px 0;" id="bankModalRequiredPts">
          ${fmt(bankTransferState.selectedDenom)} Poin
        </div>
        <small style="font-size:11px;color:var(--text-sub);">${isEn ? 'Current Balance' : 'Saldo Kamu Saat Ini'}: <b>${fmt(AppState.user.points)} pts</b></small>
      </div>

      <div style="display:flex;gap:10px;">
        <button type="button" class="btn-solid-wine" style="background:var(--surface-subtle);color:var(--text-main);box-shadow:none;" onclick="openBankTransferFlowModal(2)">
          ${isEn ? 'Back' : 'Kembali'}
        </button>
        <button type="button" class="btn-solid-wine" id="btnExecuteBankTransferAction">
          ${t("btnTransferNow")}
        </button>
      </div>
    `;

    document.getElementById("btnExecuteBankTransferAction").onclick = executeBankTransferSubmission;
  }
};

window.chooseBankAndNext = function(bankId) {
  const bank = (AppState.payoutChannels || []).find(b => b.id === bankId);
  if (bank) {
    bankTransferState.selectedBank = bank;
    openBankTransferFlowModal(2);
  }
};

window.submitBankStep2 = function() {
  const accNum = document.getElementById("bankInputAccNumber").value.trim();
  const accName = document.getElementById("bankInputAccName").value.trim();
  const isEn = AppState.currentLang === "en";

  if (!accNum || !accName) {
    showToast(isEn ? "Please fill in bank account number and name" : "Lengkapi nomor rekening dan nama pemilik", false);
    return;
  }

  bankTransferState.accountNumber = accNum;
  bankTransferState.accountName = accName;
  openBankTransferFlowModal(3);
};

window.selectBankDenomination = function(pts, btn) {
  bankTransferState.selectedDenom = pts;
  document.querySelectorAll(".denom-chip-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const el = document.getElementById("bankModalRequiredPts");
  if (el) el.textContent = `${fmt(pts)} Poin`;
};

function executeBankTransferSubmission() {
  const isEn = AppState.currentLang === "en";
  const pts = bankTransferState.selectedDenom || 2500;

  if (AppState.user.points < pts) {
    showToast(isEn ? `Insufficient points. You need ${fmt(pts - AppState.user.points)} more pts.` : `Poin belum cukup. Butuh ${fmt(pts - AppState.user.points)} poin lagi.`, false);
    return;
  }

  const bank = bankTransferState.selectedBank || { name: "Bank BCA" };
  const denomObj = (AppState.payoutDenominations || []).find(d => d.points === pts) || { points: pts, rupiah: pts * 10, label: "Rp " + fmt(pts * 10) };

  // 1. Potong Poin
  AppState.user.points -= pts;

  // 2. Buat ID Transaksi Transfer Bank
  const code = `TRF-${bank.name.replace(/[^A-Z0-9]/gi, '').toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

  AppState.redemptions.unshift({
    id: `RDM-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    partner: bank.name,
    rewardTitle: `Transfer ${bank.name} ${denomObj.label}`,
    rewardTitleEn: `${bank.name} Transfer ${denomObj.label}`,
    pointsSpent: pts,
    code: code,
    expiry: isEn ? "Completed" : "Selesai",
    status: isEn ? "Transfer Successful" : "Berhasil Ditransfer",
    statusEn: "Transfer Successful",
    type: "bank_transfer",
    amountRupiah: denomObj.rupiah,
    targetAccount: `${bankTransferState.accountNumber} a/n ${bankTransferState.accountName}`
  });

  // 3. Update UI Realtime
  updateVoucherCounterUI();
  renderAllViews();

  // 4. Struk Bukti Transfer Selesai (Sesuai Alur: Jenis Bank > Nominal > Transfer > Selesai)
  const content = document.getElementById("modalSheetDynamicBox");
  content.innerHTML = `
    <div style="text-align:center;padding:6px 0;">
      <div style="width:48px;height:48px;border-radius:50%;background:var(--eco-emerald-soft);color:var(--eco-emerald);display:grid;place-items:center;margin:0 auto 10px;">
        ${ICONS.check}
      </div>
      <h3 style="font-size:16px;color:var(--rilo-wine);margin-bottom:4px;">
        ${isEn ? 'Bank Transfer Successful!' : 'Transfer Bank Berhasil!'}
      </h3>
      <p style="font-size:12px;color:var(--text-sub);margin-bottom:14px;">
        ${isEn 
          ? `${denomObj.label} has been transferred to ${bank.name} a/c ${bankTransferState.accountNumber} (${bankTransferState.accountName}).` 
          : `${denomObj.label} berhasil dikirim ke ${bank.name} No. Rek ${bankTransferState.accountNumber} (${bankTransferState.accountName}).`}
      </p>

      <div style="background:#f8fafc;border-radius:12px;padding:12px 14px;border:1.5px dashed #cbd5e1;margin-bottom:16px;text-align:left;">
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;">
          <span style="color:var(--text-muted);">${isEn ? 'Reference Number' : 'No. Referensi'}:</span>
          <strong>${code}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;">
          <span style="color:var(--text-muted);">${isEn ? 'Points Redeemed' : 'Poin Ditukar'}:</span>
          <strong style="color:var(--rilo-wine);">${fmt(pts)} pts</strong>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;">
          <span style="color:var(--text-muted);">${isEn ? 'Status' : 'Status'}:</span>
          <span class="bsc-status-pill" style="height:20px;font-size:10px;">${isEn ? 'Success' : 'Berhasil'}</span>
        </div>
      </div>

      <button class="btn-solid-wine" onclick="closeModalSheet(); switchView('my-vouchers');">
        ${isEn ? 'View in My Vouchers & Payouts' : 'Lihat di Voucher & Saldo Saya'}
      </button>
    </div>
  `;

  showToast(isEn ? "Bank transfer sent successfully!" : "Transfer bank berhasil dikirim!", true);
}

// Modal Payout e-Wallet & Bank Transfer (Wpay UI Kit Style)
let selectedPayoutDenom = 1000;

window.openPayoutModal = function(channelId) {
  const ch = (AppState.payoutChannels || []).find(c => c.id === channelId);
  if (!ch) return;

  const isEn = AppState.currentLang === "en";
  const content = document.getElementById("modalSheetDynamicBox");

  selectedPayoutDenom = ch.minPoints || 1000;
  const isBank = ch.category === "bank";

  content.innerHTML = `
    <div style="text-align:center;margin-bottom:14px;">
      <div style="width:48px;height:48px;border-radius:12px;background:${ch.color}15;color:${ch.color};display:grid;place-items:center;margin:0 auto 8px;font-size:18px;font-weight:850;">
        ${ch.name.slice(0, 3)}
      </div>
      <h3 style="font-size:16px;font-weight:850;margin-bottom:2px;">${isEn ? 'Cashout to ' + ch.name : 'Tukar ke Saldo ' + ch.name}</h3>
      <span style="font-size:11px;color:var(--text-sub);">${isEn ? ch.descEn : ch.desc}</span>
    </div>

    <!-- Pilihan Nominal Penukaran Poin -->
    <div style="margin-bottom:12px;">
      <label style="font-size:11px;font-weight:750;color:var(--text-main);display:block;margin-bottom:6px;">
        ${isEn ? 'Select Payout Denomination' : 'Pilih Nominal Saldo'}
      </label>
      <div class="denom-grid-chips">
        ${(AppState.payoutDenominations || []).map(d => {
          const isSelected = d.points === selectedPayoutDenom;
          const isEligible = AppState.user.points >= d.points;
          return `
            <div class="denom-chip-btn ${isSelected ? 'active' : ''}" 
                 onclick="selectPayoutDenomination(${d.points}, this)"
                 style="${!isEligible ? 'opacity:0.5;' : ''}">
              <strong>${d.label}</strong>
              <span>${fmt(d.points)} pts</span>
            </div>
          `;
        }).join("")}
      </div>
    </div>

    <!-- Input Akun Tujuan -->
    <div style="margin-bottom:14px;text-align:left;">
      <label style="font-size:11px;font-weight:750;color:var(--text-main);display:block;margin-bottom:4px;">
        ${isEn ? ch.inputLabelEn : ch.inputLabel}
      </label>
      <input type="text" id="payoutAccountTarget" class="input-kg-val" style="width:100%;font-size:13px;font-weight:700;" placeholder="${ch.placeholder}" value="${isBank ? '' : (AppState.user.phone || '0812-3456-7890')}" required />
      <small style="font-size:10px;color:var(--text-muted);margin-top:3px;display:block;">
        ${isEn ? 'Make sure destination account details are valid.' : 'Pastikan nomor rekening/e-wallet sudah sesuai atas nama akunmu.'}
      </small>
    </div>

    <div style="background:var(--rilo-wine-soft);border:1px dashed var(--rilo-wine-border);border-radius:12px;padding:12px;text-align:center;margin-bottom:16px;">
      <span style="font-size:10px;color:var(--text-sub);text-transform:uppercase;font-weight:700;">${isEn ? 'Points Required' : 'Poin yang Dipotong'}</span>
      <div style="font-size:22px;font-weight:850;color:var(--rilo-wine);margin:2px 0;" id="modalRequiredPointsDisplay">${fmt(selectedPayoutDenom)} Poin</div>
      <small style="font-size:11px;color:var(--text-sub);">${isEn ? 'Current Balance' : 'Saldo Kamu Saat Ini'}: <b>${fmt(AppState.user.points)} pts</b></small>
    </div>

    <div style="display:flex;gap:10px;">
      <button class="btn-solid-wine" style="background:var(--surface-subtle);color:var(--text-main);box-shadow:none;" onclick="closeModalSheet()">${isEn ? 'Cancel' : 'Batal'}</button>
      <button class="btn-solid-wine" id="btnExecutePayoutAction">${isEn ? 'Process Payout' : 'Proses Pencairan'}</button>
    </div>
  `;

  openModalSheet();

  document.getElementById("btnExecutePayoutAction").onclick = () => {
    if (AppState.user.points < selectedPayoutDenom) {
      showToast(isEn ? `Insufficient points. You need ${fmt(selectedPayoutDenom - AppState.user.points)} more pts.` : `Poin belum cukup. Butuh ${fmt(selectedPayoutDenom - AppState.user.points)} poin lagi.`, false);
      return;
    }

    const inputTarget = document.getElementById("payoutAccountTarget").value.trim();
    if (!inputTarget) {
      showToast(isEn ? "Please enter destination account/phone number" : "Masukkan nomor tujuan akun pencairan", false);
      return;
    }

    const denomObj = (AppState.payoutDenominations || []).find(d => d.points === selectedPayoutDenom) || { points: selectedPayoutDenom, rupiah: selectedPayoutDenom * 10, label: "Rp " + fmt(selectedPayoutDenom * 10) };

    // 1. Potong Poin
    AppState.user.points -= selectedPayoutDenom;

    // 2. Catat Bukti Transfer
    const code = `PAY-${ch.name.replace(/[^A-Z0-9]/gi, '').toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    AppState.redemptions.unshift({
      id: `RDM-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      partner: ch.name,
      rewardTitle: `Saldo ${ch.name} ${denomObj.label}`,
      rewardTitleEn: `${ch.name} Balance ${denomObj.label}`,
      pointsSpent: selectedPayoutDenom,
      code: code,
      expiry: isEn ? "Completed" : "Selesai",
      status: isEn ? "Transfer Successful" : "Berhasil Ditransfer",
      statusEn: "Transfer Successful",
      type: "payout",
      amountRupiah: denomObj.rupiah,
      targetAccount: inputTarget
    });

    // 3. Update UI Realtime
    updateVoucherCounterUI();
    renderAllViews();

    // 4. Struk Bukti Sukses Transfer Wpay
    content.innerHTML = `
      <div style="text-align:center;padding:6px 0;">
        <div style="width:48px;height:48px;border-radius:50%;background:var(--eco-emerald-soft);color:var(--eco-emerald);display:grid;place-items:center;margin:0 auto 10px;">
          ${ICONS.check}
        </div>
        <h3 style="font-size:16px;color:var(--rilo-wine);margin-bottom:4px;">
          ${isEn ? 'Payout Sent Successfully!' : 'Saldo Berhasil Ditransfer!'}
        </h3>
        <p style="font-size:12px;color:var(--text-sub);margin-bottom:14px;">
          ${isEn 
            ? `${denomObj.label} has been transferred to ${ch.name} (${inputTarget}).` 
            : `${denomObj.label} berhasil dikirimkan ke ${ch.name} (${inputTarget}).`}
        </p>

        <div style="background:#f8fafc;border-radius:12px;padding:12px 14px;border:1.5px dashed #cbd5e1;margin-bottom:16px;text-align:left;">
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;">
            <span style="color:var(--text-muted);">${isEn ? 'Ref ID' : 'ID Referensi'}:</span>
            <strong>${code}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;">
            <span style="color:var(--text-muted);">${isEn ? 'Points Exchanged' : 'Poin Ditukar'}:</span>
            <strong style="color:var(--rilo-wine);">${fmt(selectedPayoutDenom)} pts</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;">
            <span style="color:var(--text-muted);">${isEn ? 'Status' : 'Status'}:</span>
            <span class="bsc-status-pill" style="height:20px;font-size:10px;">${isEn ? 'Success' : 'Berhasil'}</span>
          </div>
        </div>

        <button class="btn-solid-wine" onclick="closeModalSheet(); switchView('my-vouchers');">
          ${isEn ? 'View in My Vouchers & Payouts' : 'Lihat di Voucher & Saldo Saya'}
        </button>
      </div>
    `;

    showToast(isEn ? "Payout transfer completed!" : "Pencairan saldo berhasil!", true);
  };
};

window.selectPayoutDenomination = function(pts, btn) {
  selectedPayoutDenom = pts;
  document.querySelectorAll(".denom-chip-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const el = document.getElementById("modalRequiredPointsDisplay");
  if (el) el.textContent = `${fmt(pts)} Poin`;
};

function updateVoucherCounterUI() {
  const count = (AppState.redemptions && AppState.redemptions.length) ? AppState.redemptions.length : 0;
  document.querySelectorAll("#myVouchersCounterBadge, .my-vouchers-count-badge, .home-voucher-counter").forEach((el) => {
    el.textContent = count;
  });
}

function renderRewards() {
  const container = document.getElementById("rewardsCardsContainer");
  const balanceEl = document.getElementById("rewardsPointsBalanceDisplay");
  const rupiahEstEl = document.getElementById("rewardsRupiahEst");
  const isEn = AppState.currentLang === "en";

  if (balanceEl) balanceEl.textContent = fmt(AppState.user.points);
  if (rupiahEstEl) rupiahEstEl.textContent = `≈ Rp ${fmt(Math.round(AppState.user.points * 10))}`;
  
  updateVoucherCounterUI();

  if (!container) return;

  const filteredRewards = AppState.rewards.filter((r) => {
    if (activeRewardFilter === "all") return true;
    return r.tag === activeRewardFilter;
  });

  if (filteredRewards.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:32px 16px;background:#fff;border-radius:14px;border:1px solid var(--border-line);">
        <p style="font-size:12px;color:var(--text-sub);">${isEn ? 'No rewards in this category.' : 'Belum ada hadiah di kategori ini.'}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredRewards.map((r) => {
    const canAfford = AppState.user.points >= r.pointsCost;
    const titleText = isEn ? r.titleEn : r.title;
    const descText = isEn ? r.descriptionEn : r.description;
    const btnText = isEn ? "Redeem" : "Tukar";

    return `
      <div class="exchange-item-ticket">
        <div class="eit-left">
          <div class="eit-icon-box">${ICONS.gift}</div>
          <div class="eit-info">
            <span class="eit-partner-tag">${r.partner} • ${isEn ? r.tagEn : r.tag}</span>
            <strong>${titleText}</strong>
            <p>${descText}</p>
          </div>
        </div>
        <div class="eit-right-cost">
          <span class="eit-cost-badge">${fmt(r.pointsCost)} pts</span>
          <button class="btn-redeem-ticket" 
                  onclick="promptVoucherRedeem('${r.id}')"
                  ${canAfford ? '' : 'disabled'}
                  style="background: ${canAfford ? 'var(--rilo-wine)' : 'var(--text-muted)'}">
            ${btnText}
          </button>
        </div>
      </div>
    `;
  }).join("");
}

window.promptVoucherRedeem = function (rewardId) {
  const reward = AppState.rewards.find((r) => r.id === rewardId);
  if (!reward) return;
  const isEn = AppState.currentLang === "en";

  if (AppState.user.points < reward.pointsCost) {
    showToast(isEn ? `Insufficient points. You need ${fmt(reward.pointsCost - AppState.user.points)} more pts.` : `Poin belum mencukupi. Butuh ${fmt(reward.pointsCost - AppState.user.points)} poin lagi.`, false);
    return;
  }

  const content = document.getElementById("modalSheetDynamicBox");
  const titleText = isEn ? reward.titleEn : reward.title;
  const descText = isEn ? reward.descriptionEn : reward.description;
  const isEwallet = reward.type === "ewallet";

  content.innerHTML = `
    <div style="text-align:center;margin-bottom:16px;">
      <div style="width:50px;height:50px;border-radius:12px;background:var(--rilo-wine-soft);color:var(--rilo-wine);display:grid;place-items:center;margin:0 auto 10px;">
        ${isEwallet ? ICONS.coins : ICONS.gift}
      </div>
      <span style="font-size:11px;font-weight:750;color:var(--text-muted);text-transform:uppercase;">${reward.partner}</span>
      <h3 style="font-size:16px;margin:2px 0 4px;">${titleText}</h3>
      <p style="font-size:12px;color:var(--text-sub);">${descText}</p>
    </div>

    ${isEwallet ? `
      <div style="margin-bottom:14px;text-align:left;">
        <label style="font-size:11px;font-weight:750;color:var(--text-main);display:block;margin-bottom:4px;">
          ${isEn ? 'Destination Phone Number (e-Wallet)' : 'Nomor Handphone Akun e-Wallet'}
        </label>
        <input type="tel" id="ewalletTargetPhone" class="input-kg-val" style="width:100%;font-size:13px;font-weight:700;" placeholder="0812xxxxxxxx" value="${AppState.user.phone || '0812-3456-7890'}" required />
        <small style="font-size:10px;color:var(--text-muted);margin-top:3px;display:block;">
          ${isEn ? 'Make sure the e-wallet account name matches your registered name.' : 'Pastikan nomor akun terdaftar aktif di aplikasi ' + reward.partner + '.'}
        </small>
      </div>
    ` : ''}

    <div style="background:var(--rilo-wine-soft);border:1px dashed var(--rilo-wine-border);border-radius:12px;padding:12px;text-align:center;margin-bottom:16px;">
      <span style="font-size:10px;color:var(--text-sub);text-transform:uppercase;font-weight:700;">${isEn ? 'Points Cost' : 'Biaya Penukaran'}</span>
      <div style="font-size:22px;font-weight:850;color:var(--rilo-wine);margin:2px 0;">${fmt(reward.pointsCost)} Poin</div>
      <small style="font-size:11px;color:var(--text-sub);">${isEn ? 'Remaining balance' : 'Sisa saldo'}: <b>${fmt(AppState.user.points - reward.pointsCost)} pts</b></small>
    </div>

    <div style="display:flex;gap:10px;">
      <button class="btn-solid-wine" style="background:var(--surface-subtle);color:var(--text-main);box-shadow:none;" onclick="closeModalSheet()">${isEn ? 'Cancel' : 'Batal'}</button>
      <button class="btn-solid-wine" id="btnConfirmDeductPointsAction">${isEn ? (isEwallet ? 'Transfer Now' : 'Confirm Redeem') : (isEwallet ? 'Tarik Saldo Sekarang' : 'Konfirmasi Tukar')}</button>
    </div>
  `;

  openModalSheet();

  document.getElementById("btnConfirmDeductPointsAction").onclick = () => {
    let targetPhone = "";
    if (isEwallet) {
      const phoneInput = document.getElementById("ewalletTargetPhone");
      if (phoneInput && !phoneInput.value.trim()) {
        showToast(isEn ? "Please enter your destination phone number" : "Masukkan nomor handphone tujuan transfer", false);
        return;
      }
      targetPhone = phoneInput ? phoneInput.value.trim() : "";
    }

    // 1. KURANGI SALDO POIN
    AppState.user.points -= reward.pointsCost;

    // 2. SIMPAN VOUCHER / BUKTI TRANSFER
    const code = isEwallet 
      ? `WD-${reward.partner.replace(/\s+/g,'').toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}` 
      : `RILO-${reward.id}-${Math.floor(1000 + Math.random() * 9000)}`;

    AppState.redemptions.unshift({
      id: `RDM-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      partner: reward.partner,
      rewardTitle: reward.title,
      rewardTitleEn: reward.titleEn,
      pointsSpent: reward.pointsCost,
      code: code,
      expiry: isEwallet ? "Selesai" : "30 Nov 2026",
      status: isEwallet ? "Berhasil Ditransfer" : "Tersedia",
      statusEn: isEwallet ? "Transfer Successful" : "Available",
      isEwallet: isEwallet,
      amountRupiah: reward.amountRupiah || 0,
      targetPhone: targetPhone
    });

    // 3. UPDATE TAMPILAN
    updateVoucherCounterUI();
    renderAllViews();

    // 4. BUKTI KUPON / NOTIFIKASI TRANSFER SUKSES
    if (isEwallet) {
      content.innerHTML = `
        <div style="text-align:center;padding:6px 0;">
          <div style="width:48px;height:48px;border-radius:50%;background:var(--eco-emerald-soft);color:var(--eco-emerald);display:grid;place-items:center;margin:0 auto 10px;">
            ${ICONS.check}
          </div>
          <h3 style="font-size:16px;color:var(--rilo-wine);margin-bottom:4px;">
            ${isEn ? 'Transfer Successful!' : 'Saldo Berhasil Ditransfer!'}
          </h3>
          <p style="font-size:12px;color:var(--text-sub);margin-bottom:14px;">
            ${isEn 
              ? `IDR ${fmt(reward.amountRupiah)} has been sent to ${reward.partner} (${targetPhone}).` 
              : `Rp ${fmt(reward.amountRupiah)} berhasil dikirimkan ke akun ${reward.partner} (${targetPhone}).`}
          </p>

          <div style="background:#f8fafc;border-radius:12px;padding:12px 14px;border:1.5px dashed #cbd5e1;margin-bottom:16px;text-align:left;">
            <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;">
              <span style="color:var(--text-muted);">${isEn ? 'Transaction ID' : 'ID Transaksi'}:</span>
              <strong>${code}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;">
              <span style="color:var(--text-muted);">${isEn ? 'Points Deducted' : 'Poin Terpotong'}:</span>
              <strong style="color:var(--rilo-wine);">${fmt(reward.pointsCost)} pts</strong>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px;">
              <span style="color:var(--text-muted);">${isEn ? 'Status' : 'Status'}:</span>
              <span class="bsc-status-pill" style="height:20px;font-size:10px;">${isEn ? 'Completed' : 'Berhasil'}</span>
            </div>
          </div>

          <button class="btn-solid-wine" onclick="closeModalSheet(); switchView('my-vouchers');">
            ${isEn ? 'View Transaction in My Vouchers' : 'Lihat di Voucher & Dompet Saya'}
          </button>
        </div>
      `;
    } else {
      content.innerHTML = `
        <div style="text-align:center;padding:6px 0;">
          <div style="width:46px;height:46px;border-radius:50%;background:var(--eco-emerald-soft);color:var(--eco-emerald);display:grid;place-items:center;margin:0 auto 10px;">
            ${ICONS.check}
          </div>
          <h3 style="font-size:16px;color:var(--rilo-wine);margin-bottom:4px;">${isEn ? 'Voucher Redeemed!' : 'Voucher Berhasil Ditukar!'}</h3>
          <p style="font-size:12px;color:var(--text-sub);margin-bottom:14px;">${isEn ? `Points deducted: ${fmt(reward.pointsCost)} pts` : `Saldo poin terpotong ${fmt(reward.pointsCost)} pts`}</p>

          <div style="background:#f8fafc;border-radius:12px;padding:14px;border:1.5px dashed #cbd5e1;margin-bottom:16px;">
            <span style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700;display:block;">${isEn ? 'VOUCHER CODE' : 'KODE KUPON'}</span>
            <strong style="font-size:18px;letter-spacing:2px;color:var(--text-main);display:block;margin:3px 0;">${code}</strong>
            <small style="font-size:10px;color:var(--text-sub);">${isEn ? 'Valid until Nov 30, 2026' : 'Masa berlaku s/d 30 November 2026'}</small>
          </div>

          <button class="btn-solid-wine" onclick="closeModalSheet(); switchView('my-vouchers');">
            ${t("btnMyVouchers")}
          </button>
        </div>
      `;
    }

    showToast(isEn ? (isEwallet ? "e-Wallet payout sent!" : "Voucher successfully claimed!") : (isEwallet ? "Saldo e-Wallet berhasil ditarik!" : "Voucher berhasil diperoleh!"), true);
  };
};

// 4. Tab Voucher Saya
function renderMyVouchers() {
  const container = document.getElementById("myVouchersListContainer");
  if (!container) return;
  const isEn = AppState.currentLang === "en";

  updateVoucherCounterUI();

  if (AppState.redemptions.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px;background:#fff;border-radius:14px;border:1px solid var(--border-line);">
        <p style="font-size:12px;color:var(--text-sub);">${isEn ? 'No vouchers redeemed yet.' : 'Belum ada voucher yang ditukarkan.'}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = AppState.redemptions.map((v) => {
    const titleText = isEn ? (v.rewardTitleEn || v.rewardTitle) : v.rewardTitle;
    const statusText = isEn ? (v.statusEn || "Available") : (v.status || "Tersedia");

    return `
      <div style="background:#fff;border-radius:14px;border:1px solid var(--border-line);padding:14px;margin-bottom:10px;box-shadow:var(--shadow-sm);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
          <span style="font-size:11px;color:var(--text-muted);font-weight:700;">${v.partner}</span>
          <span class="badge-tag-status">${statusText}</span>
        </div>
        <strong style="font-size:13px;display:block;margin-bottom:8px;">${titleText}</strong>
        <div style="background:var(--rilo-wine-soft);border-radius:8px;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <span style="font-size:14px;letter-spacing:1.5px;font-weight:800;color:var(--rilo-wine);">${v.code}</span>
          <small style="font-size:10px;color:var(--text-sub);">${isEn ? 'Exp:' : 'Berlaku s/d:'} ${v.expiry}</small>
        </div>
        <button class="btn-solid-wine" style="padding:7px;font-size:11px;background:var(--surface-subtle);color:var(--rilo-wine);border:1px solid var(--rilo-wine-border);box-shadow:none;" onclick="useVoucherItem('${v.id}')">
          ${isEn ? 'Use Voucher Now' : 'Gunakan Voucher Sekarang'}
        </button>
      </div>
    `;
  }).join("");
}

window.useVoucherItem = function(voucherId) {
  const v = AppState.redemptions.find(x => x.id === voucherId);
  if (!v) return;
  const isEn = AppState.currentLang === "en";

  if (confirm(isEn ? `Use voucher "${v.rewardTitle}" now?` : `Gunakan voucher "${v.rewardTitle}" sekarang?`)) {
    AppState.redemptions = AppState.redemptions.filter(x => x.id !== voucherId);
    updateVoucherCounterUI();
    renderAllViews();
    renderMyVouchers();
    showToast(isEn ? "Voucher successfully used!" : "Voucher berhasil digunakan!", true);
  }
};

// 5. Bukti Struk Transaksi
window.openTxReceiptModal = function (txId) {
  const tx = AppState.deposits.find((t) => t.id === txId);
  if (!tx) return;
  const isEn = AppState.currentLang === "en";

  const content = document.getElementById("modalSheetDynamicBox");
  content.innerHTML = `
    <div style="text-align:center;margin-bottom:14px;">
      <div style="width:46px;height:46px;border-radius:12px;background:var(--rilo-wine-soft);color:var(--rilo-wine);display:grid;place-items:center;margin:0 auto 8px;">
        ${ICONS.history}
      </div>
      <h3 style="font-size:16px;">${isEn ? 'Deposit Receipt' : 'Struk Setoran RILO'}</h3>
      <span style="font-size:11px;color:var(--text-sub);">${tx.id}</span>
    </div>

    <div style="background:var(--surface-subtle);border-radius:12px;padding:12px;margin-bottom:14px;">
      <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;border-bottom:1px solid var(--border-line);">
        <span style="color:var(--text-sub);">${isEn ? 'Date' : 'Tanggal'}</span>
        <strong>${formatDate(tx.date)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;border-bottom:1px solid var(--border-line);">
        <span style="color:var(--text-sub);">${isEn ? 'Drop Box Station' : 'Titik Setor'}</span>
        <strong>${tx.qrBox}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;border-bottom:1px solid var(--border-line);">
        <span style="color:var(--text-sub);">${isEn ? 'Mode' : 'Kategori'}</span>
        <strong>${isEn ? tx.modeEn : tx.mode}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;border-bottom:1px solid var(--border-line);">
        <span style="color:var(--text-sub);">${isEn ? 'Summary' : 'Rincian'}</span>
        <strong style="text-align:right;max-width:180px;">${tx.summary}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;">
        <span style="color:var(--text-sub);">${isEn ? 'Points Earned' : 'Poin Didapat'}</span>
        <strong style="color:var(--rilo-wine);font-size:13px;">+${fmt(tx.pointsEarned)} pts</strong>
      </div>
    </div>

    <button class="btn-solid-wine" onclick="closeModalSheet()">${isEn ? 'Close' : 'Tutup'}</button>
  `;

  openModalSheet();
};

// 6. Dampak Lingkungan
function renderImpact() {
  const user = AppState.user;
  document.getElementById("impactWeightTotal").textContent = `${fmt(user.totalWeight)} kg`;
  document.getElementById("impactDepositsFreq").textContent = `${user.completedDeposits}x`;
  document.getElementById("impactCo2Total").textContent = `${(user.totalWeight * 1.5).toFixed(1)} kg`;
}

// 7. Panduan Edukasi
function renderGuides() {
  const container = document.getElementById("guidesArticlesList");
  if (!container) return;
  const isEn = AppState.currentLang === "en";

  container.innerHTML = AppState.guides.map((g) => {
    const titleText = isEn ? g.titleEn : g.title;
    const tagText = isEn ? g.tagEn : g.tag;
    const timeText = isEn ? g.readTimeEn : g.readTime;

    return `
      <div class="clean-item-card" onclick="openGuideModal('${g.id}')">
        <div class="cic-left">
          <div class="cic-icon-wrap">${ICONS.leafImpact}</div>
          <div class="cic-text">
            <strong>${titleText}</strong>
            <span>${tagText} • ${timeText}</span>
          </div>
        </div>
        <span style="color:var(--text-muted);">${ICONS.chevronRight}</span>
      </div>
    `;
  }).join("");
}

window.openGuideModal = function (guideId) {
  const guide = AppState.guides.find((g) => g.id === guideId);
  if (!guide) return;
  const isEn = AppState.currentLang === "en";

  const content = document.getElementById("modalSheetDynamicBox");
  content.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
      <div style="width:40px;height:40px;border-radius:10px;background:var(--rilo-wine-soft);color:var(--rilo-wine);display:grid;place-items:center;">
        ${ICONS.leafImpact}
      </div>
      <div>
        <h3 style="font-size:15px;">${isEn ? guide.titleEn : guide.title}</h3>
        <span style="font-size:11px;color:var(--rilo-wine);font-weight:700;">${isEn ? guide.tagEn : guide.tag}</span>
      </div>
    </div>
    <div style="font-size:12px;line-height:1.6;color:var(--text-main);background:var(--surface-subtle);border-radius:12px;padding:12px;margin-bottom:14px;">
      ${isEn ? guide.contentEn : guide.content}
    </div>
    <button class="btn-solid-wine" onclick="closeModalSheet()">${isEn ? 'Understood' : 'Paham'}</button>
  `;

  openModalSheet();
};

// 8. Profil
function setupProfileForm() {
  const form = document.getElementById("formUpdateProfileData");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("profileInputName").value.trim();
      const email = document.getElementById("profileInputEmail").value.trim();
      const addr = document.getElementById("profileInputAddress").value.trim();

      if (name) {
        AppState.user.name = name;
        AppState.user.avatar = name[0].toUpperCase();
      }
      if (email) AppState.user.email = email;
      if (addr) AppState.user.address = addr;

      renderAllViews();
      showToast(AppState.currentLang === "en" ? "Profile updated successfully!" : "Profil berhasil disimpan!", true);
    });
  }
}

function renderProfile() {
  const user = AppState.user;
  document.getElementById("profileDisplayNameText").textContent = user.name;
  document.getElementById("profileDisplayEmailText").textContent = user.email;

  const inName = document.getElementById("profileInputName");
  const inEmail = document.getElementById("profileInputEmail");
  const inAddr = document.getElementById("profileInputAddress");

  if (inName) inName.value = user.name;
  if (inEmail) inEmail.value = user.email;
  if (inAddr) inAddr.value = user.address;
}

// === MODAL SHEET ENGINE ===
function openModalSheet() {
  document.getElementById("modalOverlay").classList.add("open");
  document.getElementById("modalSheetBox").classList.add("open");
}

window.closeModalSheet = function () {
  document.getElementById("modalOverlay").classList.remove("open");
  document.getElementById("modalSheetBox").classList.remove("open");
};

document.getElementById("modalOverlay").addEventListener("click", closeModalSheet);
