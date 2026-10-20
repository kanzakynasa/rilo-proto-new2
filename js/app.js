/**
 * RILO Mobile App - Interactive Engine
 * Terintegrasi dengan Leaflet Map Drop Point dan Clean SVG Icons (RuntahPedia Style)
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
  setupNavigation();
  setupQrScanner();
  setupDepositModeSwitcher();
  setupDepositItems();
  setupProfileForm();
  renderAllViews();
  setTimeout(initHomeMap, 300);
}

// Format Angka Ribuan
const fmt = (n) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(n);

// Format Tanggal
function formatDate(dStr) {
  try {
    return new Date(dStr + "T12:00:00").toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } catch (e) {
    return dStr;
  }
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

  // Scroll to top
  const scrollArea = document.getElementById("mainScrollView");
  if (scrollArea) scrollArea.scrollTo({ top: 0, behavior: "smooth" });

  if (viewName === "home") {
    setTimeout(() => { if (homeMapInstance) homeMapInstance.invalidateSize(); }, 200);
  }
  if (viewName === "map-full") {
    setTimeout(initFullMap, 200);
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
      if (confirm("Kembalikan data demo ke nilai awal? Semua saldo poin dan transaksi sesi ini akan direset.")) {
        resetAppState();
        renderAllViews();
        showToast("Data demo dikembalikan ke awal.", true);
        switchView("home");
      }
    });
  }
}

// === LEAFLET MAP INTEGRATION (DROP POINT FINDER) ===
function initHomeMap() {
  const mapEl = document.getElementById("homeDropMap");
  if (!mapEl || homeMapInstance) return;

  if (typeof L === "undefined") {
    // Fallback jika tanpa internet
    mapEl.innerHTML = `
      <div style="height:100%;display:flex;align-items:center;justify-content:center;background:#f1f5f9;color:#64748b;font-size:12px;gap:8px;">
        ${ICONS.mapLocation} <span>Peta Drop Point: Depok & Kampus UI</span>
      </div>
    `;
    return;
  }

  // Koordinat Margonda Depok & Kampus
  homeMapInstance = L.map("homeDropMap", {
    center: [-6.3638, 106.8295],
    zoom: 14,
    zoomControl: false,
    attributionControl: false
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18
  }).addTo(homeMapInstance);

  // Tambahkan markers titik Drop Box
  AppState.qrLocations.forEach((box) => {
    const customIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: `<div class="rilo-map-marker" title="${box.name}">R</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker([box.lat, box.lng], { icon: customIcon }).addTo(homeMapInstance);
    marker.bindPopup(`
      <div style="font-family:inherit;font-size:12px;padding:2px;">
        <strong style="color:var(--rilo-wine);">${box.name}</strong><br>
        <span style="color:#64748b;">${box.location} • ${box.distance}</span><br>
        <button style="margin-top:6px;background:var(--rilo-wine);color:#fff;border:none;padding:4px 8px;border-radius:4px;font-size:10px;font-weight:700;cursor:pointer;" onclick="selectBoxAndStartDeposit('${box.id}')">Scan di Sini</button>
      </div>
    `);
  });
}

function initFullMap() {
  const fullEl = document.getElementById("fullDropMapContainer");
  if (!fullEl || fullMapInstance) return;

  if (typeof L === "undefined") return;

  fullMapInstance = L.map("fullDropMapContainer", {
    center: [-6.3638, 106.8295],
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
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker([box.lat, box.lng], { icon: customIcon }).addTo(fullMapInstance);
    marker.bindPopup(`
      <div style="font-family:inherit;font-size:12px;padding:2px;">
        <strong style="color:var(--rilo-wine);">${box.name}</strong><br>
        <span style="color:#64748b;">${box.location}</span><br>
        <small style="color:#15803d;font-weight:700;">${box.slotsAvailable}</small><br>
        <button style="margin-top:6px;background:var(--rilo-wine);color:#fff;border:none;padding:5px 10px;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer;" onclick="selectBoxAndStartDeposit('${box.id}')">Scan & Buka Drop Box</button>
      </div>
    `);
  });

  renderFullMapBoxList();
}

function renderFullMapBoxList() {
  const container = document.getElementById("fullMapListLocations");
  if (!container) return;

  container.innerHTML = AppState.qrLocations.map((b) => `
    <div class="clean-item-card" onclick="selectBoxAndStartDeposit('${b.id}')">
      <div class="cic-left">
        <div class="cic-icon-wrap" style="color:var(--rilo-wine);">${ICONS.pin}</div>
        <div class="cic-text">
          <strong>${b.name}</strong>
          <span>${b.distance} • ${b.slotsAvailable}</span>
        </div>
      </div>
      <button class="btn-scan-map-chip">Setor</button>
    </div>
  `).join("");
}

window.selectBoxAndStartDeposit = function (boxId) {
  const box = AppState.qrLocations.find((b) => b.id === boxId);
  if (box) {
    currentDepositSession.selectedBox = box;
    openQrScanFlow();
  }
};

// === FLOW 1: SCAN QR DROP BOX ===
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

  container.innerHTML = `
    <div class="dhp-head">
      <strong>${box.name}</strong>
      <span style="font-size:11px;font-weight:700;color:var(--eco-emerald);">● ${box.status}</span>
    </div>
    <div class="dhp-desc">
      ${box.location} • ${box.distance}<br>
      <span style="color:var(--rilo-wine);font-weight:700;">${box.slotsAvailable}</span> • Jam Buka: ${box.operatingHours}
    </div>
    <div style="margin-bottom:12px;">
      <select id="selectQrBoxDropdown" class="input-kg-val" style="font-size:12px;padding:6px 10px;" onchange="changeQrBoxTarget(this.value)">
        ${AppState.qrLocations.map((b) => `<option value="${b.id}" ${b.id === box.id ? 'selected' : ''}>Pilih Titik: ${b.name} (${b.distance})</option>`).join("")}
      </select>
    </div>
    <button class="btn-solid-wine" id="btnConfirmQrScanAction">
      <span>${ICONS.scanQr}</span> Hubungkan Drop Box & Buka Pintu
    </button>
  `;

  document.getElementById("btnConfirmQrScanAction").onclick = () => {
    showToast(`Terhubung ke ${box.name}!`, true);
    document.getElementById("activeHubTitle").textContent = box.name;
    document.getElementById("activeHubSubtitle").textContent = `${box.location} • Kapasitas Tersedia`;

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

// === FLOW 2: INPUT SETORAN SAMPAH ===
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
  // 1. Kategori Per Piece (Satuan per Ukuran ml / pcs)
  const pieceContainer = document.getElementById("panelPieceItems");
  if (pieceContainer) {
    const categories = [
      "Botol Plastik PET",
      "Kaleng Minuman",
      "Tutup Botol",
      "Botol Kaca",
      "Kemasan Karton Minuman"
    ];

    let html = "";
    categories.forEach((cat) => {
      const itemsInCat = AppState.itemsPerPiece.filter((i) => i.category === cat);
      html += `<div class="group-title-bar">${cat}</div>`;
      itemsInCat.forEach((item) => {
        const count = currentDepositSession.pieceCounts[item.id] || 0;
        const iconSvg = getMaterialIcon(item.iconType);
        html += `
          <div class="piece-stepper-card">
            <div class="psc-left">
              <div class="psc-icon">${iconSvg}</div>
              <div class="psc-info">
                <strong>${item.label}</strong>
                <span>+${item.pointsPerUnit} poin / ${item.unitLabel}</span>
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

  // 2. Kategori Per Kg (Kiloan)
  const kgContainer = document.getElementById("panelKgItems");
  if (kgContainer) {
    kgContainer.innerHTML = AppState.itemsPerKg.map((item) => {
      const w = currentDepositSession.kgWeights[item.id] || 0;
      const iconSvg = getMaterialIcon(item.iconType);
      return `
        <div class="kg-material-card">
          <div class="kmc-head">
            <strong>${iconSvg} ${item.label}</strong>
            <span class="kmc-rate">${item.rate} poin / kg</span>
          </div>
          <div class="kmc-desc">${item.desc}</div>
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
      estSubEl.textContent = `${totalCount} item terpilih`;
    } else {
      estSubEl.textContent = `${fmt(totalWeight)} kg tercatat`;
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

  if (currentDepositSession.activeMode === "piece") {
    const summaryItems = [];
    AppState.itemsPerPiece.forEach((item) => {
      const qty = currentDepositSession.pieceCounts[item.id] || 0;
      if (qty > 0) {
        totalPoints += qty * item.pointsPerUnit;
        summaryItems.push(`${qty}x ${item.label}`);
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
        summaryItems.push(`${fmt(w)} kg ${item.label.split(" ")[0]}`);
      }
    });
    summaryText = summaryItems.join(", ");
  }

  if (totalPoints <= 0) {
    showToast("Pilih minimal 1 jenis sampah untuk disetor.", false);
    return;
  }

  const newTx = {
    id: `DEP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`,
    date: new Date().toISOString().slice(0, 10),
    time: "Baru saja",
    qrBox: box.name,
    mode: currentDepositSession.activeMode === "piece" ? "Satuan (Per Piece)" : "Kiloan (Per Kg)",
    summary: summaryText,
    weightApprox: parseFloat(totalWeight.toFixed(1)) || 0.5,
    pointsEarned: totalPoints,
    status: "Selesai"
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
  showToast(`Setoran berhasil! +${fmt(totalPoints)} poin diperoleh.`, true);

  setTimeout(() => {
    switchView("transactions");
  }, 400);
}

// === RENDER UTAMA SEMUA VIEW ===
function renderAllViews() {
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

  document.getElementById("locationTagText").textContent = user.locationTag || "Margonda, Depok";
  document.getElementById("homeGreetingName").textContent = `Halo, ${user.name.split(" ")[0]}!`;
  document.getElementById("userLevelPill").textContent = user.levelName;
  document.getElementById("homeAvatarText").textContent = user.avatar || user.name[0];

  document.getElementById("walletPointsBigVal").textContent = fmt(user.points);
  const rupiahVal = Math.round(user.points * 10);
  document.getElementById("walletConversionRupiah").textContent = `≈ Rp ${fmt(rupiahVal)}`;

  // Nearest Drop Box Card di bawah map
  const nearestBox = AppState.qrLocations[0];
  document.getElementById("nearestDropBoxName").textContent = nearestBox.name;
  document.getElementById("nearestDropBoxSub").textContent = `${nearestBox.location} • ${nearestBox.distance}`;

  // 3 Aktivitas Terakhir
  const recentList = document.getElementById("homeRecentActivityContainer");
  if (recentList) {
    const list = AppState.deposits.slice(0, 3);
    if (list.length === 0) {
      recentList.innerHTML = `<div style="text-align:center;padding:16px;font-size:12px;color:var(--text-sub);">Belum ada riwayat setoran.</div>`;
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
            <span class="badge-tag-status">Selesai</span>
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

  if (AppState.deposits.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px;background:#fff;border-radius:16px;border:1px solid var(--border-line);">
        <p style="font-size:12px;color:var(--text-sub);">Belum ada catatan setoran sampah.</p>
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
        <span class="badge-tag-status">Selesai</span>
      </div>
    </div>
  `).join("");
}

// 3. Rewards & Penukaran (Poin Berkurang Pasti)
function renderRewards() {
  const container = document.getElementById("rewardsCardsContainer");
  const balanceEl = document.getElementById("rewardsPointsBalanceDisplay");

  if (balanceEl) balanceEl.textContent = `${fmt(AppState.user.points)} pts`;

  if (!container) return;

  container.innerHTML = AppState.rewards.map((r) => {
    const canAfford = AppState.user.points >= r.pointsCost;
    return `
      <div class="voucher-coupon-card">
        <div class="vcc-badge-box">${ICONS.gift}</div>
        <div class="vcc-body">
          <span class="vcc-partner">${r.partner}</span>
          <strong>${r.title}</strong>
          <p>${r.description}</p>
          <span class="vcc-cost">${fmt(r.pointsCost)} Poin</span>
        </div>
        <button class="btn-redeem-action" 
                onclick="promptVoucherRedeem('${r.id}')"
                style="background: ${canAfford ? 'var(--rilo-wine)' : 'var(--text-muted)'}">
          Tukar
        </button>
      </div>
    `;
  }).join("");
}

window.promptVoucherRedeem = function (rewardId) {
  const reward = AppState.rewards.find((r) => r.id === rewardId);
  if (!reward) return;

  if (AppState.user.points < reward.pointsCost) {
    showToast(`Poin belum mencukupi. Butuh ${fmt(reward.pointsCost - AppState.user.points)} poin lagi.`, false);
    return;
  }

  const content = document.getElementById("modalSheetDynamicBox");

  content.innerHTML = `
    <div style="text-align:center;margin-bottom:16px;">
      <div style="width:54px;height:54px;border-radius:16px;background:var(--rilo-wine-soft);color:var(--rilo-wine);display:grid;place-items:center;margin:0 auto 10px;">
        ${ICONS.gift}
      </div>
      <span style="font-size:11px;font-weight:750;color:var(--text-muted);text-transform:uppercase;">${reward.partner}</span>
      <h3 style="font-size:16px;margin:2px 0 4px;">${reward.title}</h3>
      <p style="font-size:12px;color:var(--text-sub);">${reward.description}</p>
    </div>

    <div style="background:var(--rilo-wine-soft);border:1px dashed var(--rilo-wine-border);border-radius:14px;padding:14px;text-align:center;margin-bottom:18px;">
      <span style="font-size:11px;color:var(--text-sub);text-transform:uppercase;font-weight:700;">Biaya Penukaran</span>
      <div style="font-size:24px;font-weight:850;color:var(--rilo-wine);margin:4px 0;">${fmt(reward.pointsCost)} Poin</div>
      <small style="font-size:11px;color:var(--text-sub);">Sisa saldo setelah ditukar: <b>${fmt(AppState.user.points - reward.pointsCost)} pts</b></small>
    </div>

    <div style="display:flex;gap:10px;">
      <button class="btn-solid-wine" style="background:var(--surface-subtle);color:var(--text-main);box-shadow:none;" onclick="closeModalSheet()">Batal</button>
      <button class="btn-solid-wine" id="btnConfirmDeductPointsAction">Konfirmasi Tukar</button>
    </div>
  `;

  openModalSheet();

  document.getElementById("btnConfirmDeductPointsAction").onclick = () => {
    // 1. KURANGI SALDO POIN
    AppState.user.points -= reward.pointsCost;

    // 2. TERBITKAN VOUCHER KE VOUCHER SAYA
    const code = `RILO-${reward.id}-${Math.floor(1000 + Math.random() * 9000)}`;
    AppState.redemptions.unshift({
      id: `RDM-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      partner: reward.partner,
      rewardTitle: reward.title,
      pointsSpent: reward.pointsCost,
      code: code,
      expiry: "30 Nov 2026",
      status: "Tersedia"
    });

    // 3. UPDATE TAMPILAN SALDO SECARA MENYELURUH
    renderAllViews();

    // 4. TAMPILKAN HASIL DENGAN BARCODE KUPON
    content.innerHTML = `
      <div style="text-align:center;padding:6px 0;">
        <div style="width:48px;height:48px;border-radius:50%;background:var(--eco-emerald-soft);color:var(--eco-emerald);display:grid;place-items:center;margin:0 auto 10px;">
          ${ICONS.check}
        </div>
        <h3 style="font-size:16px;color:var(--rilo-wine);margin-bottom:4px;">Voucher Berhasil Ditukar!</h3>
        <p style="font-size:12px;color:var(--text-sub);margin-bottom:14px;">Saldo poin telah terpotong <b>${fmt(reward.pointsCost)} pts</b>.</p>

        <div style="background:#f8fafc;border-radius:14px;padding:16px;border:1.5px dashed #cbd5e1;margin-bottom:18px;">
          <span style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700;display:block;">Kode Kupon</span>
          <strong style="font-size:20px;letter-spacing:2px;color:var(--text-main);display:block;margin:4px 0;">${code}</strong>
          <small style="font-size:11px;color:var(--text-sub);">Masa berlaku s/d 30 November 2026</small>
        </div>

        <button class="btn-solid-wine" onclick="closeModalSheet(); switchView('my-vouchers');">
          Buka Voucher Saya
        </button>
      </div>
    `;

    showToast("Voucher berhasil diperoleh!", true);
  };
};

// 4. Tab Voucher Saya
function renderMyVouchers() {
  const container = document.getElementById("myVouchersListContainer");
  if (!container) return;

  if (AppState.redemptions.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px;background:#fff;border-radius:16px;border:1px solid var(--border-line);">
        <p style="font-size:12px;color:var(--text-sub);">Belum ada voucher yang ditukarkan.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = AppState.redemptions.map((v) => `
    <div style="background:#fff;border-radius:16px;border:1px solid var(--border-line);padding:14px;margin-bottom:10px;box-shadow:var(--shadow-sm);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:11px;color:var(--text-muted);font-weight:700;">${v.partner || 'Mitra RILO'}</span>
        <span class="badge-tag-status">${v.status}</span>
      </div>
      <strong style="font-size:13px;display:block;margin-bottom:8px;">${v.rewardTitle}</strong>
      <div style="background:var(--rilo-wine-soft);border-radius:10px;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;">
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

  const content = document.getElementById("modalSheetDynamicBox");
  content.innerHTML = `
    <div style="text-align:center;margin-bottom:14px;">
      <div style="width:48px;height:48px;border-radius:14px;background:var(--rilo-wine-soft);color:var(--rilo-wine);display:grid;place-items:center;margin:0 auto 8px;">
        ${ICONS.history}
      </div>
      <h3 style="font-size:16px;">Struk Setoran RILO</h3>
      <span style="font-size:11px;color:var(--text-sub);">${tx.id}</span>
    </div>

    <div style="background:var(--surface-subtle);border-radius:14px;padding:14px;margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;border-bottom:1px solid var(--border-line);">
        <span style="color:var(--text-sub);">Tanggal</span>
        <strong>${formatDate(tx.date)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;border-bottom:1px solid var(--border-line);">
        <span style="color:var(--text-sub);">Titik Setor</span>
        <strong>${tx.qrBox}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;border-bottom:1px solid var(--border-line);">
        <span style="color:var(--text-sub);">Kategori</span>
        <strong>${tx.mode}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;border-bottom:1px solid var(--border-line);">
        <span style="color:var(--text-sub);">Rincian</span>
        <strong style="text-align:right;max-width:180px;">${tx.summary}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;">
        <span style="color:var(--text-sub);">Poin Didapat</span>
        <strong style="color:var(--rilo-wine);font-size:14px;">+${fmt(tx.pointsEarned)} pts</strong>
      </div>
    </div>

    <button class="btn-solid-wine" onclick="closeModalSheet()">Tutup</button>
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

  container.innerHTML = AppState.guides.map((g) => `
    <div class="clean-item-card" onclick="openGuideModal('${g.id}')">
      <div class="cic-left">
        <div class="cic-icon-wrap">${ICONS.leafImpact}</div>
        <div class="cic-text">
          <strong>${g.title}</strong>
          <span>${g.tag} • ${g.readTime}</span>
        </div>
      </div>
      <span style="color:var(--text-muted);">${ICONS.chevronRight}</span>
    </div>
  `).join("");
}

window.openGuideModal = function (guideId) {
  const guide = AppState.guides.find((g) => g.id === guideId);
  if (!guide) return;

  const content = document.getElementById("modalSheetDynamicBox");
  content.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
      <div style="width:44px;height:44px;border-radius:12px;background:var(--rilo-wine-soft);color:var(--rilo-wine);display:grid;place-items:center;">
        ${ICONS.leafImpact}
      </div>
      <div>
        <h3 style="font-size:15px;">${guide.title}</h3>
        <span style="font-size:11px;color:var(--rilo-wine);font-weight:700;">${guide.tag}</span>
      </div>
    </div>
    <div style="font-size:13px;line-height:1.6;color:var(--text-main);background:var(--surface-subtle);border-radius:14px;padding:14px;margin-bottom:16px;">
      ${guide.content}
    </div>
    <button class="btn-solid-wine" onclick="closeModalSheet()">Paham</button>
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
      showToast("Profil berhasil disimpan!", true);
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
