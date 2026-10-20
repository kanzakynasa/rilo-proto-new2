/**
 * RILO Mobile App Prototype - Logic & Interaction Layer
 * Siap diintegrasikan ke endpoint REST API / PHP / phpMyAdmin
 */

document.addEventListener("DOMContentLoaded", () => {
  // Inisialisasi Aplikasi
  initApp();
});

function initApp() {
  setupNavigation();
  setupDepositForm();
  setupModals();
  setupProfile();
  renderAllViews();
}

// Format Angka ke Format Indonesia
const fmt = (num) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(num);

// Format Tanggal
function formatDate(dateStr) {
  try {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch (e) {
    return dateStr;
  }
}

// === TOAST NOTIFICATION SYSTEM ===
let toastTimeout;
function showToast(message, icon = "✓") {
  const toast = document.getElementById("mobileToast");
  const iconEl = document.getElementById("toastIcon");
  const msgEl = document.getElementById("toastMsg");

  if (!toast) return;

  iconEl.textContent = icon;
  msgEl.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

// === NAVIGATION & SCREEN ROUTER ===
let currentView = "home";

function switchView(viewName) {
  currentView = viewName;

  // Toggle sections
  document.querySelectorAll(".view-section").forEach((sec) => {
    sec.classList.remove("active-view");
  });

  const targetSection = document.getElementById(`view-${viewName}`);
  if (targetSection) {
    targetSection.classList.add("active-view");
  }

  // Update Bottom Nav active state
  document.querySelectorAll(".nav-tab-item").forEach((tab) => {
    if (tab.dataset.nav === viewName) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  // Scroll to top
  const container = document.getElementById("mainScrollArea");
  if (container) {
    container.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Khusus view tertentu yang butuh re-render dinamis
  if (viewName === "transactions") {
    renderTransactionsList();
  } else if (viewName === "impact") {
    renderImpactStats();
  }
}

function setupNavigation() {
  // Bottom bar navigation buttons
  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.nav;
      switchView(target);
    });
  });

  // Universal button navigators (misal tombol di hero card atau quick actions)
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-go-view]");
    if (trigger) {
      const view = trigger.dataset.goView;
      switchView(view);
    }
  });

  // Tombol reset demo data di pengaturan
  const btnReset = document.getElementById("btnResetDemo");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (confirm("Kembalikan data prototype ke contoh awal? Semua data input sesi ini akan direset.")) {
        resetAppState();
        renderAllViews();
        showToast("Data demo berhasil dikembalikan ke awal.", "↺");
        switchView("home");
      }
    });
  }

  // Tombol notifikasi di topbar
  const btnNotif = document.getElementById("btnNotification");
  if (btnNotif) {
    btnNotif.addEventListener("click", () => {
      openNotificationSheet();
    });
  }
}

// === RENDER UTAMA SEMUA TAMPILAN ===
function renderAllViews() {
  renderHome();
  renderTransactionsList();
  renderRewardsList();
  renderImpactStats();
  renderCommunityView();
  renderLearnGuides();
  updateProfileUI();
}

// 1. Tampilan Home / Beranda
function renderHome() {
  const user = AppState.user;
  document.getElementById("homeUserGreeting").textContent = `Halo, ${user.name.split(" ")[0]} 👋`;
  document.getElementById("topbarAvatar").textContent = user.avatar || user.name[0];
  document.getElementById("homePointsVal").textContent = fmt(user.points);
  document.getElementById("homeTotalWeight").textContent = `${fmt(user.totalWeight)} kg`;
  document.getElementById("homeDepositCount").textContent = `${user.completedDeposits}x`;

  // Hitung target bulanan (misal target 20 kg)
  const monthlyTarget = 20;
  const currentMonthWeight = Math.min(user.totalWeight, monthlyTarget);
  const percent = Math.min(100, Math.round((currentMonthWeight / monthlyTarget) * 100));

  const progressBar = document.getElementById("homeMonthlyProgress");
  const percentText = document.getElementById("homeMonthlyPercent");
  const weightText = document.getElementById("homeMonthlyWeight");

  if (progressBar) progressBar.style.width = `${percent}%`;
  if (percentText) percentText.textContent = `${percent}%`;
  if (weightText) weightText.textContent = `${fmt(currentMonthWeight)} kg`;

  // Render recent 3 transactions di Home
  const recentList = document.getElementById("homeRecentTxList");
  if (recentList) {
    const recent = AppState.deposits.slice(0, 3);
    if (recent.length === 0) {
      recentList.innerHTML = `<div style="text-align:center;padding:16px;font-size:12px;color:var(--text-muted)">Belum ada transaksi.</div>`;
    } else {
      recentList.innerHTML = recent.map((tx) => createTxItemHTML(tx)).join("");
    }
  }
}

// Helper membuat item riwayat transaksi
function createTxItemHTML(tx) {
  const mat = AppState.materials.find((m) => m.code === tx.materialCode) || {};
  const icon = mat.icon || "♻️";
  const isDone = tx.status === "Selesai";

  return `
    <div class="tx-card-item" onclick="openTxDetail('${tx.id}')">
      <div class="tx-icon-wrap">${icon}</div>
      <div class="tx-details">
        <div class="tx-title">${tx.materialName}</div>
        <div class="tx-sub">${formatDate(tx.date)} • ${fmt(tx.weight)} kg • ${tx.method}</div>
      </div>
      <div class="tx-right">
        <div class="tx-points" style="color: ${isDone ? 'var(--wine)' : 'var(--amber)'}">
          ${isDone ? `+${fmt(tx.pointsEarned)} pts` : 'Proses'}
        </div>
        <span class="status-badge ${isDone ? 'selesai' : 'menunggu'}">${tx.status}</span>
      </div>
    </div>
  `;
}

// 2. Form Setor Sampah & Live Kalkulator
let selectedMaterialCode = "PET";
let selectedMethod = "Drop-off";

function setupDepositForm() {
  const container = document.getElementById("materialSelectorGrid");
  if (!container) return;

  // Render pilihan material dalam kartu chip
  container.innerHTML = AppState.materials.map((m) => `
    <div class="material-card-chip ${m.code === selectedMaterialCode ? 'selected' : ''}" data-mat="${m.code}">
      <span class="mat-icon">${m.icon}</span>
      <div class="mat-info">
        <strong>${m.name}</strong>
        <span>${m.rate} pts / ${m.unit}</span>
      </div>
    </div>
  `).join("");

  // Event listener klik material
  container.querySelectorAll(".material-card-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      container.querySelectorAll(".material-card-chip").forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
      selectedMaterialCode = chip.dataset.mat;
      recalculateEstimate();
    });
  });

  // Pilihan metode Drop-off atau Pickup
  document.querySelectorAll("[data-method-radio]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-method-radio]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedMethod = btn.dataset.methodRadio;

      const locInput = document.getElementById("depositLocation");
      const locLabel = document.getElementById("depositLocationLabel");
      if (selectedMethod === "Pickup") {
        locLabel.textContent = "Alamat Penjemputan";
        locInput.value = AppState.user.address || "Jl. Margonda Raya No. 12, Depok";
      } else {
        locLabel.textContent = "Pilihan RILO Point / Drop Point";
        locInput.value = "RILO Point Kampus Utama";
      }
      recalculateEstimate();
    });
  });

  // Input berat
  const weightInput = document.getElementById("depositWeight");
  if (weightInput) {
    weightInput.addEventListener("input", recalculateEstimate);
  }

  // Submit form setoran
  const form = document.getElementById("formDepositWaste");
  if (form) {
    form.addEventListener("submit", handleDepositSubmit);
  }

  recalculateEstimate();
}

function recalculateEstimate() {
  const mat = AppState.materials.find((m) => m.code === selectedMaterialCode);
  const weightInput = document.getElementById("depositWeight");
  const w = parseFloat(weightInput ? weightInput.value : 1.0) || 0;

  if (!mat) return;

  const pts = Math.round(w * mat.rate);
  const prevPoints = document.getElementById("calcPointsVal");
  const prevSub = document.getElementById("calcFormulaText");

  if (prevPoints) prevPoints.textContent = `${fmt(pts)} pts`;
  if (prevSub) prevSub.textContent = `${fmt(w)} kg × ${mat.rate} poin/kg (${mat.name})`;
}

function handleDepositSubmit(e) {
  e.preventDefault();

  const weightInput = document.getElementById("depositWeight");
  const weightVal = parseFloat(weightInput.value);

  if (!weightVal || weightVal <= 0) {
    showToast("Harap masukkan perkiraan berat yang valid.", "⚠️");
    return;
  }

  const mat = AppState.materials.find((m) => m.code === selectedMaterialCode);
  const notes = document.getElementById("depositNotes").value.trim();
  const location = document.getElementById("depositLocation").value.trim() || "RILO Point";
  const pts = Math.round(weightVal * mat.rate);

  // Status: jika Drop-off langsung selesai (simulasi ditimbang petugas), jika Pickup maka Menunggu
  const status = selectedMethod === "Pickup" ? "Menunggu" : "Selesai";

  const newTx = {
    id: `DEP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`,
    date: new Date().toISOString().slice(0, 10),
    materialCode: mat.code,
    materialName: mat.name,
    weight: weightVal,
    method: selectedMethod,
    location: location,
    pointsEarned: pts,
    status: status,
    notes: notes || "Setoran melalui aplikasi mobile RILO"
  };

  // Simpan ke array
  AppState.deposits.unshift(newTx);

  if (status === "Selesai") {
    AppState.user.points += pts;
    AppState.user.totalWeight += weightVal;
    AppState.user.completedDeposits += 1;
    showToast(`Setoran berhasil dicatat! +${fmt(pts)} poin diperoleh.`, "🎉");
  } else {
    showToast("Permintaan jemput dibuat! Petugas akan memverifikasi berat.", "🚚");
  }

  // Reset form
  weightInput.value = "1.0";
  document.getElementById("depositNotes").value = "";
  recalculateEstimate();

  renderAllViews();

  // Arahkan otomatis ke layar Riwayat untuk melihat transaksinya
  setTimeout(() => {
    switchView("transactions");
  }, 400);
}

// 3. Tampilan Riwayat Transaksi & Filter
let currentTxFilter = "all";

function renderTransactionsList() {
  const container = document.getElementById("txListContainer");
  const countText = document.getElementById("txCountSummary");
  if (!container) return;

  const filtered = AppState.deposits.filter((t) => {
    if (currentTxFilter === "all") return true;
    return t.status === currentTxFilter;
  });

  if (countText) {
    countText.textContent = `${filtered.length} transaksi`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px;background:#fff;border-radius:18px;border:1px solid var(--border-color);">
        <div style="font-size:36px;margin-bottom:8px;">📦</div>
        <strong style="font-size:14px;display:block;">Tidak ada transaksi</strong>
        <p style="font-size:12px;color:var(--text-muted);margin-top:4px;">Belum ada setoran pada kategori filter ini.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((tx) => createTxItemHTML(tx)).join("");
}

// Setup event tombol filter transaksi
document.querySelectorAll(".filter-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    currentTxFilter = chip.dataset.filter;
    renderTransactionsList();
  });
});

// 4. Katalog Reward & Penukaran Poin
function renderRewardsList() {
  const container = document.getElementById("rewardCatalogGrid");
  const balanceText = document.getElementById("rewardUserBalance");

  if (balanceText) {
    balanceText.textContent = `${fmt(AppState.user.points)} pts`;
  }

  if (!container) return;

  container.innerHTML = AppState.rewards.map((r) => {
    const canAfford = AppState.user.points >= r.pointsCost;
    return `
      <div class="reward-mobile-card">
        <div class="reward-art-box">${r.icon}</div>
        <div class="reward-info-box">
          <strong>${r.title}</strong>
          <p>${r.description}</p>
          <div class="reward-btn-row">
            <span class="reward-tag-cost">${fmt(r.pointsCost)} Poin</span>
            <button class="btn-redeem-chip" 
              onclick="promptRedeemReward('${r.id}')"
              style="background: ${canAfford ? 'var(--wine)' : '#a99fa4'}">
              Tukar
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function promptRedeemReward(rewardId) {
  const reward = AppState.rewards.find((r) => r.id === rewardId);
  if (!reward) return;

  if (AppState.user.points < reward.pointsCost) {
    showToast(`Poin belum mencukupi. Butuh ${fmt(reward.pointsCost - AppState.user.points)} poin lagi.`, "⚠️");
    return;
  }

  // Tampilkan sheet konfirmasi penukaran
  openRedeemSheet(reward);
}

// 5. Dampak Lingkungan (Eco Impact)
function renderImpactStats() {
  const user = AppState.user;
  document.getElementById("impactTotalWeight").textContent = `${fmt(user.totalWeight)} kg`;
  document.getElementById("impactDepositsCount").textContent = `${user.completedDeposits}`;

  // Estimasi dampak lingkungan:
  // 1 kg sampah daur ulang rata-rata mencegah ~1.5 kg CO2e emisi
  const co2Saved = (user.totalWeight * 1.48).toFixed(1);
  const treesEq = (user.totalWeight * 0.08).toFixed(1);

  document.getElementById("impactCO2Saved").textContent = `${co2Saved} kg`;
  document.getElementById("impactTreesSaved").textContent = `${treesEq} pohon`;

  // Komposisi sampah
  const breakdownContainer = document.getElementById("impactBreakdownBars");
  if (!breakdownContainer) return;

  const weightByMaterial = {};
  AppState.deposits.forEach((tx) => {
    if (tx.status === "Selesai") {
      weightByMaterial[tx.materialName] = (weightByMaterial[tx.materialName] || 0) + tx.weight;
    }
  });

  const total = Object.values(weightByMaterial).reduce((a, b) => a + b, 0) || 1;

  breakdownContainer.innerHTML = Object.entries(weightByMaterial)
    .sort((a, b) => b[1] - a[1])
    .map(([name, weight]) => {
      const pct = Math.max(8, Math.round((weight / total) * 100));
      return `
        <div style="margin-bottom: 12px;">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
            <span style="font-weight:600;">${name}</span>
            <span style="font-weight:700;color:var(--wine);">${fmt(weight)} kg (${pct}%)</span>
          </div>
          <div class="progress-container" style="height:6px;margin:0;">
            <div class="progress-fill" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    }).join("") || `<div style="text-align:center;color:var(--text-muted);font-size:12px;">Belum ada setoran selesai.</div>`;
}

// 6. Komunitas & Leaderboard
function renderCommunityView() {
  const comm = AppState.community;
  const currentKgEl = document.getElementById("commCurrentKg");
  const targetBarEl = document.getElementById("commTargetBar");
  const commLeaderboardEl = document.getElementById("commLeaderboardRows");

  if (currentKgEl) currentKgEl.textContent = `${comm.currentKg} kg`;
  if (targetBarEl) {
    const pct = Math.min(100, Math.round((comm.currentKg / comm.monthlyTargetKg) * 100));
    targetBarEl.style.width = `${pct}%`;
  }

  if (commLeaderboardEl) {
    commLeaderboardEl.innerHTML = comm.leaderboard.map((item) => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;border-bottom:1px solid var(--border-color);">
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:16px;width:24px;text-align:center;">${item.badge || item.rank}</span>
          <div>
            <strong style="font-size:13px;display:block;">${item.name}</strong>
            <span style="font-size:11px;color:var(--text-muted);">${item.weight} kg terkumpul</span>
          </div>
        </div>
        <span class="status-badge selesai">${item.status}</span>
      </div>
    `).join("");
  }
}

// 7. Edukasi RILO Learn
function renderLearnGuides() {
  const container = document.getElementById("learnGuidesList");
  if (!container) return;

  container.innerHTML = AppState.guides.map((g) => `
    <div class="learn-tile" onclick="openGuideDetail('${g.id}')">
      <div style="font-size:28px;width:44px;height:44px;border-radius:12px;background:var(--wine-soft);display:grid;place-items:center;flex-shrink:0;">
        ${g.icon}
      </div>
      <div>
        <strong style="font-size:13px;color:var(--text-main);">${g.title}</strong>
        <p style="font-size:11px;color:var(--text-muted);margin-top:3px;line-height:1.35;">${g.short}</p>
      </div>
    </div>
  `).join("");
}

// 8. Profil Pengguna
function setupProfile() {
  const form = document.getElementById("formEditProfile");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const newName = document.getElementById("profInputName").value.trim();
      const newEmail = document.getElementById("profInputEmail").value.trim();
      const newAddress = document.getElementById("profInputAddress").value.trim();

      if (newName) {
        AppState.user.name = newName;
        AppState.user.avatar = newName[0].toUpperCase();
      }
      if (newEmail) AppState.user.email = newEmail;
      if (newAddress) AppState.user.address = newAddress;

      updateProfileUI();
      renderHome();
      showToast("Data profil berhasil diperbarui!", "✓");
    });
  }
}

function updateProfileUI() {
  const user = AppState.user;
  const avatar = user.avatar || user.name[0];

  document.querySelectorAll(".user-avatar-text").forEach((el) => {
    el.textContent = avatar;
  });

  document.getElementById("profNameDisplay").textContent = user.name;
  document.getElementById("profEmailDisplay").textContent = user.email;
  document.getElementById("profTierDisplay").textContent = user.tier;

  const inpName = document.getElementById("profInputName");
  const inpEmail = document.getElementById("profInputEmail");
  const inpAddress = document.getElementById("profInputAddress");

  if (inpName) inpName.value = user.name;
  if (inpEmail) inpEmail.value = user.email;
  if (inpAddress) inpAddress.value = user.address;
}

// === BOTTOM SHEETS & MODALS MANAGEMENT ===
function setupModals() {
  const backdrop = document.getElementById("bottomSheetBackdrop");
  if (backdrop) {
    backdrop.addEventListener("click", closeAllSheets);
  }

  document.querySelectorAll(".sheet-close-btn").forEach((btn) => {
    btn.addEventListener("click", closeAllSheets);
  });
}

function closeAllSheets() {
  const backdrop = document.getElementById("bottomSheetBackdrop");
  if (backdrop) backdrop.classList.remove("active");

  document.querySelectorAll(".bottom-sheet").forEach((sheet) => {
    sheet.classList.remove("active");
  });
}

function openSheet(sheetId) {
  closeAllSheets();
  const backdrop = document.getElementById("bottomSheetBackdrop");
  const sheet = document.getElementById(sheetId);

  if (backdrop && sheet) {
    backdrop.classList.add("active");
    sheet.classList.add("active");
  }
}

// Buka Detail Transaksi
window.openTxDetail = function (txId) {
  const tx = AppState.deposits.find((t) => t.id === txId);
  if (!tx) return;

  const content = document.getElementById("txDetailSheetContent");
  const isDone = tx.status === "Selesai";

  content.innerHTML = `
    <div style="text-align:center;margin-bottom:16px;">
      <div style="width:52px;height:52px;border-radius:18px;background:var(--wine-soft);color:var(--wine);display:grid;place-items:center;font-size:24px;margin:0 auto 10px;">
        🧾
      </div>
      <h3 style="font-size:16px;margin-bottom:2px;">Bukti Setoran RILO</h3>
      <span style="font-size:11px;color:var(--text-muted);">${tx.id}</span>
    </div>

    <div style="background:#faf7f8;border-radius:16px;padding:14px;border:1px solid var(--border-color);margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;border-bottom:1px solid #f0e6eb;">
        <span style="color:var(--text-muted);">Tanggal</span>
        <strong>${formatDate(tx.date)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;border-bottom:1px solid #f0e6eb;">
        <span style="color:var(--text-muted);">Material</span>
        <strong>${tx.materialName}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;border-bottom:1px solid #f0e6eb;">
        <span style="color:var(--text-muted);">Berat</span>
        <strong>${fmt(tx.weight)} kg</strong>
      </div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;border-bottom:1px solid #f0e6eb;">
        <span style="color:var(--text-muted);">Metode</span>
        <strong>${tx.method}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;border-bottom:1px solid #f0e6eb;">
        <span style="color:var(--text-muted);">Lokasi / Titik</span>
        <strong style="text-align:right;max-width:180px;">${tx.location}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;border-bottom:1px solid #f0e6eb;">
        <span style="color:var(--text-muted);">Poin Diperoleh</span>
        <strong style="color:var(--wine);font-size:14px;">+${fmt(tx.pointsEarned)} pts</strong>
      </div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;">
        <span style="color:var(--text-muted);">Status</span>
        <span class="status-badge ${isDone ? 'selesai' : 'menunggu'}">${tx.status}</span>
      </div>
    </div>

    ${tx.notes ? `<div style="font-size:11px;color:var(--text-muted);margin-bottom:18px;background:#fff;padding:10px;border-radius:10px;border:1px solid var(--border-color);"><strong>Catatan:</strong> ${tx.notes}</div>` : ''}

    <button class="btn-primary-mobile" onclick="closeAllSheets()">Tutup</button>
  `;

  openSheet("sheetTxDetail");
};

// Buka Modal Konfirmasi Redeem Reward
function openRedeemSheet(reward) {
  const content = document.getElementById("redeemSheetContent");

  content.innerHTML = `
    <div style="text-align:center;margin-bottom:16px;">
      <div style="font-size:42px;margin-bottom:8px;">${reward.icon}</div>
      <h3 style="font-size:16px;margin-bottom:4px;">${reward.title}</h3>
      <p style="font-size:12px;color:var(--text-muted);">${reward.description}</p>
    </div>

    <div style="background:var(--wine-softer);border:1.5px dashed #ddb0c0;border-radius:16px;padding:16px;text-align:center;margin-bottom:20px;">
      <span style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:700;">Biaya Penukaran</span>
      <div style="font-size:24px;font-weight:850;color:var(--wine);margin:4px 0;">${fmt(reward.pointsCost)} Poin</div>
      <small style="font-size:11px;color:var(--text-muted);">Sisa poinmu saat ini: ${fmt(AppState.user.points)} pts</small>
    </div>

    <div style="display:flex;gap:10px;">
      <button class="btn-secondary-mobile" onclick="closeAllSheets()">Batal</button>
      <button class="btn-primary-mobile" id="confirmRedeemBtn">Konfirmasi Tukar</button>
    </div>
  `;

  openSheet("sheetRedeem");

  document.getElementById("confirmRedeemBtn").onclick = () => {
    // Kurangi poin
    AppState.user.points -= reward.pointsCost;

    // Hasilkan kode voucher unik
    const voucherCode = `RILO-${reward.category.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    content.innerHTML = `
      <div style="text-align:center;padding:10px 0;">
        <div style="font-size:48px;margin-bottom:10px;">🎉</div>
        <h3 style="font-size:17px;color:var(--wine);margin-bottom:6px;">Penukaran Berhasil!</h3>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:18px;">Kamu berhasil menukarkan ${reward.title}. Tunjukkan kode voucher ini kepada mitra terkait.</p>

        <div style="background:#f4f2f4;border-radius:14px;padding:14px;border:1.5px dashed #baa8b0;margin-bottom:20px;">
          <span style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700;display:block;">Kode Voucher Simulasi</span>
          <strong style="font-size:20px;letter-spacing:2px;color:var(--text-main);">${voucherCode}</strong>
        </div>

        <button class="btn-primary-mobile" onclick="closeAllSheets(); renderAllViews();">Selesai</button>
      </div>
    `;

    showToast("Voucher berhasil diperoleh!", "🎁");
  };
}

// Buka Detail Panduan Edukasi
window.openGuideDetail = function (guideId) {
  const guide = AppState.guides.find((g) => g.id === guideId);
  if (!guide) return;

  const content = document.getElementById("guideSheetContent");
  content.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <div style="font-size:32px;width:52px;height:52px;border-radius:14px;background:var(--wine-soft);display:grid;place-items:center;">
        ${guide.icon}
      </div>
      <div>
        <h3 style="font-size:16px;">${guide.title}</h3>
        <span style="font-size:11px;color:var(--wine);font-weight:700;">Panduan Pemilahan</span>
      </div>
    </div>

    <div style="font-size:13px;line-height:1.6;color:var(--text-main);background:#faf7f8;border-radius:16px;padding:16px;border:1px solid var(--border-color);margin-bottom:20px;">
      ${guide.content}
    </div>

    <button class="btn-primary-mobile" onclick="closeAllSheets()">Paham & Tutup</button>
  `;

  openSheet("sheetGuide");
};

// Notifikasi Panel
function openNotificationSheet() {
  const content = document.getElementById("notifSheetContent");
  content.innerHTML = `
    <div style="margin-bottom: 14px;">
      <div style="display:flex;gap:12px;padding:12px;background:#faf7f8;border-radius:14px;border:1px solid var(--border-color);margin-bottom:8px;">
        <span style="font-size:20px;">🎉</span>
        <div>
          <strong style="font-size:12px;display:block;">Selamat Datang di Prototype RILO!</strong>
          <p style="font-size:11px;color:var(--text-muted);margin-top:2px;">Aplikasi web mobile ini merupakan prototype front-end interaktif bank sampah terintegrasi.</p>
        </div>
      </div>
      <div style="display:flex;gap:12px;padding:12px;background:#faf7f8;border-radius:14px;border:1px solid var(--border-color);">
        <span style="font-size:20px;">🌱</span>
        <div>
          <strong style="font-size:12px;display:block;">Tantangan Bulan Ini Aktif</strong>
          <p style="font-size:11px;color:var(--text-muted);margin-top:2px;">Capai target 10 kg bulan ini untuk membuka tier penghargaan baru.</p>
        </div>
      </div>
    </div>
    <button class="btn-primary-mobile" onclick="closeAllSheets()">Tutup</button>
  `;

  openSheet("sheetNotif");
}
