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
  renderAllViews();
  setupDepositItems();
  showToast(lang === "en" ? "Language changed to English" : "Bahasa diubah ke Bahasa Indonesia", true);
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

function renderFullMapBoxList() {
  const container = document.getElementById("fullMapListLocations");
  if (!container) return;

  const isEn = AppState.currentLang === "en";

  container.innerHTML = AppState.qrLocations.map((b) => `
    <div class="clean-item-card">
      <div class="cic-left">
        <div class="cic-icon-wrap" style="color:var(--rilo-wine);">${ICONS.pin}</div>
        <div class="cic-text">
          <strong>${b.name}</strong>
          <span>${b.location} • ${b.distance}</span>
        </div>
      </div>
      <span class="badge-tag-status">${isEn ? b.statusEn : b.status}</span>
    </div>
  `).join("");
}

// === FLOW SCAN QR DROP BOX ===
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
      const itemsInCat = AppState.itemsPerPiece.filter((i) => i.category === cat.idKey);
      html += `<div class="group-title-bar">${isEn ? cat.enKey : cat.idKey}</div>`;
      itemsInCat.forEach((item) => {
        const count = currentDepositSession.pieceCounts[item.id] || 0;
        const iconSvg = getMaterialIcon(item.iconType);
        const titleText = isEn ? item.labelEn : item.label;
        const unitText = isEn ? item.unitLabelEn : item.unitLabel;
        html += `
          <div class="piece-stepper-card">
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

  // 2. Kategori Per Kg
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
                   step="0.1" 
                   min="0" 
                   max="200" 
                   placeholder="0.0 kg" 
                   value="${w > 0 ? w : ''}" 
                   oninput="setKgWeight('${item.id}', this.value)" />
            <span style="font-size:12px;font-weight:700;color:var(--text-sub);">kg</span>
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

// === RENDER UTAMA SEMUA VIEW ===
function renderAllViews() {
  applyLanguageTranslations();
  renderHome();
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
  document.getElementById("userLevelPill").textContent = isEn ? user.levelNameEn : user.levelName;
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

// 3. Rewards & Penukaran (Poin Pasti Berkurang)
function renderRewards() {
  const container = document.getElementById("rewardsCardsContainer");
  const balanceEl = document.getElementById("rewardsPointsBalanceDisplay");
  const isEn = AppState.currentLang === "en";

  if (balanceEl) balanceEl.textContent = `${fmt(AppState.user.points)} pts`;

  if (!container) return;

  container.innerHTML = AppState.rewards.map((r) => {
    const canAfford = AppState.user.points >= r.pointsCost;
    const titleText = isEn ? r.titleEn : r.title;
    const descText = isEn ? r.descriptionEn : r.description;
    const btnText = isEn ? "Redeem" : "Tukar";

    return `
      <div class="voucher-coupon-card">
        <div class="vcc-badge-box">${ICONS.gift}</div>
        <div class="vcc-body">
          <span class="vcc-partner">${r.partner}</span>
          <strong>${titleText}</strong>
          <p>${descText}</p>
          <span class="vcc-cost">${fmt(r.pointsCost)} Poin</span>
        </div>
        <button class="btn-redeem-action" 
                onclick="promptVoucherRedeem('${r.id}')"
                style="background: ${canAfford ? 'var(--rilo-wine)' : 'var(--text-muted)'}">
          ${btnText}
        </button>
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

  content.innerHTML = `
    <div style="text-align:center;margin-bottom:16px;">
      <div style="width:50px;height:50px;border-radius:12px;background:var(--rilo-wine-soft);color:var(--rilo-wine);display:grid;place-items:center;margin:0 auto 10px;">
        ${ICONS.gift}
      </div>
      <span style="font-size:11px;font-weight:750;color:var(--text-muted);text-transform:uppercase;">${reward.partner}</span>
      <h3 style="font-size:16px;margin:2px 0 4px;">${titleText}</h3>
      <p style="font-size:12px;color:var(--text-sub);">${descText}</p>
    </div>

    <div style="background:var(--rilo-wine-soft);border:1px dashed var(--rilo-wine-border);border-radius:12px;padding:12px;text-align:center;margin-bottom:16px;">
      <span style="font-size:10px;color:var(--text-sub);text-transform:uppercase;font-weight:700;">${isEn ? 'Points Cost' : 'Biaya Penukaran'}</span>
      <div style="font-size:22px;font-weight:850;color:var(--rilo-wine);margin:2px 0;">${fmt(reward.pointsCost)} Poin</div>
      <small style="font-size:11px;color:var(--text-sub);">${isEn ? 'Remaining balance' : 'Sisa saldo'}: <b>${fmt(AppState.user.points - reward.pointsCost)} pts</b></small>
    </div>

    <div style="display:flex;gap:10px;">
      <button class="btn-solid-wine" style="background:var(--surface-subtle);color:var(--text-main);box-shadow:none;" onclick="closeModalSheet()">${isEn ? 'Cancel' : 'Batal'}</button>
      <button class="btn-solid-wine" id="btnConfirmDeductPointsAction">${isEn ? 'Confirm Redeem' : 'Konfirmasi Tukar'}</button>
    </div>
  `;

  openModalSheet();

  document.getElementById("btnConfirmDeductPointsAction").onclick = () => {
    // 1. KURANGI SALDO POIN
    AppState.user.points -= reward.pointsCost;

    // 2. SIMPAN VOUCHER
    const code = `RILO-${reward.id}-${Math.floor(1000 + Math.random() * 9000)}`;
    AppState.redemptions.unshift({
      id: `RDM-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      partner: reward.partner,
      rewardTitle: reward.title,
      rewardTitleEn: reward.titleEn,
      pointsSpent: reward.pointsCost,
      code: code,
      expiry: "30 Nov 2026",
      status: "Tersedia",
      statusEn: "Available"
    });

    // 3. UPDATE TAMPILAN
    renderAllViews();

    // 4. BUKTI KUPON VOUCHER
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

    showToast(isEn ? "Voucher successfully claimed!" : "Voucher berhasil diperoleh!", true);
  };
};

// 4. Tab Voucher Saya
function renderMyVouchers() {
  const container = document.getElementById("myVouchersListContainer");
  if (!container) return;
  const isEn = AppState.currentLang === "en";

  if (AppState.redemptions.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px;background:#fff;border-radius:14px;border:1px solid var(--border-line);">
        <p style="font-size:12px;color:var(--text-sub);">${isEn ? 'No vouchers redeemed yet.' : 'Belum ada voucher yang ditukarkan.'}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = AppState.redemptions.map((v) => `
    <div style="background:#fff;border-radius:14px;border:1px solid var(--border-line);padding:14px;margin-bottom:10px;box-shadow:var(--shadow-sm);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <span style="font-size:11px;color:var(--text-muted);font-weight:700;">${v.partner}</span>
        <span class="badge-tag-status">${isEn ? v.statusEn : v.status}</span>
      </div>
      <strong style="font-size:13px;display:block;margin-bottom:8px;">${isEn ? v.rewardTitleEn : v.rewardTitle}</strong>
      <div style="background:var(--rilo-wine-soft);border-radius:8px;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:14px;letter-spacing:1.5px;font-weight:800;color:var(--rilo-wine);">${v.code}</span>
        <small style="font-size:10px;color:var(--text-sub);">Exp: ${v.expiry}</small>
      </div>
    </div>
  `).join("");
}

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
