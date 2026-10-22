/**
 * RILO Mobile App - Data Layer & Mock Database
 * Lokasi Bintaro Tangerang Selatan & Kamus Multi-Bahasa (ID & EN)
 */

const INITIAL_DATA = {
  // State Sesi & Autentikasi
  auth: {
    isLoggedIn: false, // Memerlukan login/sign-in sebelum akses web app
    loginMethod: null   // 'google' atau 'email'
  },

  // Pengaturan Bahasa Aktif
  currentLang: "id", // 'id' atau 'en'

  // Profil Nasabah
  user: {
    id: 1,
    name: "Kaila Zanita",
    email: "kaila.zanita@example.com",
    phone: "0812-3456-7890",
    address: "Bintaro Jaya Sektor 7, Tangerang Selatan",
    locationTag: "Bintaro, Tangerang Selatan",
    nearestHub: "Smart Drop Box Bintaro Xchange (150m)",
    points: 1240,
    totalWeight: 18.4,
    completedDeposits: 42,
    avatar: "K",
    levelName: "Pahlawan Hijau",
    levelNameEn: "Eco Hero",
    joinedDate: "September 2026"
  },

  // Titik Smart Drop Box & Hub RILO di BINTARO
  qrLocations: [
    {
      id: "RILO-BX-01",
      name: "Smart Drop Box Bintaro Xchange",
      location: "Bintaro Jaya Xchange Mall, Lt. LG",
      lat: -6.2872,
      lng: 106.7280,
      distance: "150m",
      status: "Siap Terima",
      statusEn: "Ready to Accept",
      capacityPercent: 35,
      slotsAvailable: "Kapasitas Tersedia 65%",
      slotsAvailableEn: "Available Capacity 65%",
      operatingHours: "10.00 - 22.00 WIB",
      type: "Smart Box"
    },
    {
      id: "RILO-BX-02",
      name: "RILO Hub Bintaro Sektor 7",
      location: "Jl. Boulevard Bintaro Jaya No. 18",
      lat: -6.2795,
      lng: 106.7210,
      distance: "800m",
      status: "Buka Sekarang",
      statusEn: "Open Now",
      capacityPercent: 48,
      slotsAvailable: "Drop Point & Timbangan Kiloan",
      slotsAvailableEn: "Drop Point & Scale Station",
      operatingHours: "08.00 - 18.00 WIB",
      type: "Mitra Hub"
    },
    {
      id: "RILO-BX-03",
      name: "Smart Drop Box Stasiun Jurangmangu",
      location: "Pintu Barat Stasiun KRL Jurangmangu",
      lat: -6.2915,
      lng: 106.7298,
      distance: "1.2 km",
      status: "Siap Terima",
      statusEn: "Ready to Accept",
      capacityPercent: 52,
      slotsAvailable: "Kapasitas Tersedia 48%",
      slotsAvailableEn: "Available Capacity 48%",
      operatingHours: "24 Jam",
      type: "Smart Box"
    },
    {
      id: "RILO-BX-04",
      name: "RILO Drop Point Fresh Market",
      location: "Kawasan Emerald Bintaro Jaya",
      lat: -6.2710,
      lng: 106.7125,
      distance: "2.1 km",
      status: "Buka Pagi",
      statusEn: "Open Morning",
      capacityPercent: 30,
      slotsAvailable: "Kapasitas Tersedia 70%",
      slotsAvailableEn: "Available Capacity 70%",
      operatingHours: "06.00 - 17.00 WIB",
      type: "Mitra Hub"
    }
  ],

  // 1. KATEGORI PER PIECE (SATUAN PER UKURAN ML / PCS)
  itemsPerPiece: [
    // Botol Plastik PET
    {
      id: "p_pet_250",
      category: "Botol Plastik PET",
      categoryEn: "PET Plastic Bottles",
      label: "Botol Plastik 250 ml",
      labelEn: "Plastic Bottle 250 ml",
      spec: "250 ml",
      iconType: "bottle",
      pointsPerUnit: 20,
      unitLabel: "botol",
      unitLabelEn: "bottle"
    },
    {
      id: "p_pet_330",
      category: "Botol Plastik PET",
      categoryEn: "PET Plastic Bottles",
      label: "Botol Plastik 330 ml",
      labelEn: "Plastic Bottle 330 ml",
      spec: "330 ml",
      iconType: "bottle",
      pointsPerUnit: 30,
      unitLabel: "botol",
      unitLabelEn: "bottle"
    },
    {
      id: "p_pet_600",
      category: "Botol Plastik PET",
      categoryEn: "PET Plastic Bottles",
      label: "Botol Plastik 600 ml",
      labelEn: "Plastic Bottle 600 ml",
      spec: "600 ml",
      iconType: "bottle",
      pointsPerUnit: 50,
      unitLabel: "botol",
      unitLabelEn: "bottle"
    },
    {
      id: "p_pet_1500",
      category: "Botol Plastik PET",
      categoryEn: "PET Plastic Bottles",
      label: "Botol Plastik 1.500 ml",
      labelEn: "Plastic Bottle 1,500 ml",
      spec: "1.500 ml (1.5L)",
      iconType: "bottle-large",
      pointsPerUnit: 100,
      unitLabel: "botol",
      unitLabelEn: "bottle"
    },

    // Kaleng Minuman
    {
      id: "p_can_250",
      category: "Kaleng Minuman",
      categoryEn: "Beverage Cans",
      label: "Kaleng Minuman 250 ml",
      labelEn: "Beverage Can 250 ml",
      spec: "250 ml",
      iconType: "can",
      pointsPerUnit: 35,
      unitLabel: "kaleng",
      unitLabelEn: "can"
    },
    {
      id: "p_can_330",
      category: "Kaleng Minuman",
      categoryEn: "Beverage Cans",
      label: "Kaleng Minuman 330 ml",
      labelEn: "Beverage Can 330 ml",
      spec: "330 ml",
      iconType: "can",
      pointsPerUnit: 50,
      unitLabel: "kaleng",
      unitLabelEn: "can"
    },
    {
      id: "p_can_500",
      category: "Kaleng Minuman",
      categoryEn: "Beverage Cans",
      label: "Kaleng Minuman 500 ml",
      labelEn: "Beverage Can 500 ml",
      spec: "500 ml",
      iconType: "can",
      pointsPerUnit: 75,
      unitLabel: "kaleng",
      unitLabelEn: "can"
    },

    // Tutup Botol Plastik
    {
      id: "p_cap",
      category: "Tutup Botol",
      categoryEn: "Bottle Caps",
      label: "Tutup Botol Plastik",
      labelEn: "Plastic Bottle Cap",
      spec: "per piece",
      iconType: "cap",
      pointsPerUnit: 5,
      unitLabel: "pcs",
      unitLabelEn: "pcs"
    },

    // Botol Kaca
    {
      id: "p_glass_300",
      category: "Botol Kaca",
      categoryEn: "Glass Bottles",
      label: "Botol Kaca 300 ml",
      labelEn: "Glass Bottle 300 ml",
      spec: "300 ml",
      iconType: "glass",
      pointsPerUnit: 40,
      unitLabel: "botol",
      unitLabelEn: "bottle"
    },
    {
      id: "p_glass_500",
      category: "Botol Kaca",
      categoryEn: "Glass Bottles",
      label: "Botol Kaca 500 ml",
      labelEn: "Glass Bottle 500 ml",
      spec: "500 ml",
      iconType: "glass",
      pointsPerUnit: 65,
      unitLabel: "botol",
      unitLabelEn: "bottle"
    },
    {
      id: "p_glass_1000",
      category: "Botol Kaca",
      categoryEn: "Glass Bottles",
      label: "Botol Kaca 1.000 ml",
      labelEn: "Glass Bottle 1,000 ml",
      spec: "1.000 ml (1L)",
      iconType: "glass-large",
      pointsPerUnit: 120,
      unitLabel: "botol",
      unitLabelEn: "bottle"
    },

    // Kemasan Karton Minuman (Tetra Pak)
    {
      id: "p_tetra_125",
      category: "Kemasan Karton Minuman",
      categoryEn: "Beverage Cartons",
      label: "Karton Minuman 125 ml",
      labelEn: "Carton Drink 125 ml",
      spec: "125 ml",
      iconType: "carton",
      pointsPerUnit: 15,
      unitLabel: "kotak",
      unitLabelEn: "carton"
    },
    {
      id: "p_tetra_200",
      category: "Kemasan Karton Minuman",
      categoryEn: "Beverage Cartons",
      label: "Karton Minuman 200 ml",
      labelEn: "Carton Drink 200 ml",
      spec: "200 ml",
      iconType: "carton",
      pointsPerUnit: 25,
      unitLabel: "kotak",
      unitLabelEn: "carton"
    },
    {
      id: "p_tetra_250",
      category: "Kemasan Karton Minuman",
      categoryEn: "Beverage Cartons",
      label: "Karton Minuman 250 ml",
      labelEn: "Carton Drink 250 ml",
      spec: "250 ml",
      iconType: "carton",
      pointsPerUnit: 30,
      unitLabel: "kotak",
      unitLabelEn: "carton"
    },
    {
      id: "p_tetra_1000",
      category: "Kemasan Karton Minuman",
      categoryEn: "Beverage Cartons",
      label: "Karton Minuman 1.000 ml",
      labelEn: "Carton Drink 1,000 ml",
      spec: "1.000 ml (1L)",
      iconType: "carton-large",
      pointsPerUnit: 80,
      unitLabel: "kotak",
      unitLabelEn: "carton"
    }
  ],

  // 2. KATEGORI PER KG (TIMBANGAN KILOAN)
  itemsPerKg: [
    {
      id: "kg_plastic",
      label: "Plastik Campuran Kiloan",
      labelEn: "Mixed Plastic per Kg",
      desc: "Kantong kresek, wadah plastik campur",
      descEn: "Plastic bags, mixed plastic containers",
      rate: 60,
      iconType: "plastic-kg"
    },
    {
      id: "kg_carton",
      label: "Kardus Paket Kiloan",
      labelEn: "Cardboard Boxes per Kg",
      desc: "Kardus kemasan paket & box cokelat tebal",
      descEn: "Package cartons & thick brown delivery boxes",
      rate: 45,
      iconType: "box-kg"
    },
    {
      id: "kg_paper",
      label: "Kertas & Arsip HVS Kiloan",
      labelEn: "Waste Paper & HVS per Kg",
      desc: "Kertas bekas, majalah, arsip tanpa staples",
      descEn: "Used paper, magazines, files without staples",
      rate: 50,
      iconType: "paper-kg"
    },
    {
      id: "kg_metal",
      label: "Kaleng & Besi Kiloan",
      labelEn: "Metal & Scrap Cans per Kg",
      desc: "Aluminium, kaleng biskuit, rongsok logam",
      descEn: "Aluminium, biscuit tins, scrap metals",
      rate: 150,
      iconType: "metal-kg"
    },
    {
      id: "kg_glass",
      label: "Kaca & Beling Kiloan",
      labelEn: "Glass & Jars per Kg",
      desc: "Pecahan kaca atau botol campur utuh",
      descEn: "Broken glass or mixed whole bottles",
      rate: 30,
      iconType: "glass-kg"
    }
  ],

  // Riwayat Transaksi Setoran
  deposits: [
    {
      id: "DEP-20261018-01",
      date: "2026-10-18",
      time: "14:20 WIB",
      qrBox: "Smart Drop Box Bintaro Xchange",
      mode: "Satuan (Per Piece)",
      modeEn: "By Piece",
      summary: "3x Botol Plastik 600ml, 2x Kaleng 330ml",
      weightApprox: 0.8,
      pointsEarned: 250,
      status: "Selesai",
      statusEn: "Completed"
    },
    {
      id: "DEP-20261015-02",
      date: "2026-10-15",
      time: "09:45 WIB",
      qrBox: "RILO Hub Bintaro Sektor 7",
      mode: "Kiloan (Per Kg)",
      modeEn: "By Kg",
      summary: "2.4 kg Kertas & Arsip HVS",
      weightApprox: 2.4,
      pointsEarned: 120,
      status: "Selesai",
      statusEn: "Completed"
    },
    {
      id: "DEP-20261011-03",
      date: "2026-10-11",
      time: "16:10 WIB",
      qrBox: "Smart Drop Box Stasiun Jurangmangu",
      mode: "Satuan (Per Piece)",
      modeEn: "By Piece",
      summary: "5x Botol Plastik 1.500ml, 10x Tutup Botol",
      weightApprox: 1.2,
      pointsEarned: 550,
      status: "Selesai",
      statusEn: "Completed"
    },
    {
      id: "DEP-20261008-04",
      date: "2026-10-08",
      time: "11:30 WIB",
      qrBox: "Smart Drop Box Bintaro Xchange",
      mode: "Kiloan (Per Kg)",
      modeEn: "By Kg",
      summary: "0.7 kg Kaleng & Besi",
      weightApprox: 0.7,
      pointsEarned: 105,
      status: "Selesai",
      statusEn: "Completed"
    }
  ],

  // Katalog Reward & Voucher
  rewards: [
    {
      id: "REW-01",
      partner: "Kopi Kenangan",
      title: "Voucher Minuman Rp 15.000",
      titleEn: "Drink Voucher IDR 15,000",
      description: "Diskon Rp 15rb untuk semua varian minuman kopi/non-kopi.",
      descriptionEn: "IDR 15k discount on all coffee or beverage varieties.",
      pointsCost: 500,
      tag: "Kuliner",
      tagEn: "F&B",
      stock: 45
    },
    {
      id: "REW-02",
      partner: "Sayurbox",
      title: "Diskon Belanja Rp 20.000",
      titleEn: "Shopping Voucher IDR 20,000",
      description: "Voucher belanja sayur & buah organik mitra RILO.",
      descriptionEn: "Shopping discount on fresh organic groceries.",
      pointsCost: 750,
      tag: "Belanja",
      tagEn: "Groceries",
      stock: 30
    },
    {
      id: "REW-03",
      partner: "RILO Merchandise",
      title: "RILO Eco Tote Bag",
      titleEn: "RILO Eco Tote Bag",
      description: "Tas ramah lingkungan hasil olahan daur ulang serat tekstil.",
      descriptionEn: "Eco-friendly tote bag crafted from recycled textile fibers.",
      pointsCost: 1500,
      tag: "Merchandise",
      tagEn: "Merchandise",
      stock: 12
    },
    {
      id: "REW-04",
      partner: "Yayasan Mangrove",
      title: "Donasi 1 Bibit Pohon Bakau",
      titleEn: "Donate 1 Mangrove Seedling",
      description: "Ditanam atas namamu di kawasan pesisir restorasi hijau.",
      descriptionEn: "Planted in your name in coastal reforestation areas.",
      pointsCost: 500,
      tag: "Donasi",
      tagEn: "Donation",
      stock: 999
    }
  ],

  // Voucher Saya yang Telah Ditukar
  redemptions: [
    {
      id: "RDM-01",
      date: "2026-09-20",
      partner: "Kopi Kenangan",
      rewardTitle: "Voucher Minuman Rp 15.000",
      rewardTitleEn: "Drink Voucher IDR 15,000",
      pointsSpent: 500,
      code: "RILO-KOPI-7891",
      expiry: "30 Nov 2026",
      status: "Tersedia",
      statusEn: "Available"
    }
  ],

  // Edukasi & Artikel Daur Ulang
  guides: [
    {
      id: "g1",
      tag: "PLASTIK",
      tagEn: "PLASTIC",
      title: "Cara Menyiapkan Botol Plastik PET Sebelum Disetor",
      titleEn: "Preparing PET Plastic Bottles Before Deposit",
      readTime: "2 mnt baca",
      readTimeEn: "2 min read",
      content: "Botol PET transparan berlabel daur ulang kode 1 adalah material yang paling diminati industri daur ulang. Pastikan botol dikosongkan dari cairan manis, dibilas ringan, dan lepaskan tutupnya karena memiliki jenis plastik yang berbeda.",
      contentEn: "Clear PET bottles (recycling code 1) are highly valuable in recycling chains. Ensure bottles are emptied, rinsed lightly, and caps separated as they are made of a different polymer."
    },
    {
      id: "g2",
      tag: "LOGAM",
      tagEn: "METALS",
      title: "Nilai Daur Ulang Kaleng Aluminium Tanpa Batas",
      titleEn: "Endless Recyclability of Aluminium Cans",
      readTime: "3 mnt baca",
      readTimeEn: "3 min read",
      content: "Aluminium dapat didaur ulang 100% tanpa penurunan kualitas fisik. Satu kaleng daur ulang mampu menghemat energi hingga 95% dibandingkan pengolahan bijih bauksit baru.",
      contentEn: "Aluminium is infinitely recyclable without losing quality. Recycling a single can saves up to 95% of energy compared to raw bauxite processing."
    },
    {
      id: "g3",
      tag: "KARTON",
      tagEn: "CARTONS",
      title: "Langkah Memipihkan Kemasan Karton Minuman",
      titleEn: "Flattening Beverage Drink Cartons",
      readTime: "2 mnt baca",
      readTimeEn: "2 min read",
      content: "Kemasan karton tetra pak mengandung lapisan serat kertas murni dan aluminium tipis. Membuka lipatan samping dan memipihkannya akan menghemat volume ruang di smart drop box.",
      contentEn: "Beverage cartons contain virgin paper fibers and protective foil. Unfolding and flattening them maximizes capacity inside smart drop boxes."
    }
  ],

  // Kamus Bahasa (i18n Dictionary)
  translations: {
    id: {
      subGreeting: "Sudah pilah sampah hari ini?",
      walletTitle: "Saldo RILO Poin",
      btnRedeemReward: "Tukar Hadiah",
      btnMyVouchers: "Voucher Saya",
      mapCardTitle: "Titik Drop Box Bintaro",
      mapFullLink: "Buka Peta Penuh →",
      servicesTitle: "Layanan Daur Ulang",
      svcScan: "Scan & Setor",
      svcFind: "Cari Drop Box",
      svcReward: "Tukar Hadiah",
      svcImpact: "Dampak Hijau",
      campaignTag: "TANTANGAN BINTARO",
      campaignTitle: "Pilah 10 Botol Hari Ini, Raih Bonus Poin!",
      campaignDesc: "Kumpulkan kemasan minumanmu di Smart Drop Box Bintaro Xchange dan dapatkan voucher kopi favorit.",
      recentTitle: "Aktivitas Terakhir",
      seeAll: "Lihat Semua →",
      navHome: "Beranda",
      navHistory: "Riwayat",
      navDeposit: "Setor",
      navReward: "Hadiah",
      navMore: "Lainnya",
      scanTitle: "Scan QR Drop Box",
      scanSub: "Arahkan ke QR Code pada pintu Smart Drop Box",
      scanSearching: "Mencari kode QR Drop Box di sekitar...",
      btnConnectBox: "Hubungkan Drop Box & Buka Pintu",
      tabPiece: "Satuan per Ukuran (Per Piece)",
      tabKg: "Timbangan Kiloan (Per Kg)",
      btnConfirmDeposit: "Konfirmasi & Setor",
      itemsSelected: "item terpilih",
      kgRecorded: "kg tercatat",
      historyTitle: "Riwayat Setoran",
      historySub: "Catatan sampah yang telah kamu setorkan ke RILO.",
      rewardCatalogTitle: "Katalog Hadiah & Voucher",
      myVouchersTitle: "Voucher Saya",
      myVouchersSub: "Tunjukkan kode voucher berikut kepada kasir mitra untuk menggunakan potongan harga.",
      fullMapTitle: "Peta Smart Drop Box",
      fullMapSub: "Lokasi tempat sampah & hub RILO di kawasan Bintaro",
      impactTitle: "Dampak Daur Ulang",
      impactMat: "Total Material",
      impactFreq: "Frekuensi Setoran",
      impactCo2: "Estimasi Emisi CO2 Dicegah",
      impactCo2Sub: "Setara dengan menanam 1,8 pohon muda yang menyerap karbon dioksida selama satu tahun penuh.",
      profileTitle: "Pengaturan Profil",
      btnSaveProfile: "Simpan Profil",
      btnResetDemo: "Reset Data Demo",
      btnResetDemoSub: "Kembalikan data ke awal simulasi",
      loginTitle: "Masuk ke RILO",
      loginSub: "Kelola setoran sampahmu dan kumpulkan poin setiap hari.",
      btnGoogleLogin: "Lanjutkan dengan Google",
      btnEmailLogin: "Masuk dengan Email",
      btnGuestDemo: "Coba Demo Langsung (Tanpa Password)",
      orText: "atau masuk dengan email",
      labelEmail: "Alamat Email",
      labelPassword: "Kata Sandi",
      tabSignIn: "Masuk",
      tabSignUp: "Daftar Akun",
      btnLogout: "Keluar Akun",
      tabAll: "All",
      tabFood: "Food",
      tabShopping: "Shopping",
      tabMerch: "Merch",
      tabDonate: "Donate"
    },
    en: {
      subGreeting: "Have you sorted your waste today?",
      walletTitle: "RILO Points Balance",
      btnRedeemReward: "Redeem Rewards",
      btnMyVouchers: "My Vouchers",
      mapCardTitle: "Bintaro Drop Box Points",
      mapFullLink: "Open Full Map →",
      servicesTitle: "Recycle Services",
      svcScan: "Scan & Deposit",
      svcFind: "Find Drop Box",
      svcReward: "Rewards",
      svcImpact: "Eco Impact",
      campaignTag: "BINTARO CHALLENGE",
      campaignTitle: "Sort 10 Bottles Today, Win Bonus Points!",
      campaignDesc: "Drop your beverage packages at Bintaro Xchange Smart Drop Box and claim your favorite coffee voucher.",
      recentTitle: "Recent Activity",
      seeAll: "See All →",
      navHome: "Home",
      navHistory: "History",
      navDeposit: "Deposit",
      navReward: "Rewards",
      navMore: "More",
      scanTitle: "Scan QR Drop Box",
      scanSub: "Point camera at the QR Code on the Smart Drop Box door",
      scanSearching: "Detecting nearby Drop Box QR Code...",
      btnConnectBox: "Connect Drop Box & Unlock",
      tabPiece: "By Size Unit (Per Piece)",
      tabKg: "By Weight Scale (Per Kg)",
      btnConfirmDeposit: "Confirm & Deposit",
      itemsSelected: "items selected",
      kgRecorded: "kg recorded",
      historyTitle: "Deposit History",
      historySub: "Your recorded waste deposits into RILO smart bins.",
      rewardCatalogTitle: "Rewards & Voucher Catalog",
      myVouchersTitle: "My Vouchers",
      myVouchersSub: "Show this voucher code to partner cashiers at checkout.",
      fullMapTitle: "Smart Drop Box Map",
      fullMapSub: "Locations of RILO smart bins & hubs in Bintaro area",
      impactTitle: "Recycle Impact",
      impactMat: "Total Waste Saved",
      impactFreq: "Deposit Frequency",
      impactCo2: "Estimated CO2 Prevented",
      impactCo2Sub: "Equivalent to planting 1.8 tree saplings absorbing CO2 for an entire year.",
      profileTitle: "Profile Settings",
      btnSaveProfile: "Save Profile",
      btnResetDemo: "Reset Demo Data",
      btnResetDemoSub: "Restore initial demo sample data",
      loginTitle: "Sign In to RILO",
      loginSub: "Track your waste deposits and earn rewards every day.",
      btnGoogleLogin: "Continue with Google",
      btnEmailLogin: "Sign In with Email",
      btnGuestDemo: "Try Demo Directly (One Click)",
      orText: "or sign in with email",
      labelEmail: "Email Address",
      labelPassword: "Password",
      tabSignIn: "Sign In",
      tabSignUp: "Register",
      btnLogout: "Sign Out",
      tabAll: "All",
      tabFood: "Food",
      tabShopping: "Shopping",
      tabMerch: "Merch",
      tabDonate: "Donate"
    }
  }
};

let AppState = JSON.parse(JSON.stringify(INITIAL_DATA));

function resetAppState() {
  AppState = JSON.parse(JSON.stringify(INITIAL_DATA));
}
