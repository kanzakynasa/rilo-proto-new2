/**
 * RILO Mobile App - Interactive Controller
 * Mengadaptasi alur UX RuntahPedia dengan palet warna signature RILO
 */

// Sesi aktif setoran saat ini
let currentDepositSession = {
  selectedBox: null,
  activeMode: "piece", // 'piece' atau 'kg'
  pieceCounts: {},     // { p_pet_600: 2, ... }
  kgWeights: {}        // { kg_plastic: 1.5, ... }
};

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
function showToast(message, icon = "✓") {
  const toast = document.getElementById("mobileToastNotice");
  if (!toast) return;

  document.getElementById("toastNoticeIcon").textContent = icon;
  document.getElementById("toastNoticeMsg").textContent = message;

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
  document.querySelectorAll(".navbar-item").forEach((btn) => {
    if (btn.dataset.nav === viewName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Scroll to top
  const scrollArea = document.getElementById("mainScrollView");
  if (scrollArea) scrollArea.scrollTo({ top: 0, behavior: "smooth" });

  if (viewName === "transactions") renderTransactions();
  if (viewName === "rewards") renderRewards();
  if (viewName === "impact") renderImpact();
  if (viewName === "my-vouchers") renderMyVouchers();
}

function setupNavigation() {
  // Bottom navbar
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

  // Universal button navigators (data-go)
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

  // Tombol Reset Demo
  const btnReset = document.getElementById("btnResetDemo");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (confirm("Kembalikan data demo ke nilai awal? Semua saldo poin dan transaksi sesi ini akan direset.")) {
        resetAppState();
        renderAllViews();
        showToast("Data demo dikembalikan ke awal.", "↺");
        switchView("home");
      }
    });
  }
}

// === FLOW 1: SCAN QR DROP BOX TERLEBIH DAHULU ===
function openQrScanFlow() {
  if (!currentDepositSession.selectedBox) {
    currentDepositSession.selectedBox = AppState.qrLocations[0];
  }
  renderQrDetectedBox();
  switchView("scan-qr");
}

function renderQrDetectedBox() {
  const container = document.getElementById("qrDetectedBoxInfo");
  if (!container) return;

  const box = currentDepositSession.selectedBox || AppState.qrLocations[0];

  container.innerHTML = `
    <div class="detected-box-title">
      <strong>📍 ${box.name}</strong>
      <span style="font-size:11px;font-weight:700;color:var(--eco-green);">● ${box.status}</span>
    </div>
    <div class="detected-box-desc">
      ${box.location} • ${box.distance}<br>
      <span style="color:var(--wine-primary);font-weight:700;">${box.slotsAvailable}</span>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:12px;">
      <select id="selectOtherQrBox" class="kg-text-input" style="font-size:12px;padding:6px 10px;" onchange="changeSelectedQrBox(this.value)">
        ${AppState.qrLocations.map((b) => `<option value="${b.id}" ${b.id === box.id ? 'selected' : ''}>Pilih: ${b.name}</option>`).join("")}
      </select>
    </div>
    <button class="btn-primary-action" id="btnConfirmQrScan">
      <span>📷</span> Hubungkan Drop Box & Buka Pintu
    </button>
  `;

  document.getElementById("btnConfirmQrScan").onclick = () => {
    showToast(`Terhubung ke ${box.name}!`, "🟢");
    document.getElementById("activeHubNameDisplay").textContent = box.name;
    document.getElementById("activeHubLocationDisplay").textContent = box.location;

    setTimeout(() => {
      switchView("deposit-input");
    }, 350);
  };
}

window.changeSelectedQrBox = function (boxId) {
  const box = AppState.qrLocations.find((b) => b.id === boxId);
  if (box) {
    currentDepositSession.selectedBox = box;
    renderQrDetectedBox();
  }
};

function setupQrScanner() {
  // Listener telah terpasang di renderQrDetectedBox
}

// === FLOW 2: INPUT SETORAN SAMPAH (PER PIECE & PER KG) ===
function setupDepositModeSwitcher() {
  const tabPiece = document.getElementById("tabModePiece");
  const tabKg = document.getElementById("tabModeKg");
  const panelPiece = document.getElementById("panelModePiece");
  const panelKg = document.getElementById("panelModeKg");

  if (tabPiece && tabKg) {
    tabPiece.addEventListener("click", () => {
      tabPiece.classList.add("active");
      tabKg.classList.remove("active");
      panelPiece.style.display = "block";
      panelKg.style.display = "none";
      currentDepositSession.activeMode = "piece";
      calculateDepositTotal();
    });

    tabKg.addEventListener("click", () => {
      tabKg.classList.add("active");
      tabPiece.classList.remove("active");
      panelPiece.style.display = "none";
      panelKg.style.display = "block";
      currentDepositSession.activeMode = "kg";
      calculateDepositTotal();
    });
  }
}

function setupDepositItems() {
  // 1. Render Kategori Per Piece (Satuan per Ukuran ml / pcs)
  const pieceContainer = document.getElementById("panelModePiece");
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
      html += `<div class="group-label-title">${cat}</div>`;
      itemsInCat.forEach((item) => {
        const count = currentDepositSession.pieceCounts[item.id] || 0;
        html += `
          <div class="item-counter-card">
            <div class="icc-left">
              <div class="icc-icon">${item.icon}</div>
              <div class="icc-meta">
                <strong>${item.label}</strong>
                <span>+${item.pointsPerUnit} poin / ${item.unitLabel}</span>
              </div>
            </div>
            <div class="stepper-wrap">
              <button class="btn-step" type="button" onclick="stepPiece('${item.id}', -1)">−</button>
              <span class="step-num" id="val_${item.id}">${count}</span>
              <button class="btn-step" type="button" onclick="stepPiece('${item.id}', 1)">+</button>
            </div>
          </div>
        `;
      });
    });

    pieceContainer.innerHTML = html;
  }

  // 2. Render Kategori Per Kg (Kiloan)
  const kgContainer = document.getElementById("panelModeKg");
  if (kgContainer) {
    kgContainer.innerHTML = AppState.itemsPerKg.map((item) => {
      const w = currentDepositSession.kgWeights[item.id] || 0;
      return `
        <div class="kg-material-card">
          <div class="kg-card-head">
            <strong>${item.icon} ${item.label}</strong>
            <span class="kg-card-rate">${item.rate} poin / kg</span>
          </div>
          <div class="kg-card-desc">${item.desc}</div>
          <div class="kg-input-box">
            <input type="number" 
                   class="kg-text-input" 
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

  // Tombol Kirim Setoran
  const btnFinal = document.getElementById("btnConfirmDepositFinal");
  if (btnFinal) {
    btnFinal.addEventListener("click", submitFinalDeposit);
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

  const estPtsEl = document.getElementById("checkoutEstPoints");
  const estSubEl = document.getElementById("checkoutEstSummary");
  const btn = document.getElementById("btnConfirmDepositFinal");

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
    showToast("Pilih minimal 1 sampah untuk disetor.", "⚠️");
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

  // Reset counter
  currentDepositSession.pieceCounts = {};
  currentDepositSession.kgWeights = {};
  setupDepositItems();

  renderAllViews();
  showToast(`Setoran berhasil! +${fmt(totalPoints)} poin diperoleh.`, "🎉");

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

  // Lokasi & Header
  document.getElementById("userLocationText").textContent = user.locationTag || "Margonda, Depok";
  document.getElementById("homeUserGreetingName").textContent = `Halo, ${user.name.split(" ")[0]}! 👋`;
  document.getElementById("userLevelBadge").textContent = user.levelName;
  document.getElementById("homeAvatarChar").textContent = user.avatar || user.name[0];

  // Saldo Poin & Estimasi Rupiah
  document.getElementById("walletBalanceNum").textContent = fmt(user.points);
  const rupiahEst = Math.round(user.points * 10);
  document.getElementById("walletRupiahEst").textContent = `≈ Rp ${fmt(rupiahEst)}`;

  // 2 Transaksi Terakhir di Beranda
  const recentList = document.getElementById("homeRecentActivityList");
  if (recentList) {
    const list = AppState.deposits.slice(0, 3);
    if (list.length === 0) {
      recentList.innerHTML = `<div style="text-align:center;padding:16px;font-size:12px;color:var(--text-sub);">Belum ada riwayat setoran.</div>`;
    } else {
      recentList.innerHTML = list.map((tx) => `
        <div class="activity-card-item" onclick="openTxReceiptModal('${tx.id}')">
          <div class="act-left">
            <div class="act-icon">♻️</div>
            <div class="act-details">
              <strong>${tx.summary}</strong>
              <span>${formatDate(tx.date)} • ${tx.qrBox}</span>
            </div>
          </div>
          <div class="act-right">
            <div class="act-points">+${fmt(tx.pointsEarned)} pts</div>
            <span class="badge-status-done">Selesai</span>
          </div>
        </div>
      `).join("");
    }
  }
}

// 2. Riwayat Transaksi
function renderTransactions() {
  const container = document.getElementById("txListFullContainer");
  if (!container) return;

  if (AppState.deposits.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px;background:#fff;border-radius:16px;border:1px solid var(--border-line);">
        <p style="font-size:12px;color:var(--text-sub);">Belum ada riwayat setoran sampah.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = AppState.deposits.map((tx) => `
    <div class="activity-card-item" onclick="openTxReceiptModal('${tx.id}')">
      <div class="act-left">
        <div class="act-icon">🧾</div>
        <div class="act-details">
          <strong>${tx.summary}</strong>
          <span>${formatDate(tx.date)} • ${tx.qrBox}</span>
        </div>
      </div>
      <div class="act-right">
        <div class="act-points">+${fmt(tx.pointsEarned)} pts</div>
        <span class="badge-status-done">Selesai</span>
      </div>
    </div>
  `).join("");
}

// 3. Rewards & Penukaran (Poin Pasti Berkurang)
function renderRewards() {
  const container = document.getElementById("rewardsCatalogContainer");
  const balanceEl = document.getElementById("rewardsBalanceDisplay");

  if (balanceEl) balanceEl.textContent = `${fmt(AppState.user.points)} pts`;

  if (!container) return;

  container.innerHTML = AppState.rewards.map((r) => {
    const canAfford = AppState.user.points >= r.pointsCost;
    return `
      <div class="reward-card-item">
        <div class="rci-icon-box">${r.icon}</div>
        <div class="rci-body">
          <strong>${r.title}</strong>
          <p>${r.description}</p>
          <span class="rci-cost">${fmt(r.pointsCost)} Poin</span>
        </div>
        <button class="btn-redeem-chip" 
                onclick="promptVoucherRedeem('${r.id}')"
                style="background: ${canAfford ? 'var(--wine-primary)' : 'var(--text-muted)'}">
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
    showToast(`Poin belum mencukupi. Butuh ${fmt(reward.pointsCost - AppState.user.points)} poin lagi.`, "⚠️");
    return;
  }

  const content = document.getElementById("modalSheetDynamicContent");

  content.innerHTML = `
    <div style="text-align:center;margin-bottom:16px;">
      <div style="font-size:46px;margin-bottom:8px;">${reward.icon}</div>
      <h3 style="font-size:16px;margin-bottom:4px;">${reward.title}</h3>
      <p style="font-size:12px;color:var(--text-sub);">${reward.description}</p>
    </div>

    <div style="background:var(--wine-soft);border:1px dashed var(--wine-border);border-radius:14px;padding:14px;text-align:center;margin-bottom:16px;">
      <span style="font-size:11px;color:var(--text-sub);text-transform:uppercase;font-weight:700;">Biaya Penukaran</span>
      <div style="font-size:24px;font-weight:850;color:var(--wine-primary);margin:4px 0;">${fmt(reward.pointsCost)} Poin</div>
      <small style="font-size:11px;color:var(--text-sub);">Saldo setelah ditukar: <b>${fmt(AppState.user.points - reward.pointsCost)} pts</b></small>
    </div>

    <div style="display:flex;gap:10px;">
      <button class="btn-primary-action" style="background:var(--surface-alt);color:var(--text-main);" onclick="closeModalSheet()">Batal</button>
      <button class="btn-primary-action" id="btnConfirmDeductPoints">Konfirmasi Tukar</button>
    </div>
  `;

  openModalSheet();

  document.getElementById("btnConfirmDeductPoints").onclick = () => {
    // 1. POTONG SALDO POIN SECARA REALTIME
    AppState.user.points -= reward.pointsCost;

    // 2. SIMPAN KE DAFTAR VOUCHER SAYA
    const code = `RILO-${reward.id}-${Math.floor(1000 + Math.random() * 9000)}`;
    AppState.redemptions.unshift({
      id: `RDM-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      rewardTitle: reward.title,
      pointsSpent: reward.pointsCost,
      code: code,
      expiry: "30 Nov 2026",
      status: "Aktif"
    });

    // 3. RENDER ULANG SEMUA SALDO & VIEW
    renderAllViews();

    // 4. TAMPILKAN HASIL TUKAR VOUCHER
    content.innerHTML = `
      <div style="text-align:center;padding:8px 0;">
        <div style="font-size:44px;margin-bottom:6px;">🎉</div>
        <h3 style="font-size:16px;color:var(--wine-primary);margin-bottom:4px;">Voucher Berhasil Diperoleh!</h3>
        <p style="font-size:12px;color:var(--text-sub);margin-bottom:14px;">Saldo poin telah terpotong <b>${fmt(reward.pointsCost)} pts</b>.</p>

        <div style="background:var(--surface-alt);border-radius:14px;padding:14px;border:1.5px dashed var(--border-line);margin-bottom:18px;">
          <span style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700;display:block;">Kode Voucher Kamu</span>
          <strong style="font-size:20px;letter-spacing:2px;color:var(--text-main);">${code}</strong>
          <small style="display:block;margin-top:4px;font-size:10px;color:var(--text-sub);">Berlaku s/d 30 Nov 2026</small>
        </div>

        <button class="btn-primary-action" onclick="closeModalSheet(); switchView('my-vouchers');">
          Buka Voucher Saya
        </button>
      </div>
    `;

    showToast("Voucher berhasil diperoleh!", "🎁");
  };
};

// 4. Tab Voucher Saya (Tersimpan)
function renderMyVouchers() {
  const container = document.getElementById("myVouchersContainer");
  if (!container) return;

  if (AppState.redemptions.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px;background:#fff;border-radius:16px;border:1px solid var(--border-line);">
        <p style="font-size:12px;color:var(--text-sub);">Kamu belum memiliki voucher yang ditukar.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = AppState.redemptions.map((v) => `
    <div style="background:#fff;border-radius:16px;border:1px solid var(--border-line);padding:14px;margin-bottom:10px;box-shadow:var(--shadow-subtle);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <strong style="font-size:13px;">${v.rewardTitle}</strong>
        <span class="badge-status-done">${v.status}</span>
      </div>
      <div style="background:var(--wine-soft);border-radius:10px;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:14px;letter-spacing:1.5px;font-weight:800;color:var(--wine-primary);">${v.code}</span>
        <small style="font-size:10px;color:var(--text-sub);">S/D ${v.expiry || '30 Nov 2026'}</small>
      </div>
    </div>
  `).join("");
}

// 5. Struk Transaksi (Receipt Modal)
window.openTxReceiptModal = function (txId) {
  const tx = AppState.deposits.find((t) => t.id === txId);
  if (!tx) return;

  const content = document.getElementById("modalSheetDynamicContent");
  content.innerHTML = `
    <div style="text-align:center;margin-bottom:14px;">
      <div style="width:48px;height:48px;border-radius:14px;background:var(--wine-soft);color:var(--wine-primary);display:grid;place-items:center;font-size:22px;margin:0 auto 8px;">
        🧾
      </div>
      <h3 style="font-size:16px;">Bukti Setoran Sampah</h3>
      <span style="font-size:11px;color:var(--text-sub);">${tx.id}</span>
    </div>

    <div style="background:var(--surface-alt);border-radius:14px;padding:14px;margin-bottom:16px;">
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
        <strong style="color:var(--wine-primary);font-size:14px;">+${fmt(tx.pointsEarned)} pts</strong>
      </div>
    </div>

    <button class="btn-primary-action" onclick="closeModalSheet()">Tutup</button>
  `;

  openModalSheet();
};

// 6. Dampak Lingkungan
function renderImpact() {
  const user = AppState.user;
  document.getElementById("impactWeightVal").textContent = `${fmt(user.totalWeight)} kg`;
  document.getElementById("impactDepositsVal").textContent = `${user.completedDeposits}`;
  document.getElementById("impactCo2Val").textContent = `${(user.totalWeight * 1.5).toFixed(1)} kg`;
}

// 7. Panduan Edukasi
function renderGuides() {
  const container = document.getElementById("guidesListContainer");
  if (!container) return;

  container.innerHTML = AppState.guides.map((g) => `
    <div class="activity-card-item" onclick="openGuideModal('${g.id}')">
      <div class="act-left">
        <div class="act-icon">${g.icon}</div>
        <div class="act-details">
          <strong>${g.title}</strong>
          <span>${g.short}</span>
        </div>
      </div>
      <span style="font-size:14px;color:var(--text-muted);">›</span>
    </div>
  `).join("");
}

window.openGuideModal = function (guideId) {
  const guide = AppState.guides.find((g) => g.id === guideId);
  if (!guide) return;

  const content = document.getElementById("modalSheetDynamicContent");
  content.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
      <div style="font-size:32px;width:48px;height:48px;border-radius:12px;background:var(--wine-soft);display:grid;place-items:center;">
        ${guide.icon}
      </div>
      <div>
        <h3 style="font-size:16px;">${guide.title}</h3>
        <span style="font-size:11px;color:var(--wine-primary);font-weight:700;">Panduan Daur Ulang</span>
      </div>
    </div>
    <div style="font-size:13px;line-height:1.6;color:var(--text-main);background:var(--surface-alt);border-radius:14px;padding:14px;margin-bottom:16px;">
      ${guide.content}
    </div>
    <button class="btn-primary-action" onclick="closeModalSheet()">Mengerti</button>
  `;

  openModalSheet();
};

// 8. Profil
function setupProfileForm() {
  const form = document.getElementById("formUpdateProfile");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("editProfName").value.trim();
      const email = document.getElementById("editProfEmail").value.trim();
      const addr = document.getElementById("editProfAddress").value.trim();

      if (name) {
        AppState.user.name = name;
        AppState.user.avatar = name[0].toUpperCase();
      }
      if (email) AppState.user.email = email;
      if (addr) AppState.user.address = addr;

      renderAllViews();
      showToast("Profil berhasil disimpan!", "✓");
    });
  }
}

function renderProfile() {
  const user = AppState.user;
  document.getElementById("profNameDisplay").textContent = user.name;
  document.getElementById("profEmailDisplay").textContent = user.email;

  const inName = document.getElementById("editProfName");
  const inEmail = document.getElementById("editProfEmail");
  const inAddr = document.getElementById("editProfAddress");

  if (inName) inName.value = user.name;
  if (inEmail) inEmail.value = user.email;
  if (inAddr) inAddr.value = user.address;
}

// === MODAL SHEET ENGINE ===
function openModalSheet() {
  document.getElementById("modalBackdrop").classList.add("open");
  document.getElementById("modalSheetContainer").classList.add("open");
}

window.closeModalSheet = function () {
  document.getElementById("modalBackdrop").classList.remove("open");
  document.getElementById("modalSheetContainer").classList.remove("open");
};

document.getElementById("modalBackdrop").addEventListener("click", closeModalSheet);
