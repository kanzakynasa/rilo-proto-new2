/**
 * RILO Mobile App - Data Layer & Mock Database
 * Diadaptasi dari referensi UI RuntahPedia dengan palet warna signature RILO
 */

const INITIAL_DATA = {
  // Profil Nasabah
  user: {
    id: 1,
    name: "Kaila Zanita",
    email: "kaila.zanita@example.com",
    phone: "0812-3456-7890",
    address: "Jl. Margonda Raya No. 12, Depok",
    locationTag: "Margonda, Depok",
    nearestHub: "Smart Drop Box Kampus A (120m)",
    points: 1240,
    totalWeight: 18.4,
    completedDeposits: 42,
    avatar: "K",
    levelName: "Pahlawan Hijau",
    joinedDate: "September 2026"
  },

  // Daftar Titik Smart Drop Box & Hub RILO
  qrLocations: [
    {
      id: "RILO-BOX-01",
      name: "Smart Drop Box Kampus A",
      location: "Gedung Rektorat Lt. 1",
      distance: "120m dari lokasimu",
      status: "Siap Terima",
      slotsAvailable: "Tersedia (Kapasitas 82%)",
      type: "Smart Box"
    },
    {
      id: "RILO-BOX-02",
      name: "RILO Hub Margonda Raya",
      location: "Jl. Margonda Raya No. 45",
      distance: "850m dari lokasimu",
      status: "Siap Terima",
      slotsAvailable: "Tersedia (Drop Point & Timbangan)",
      type: "Mitra Hub"
    },
    {
      id: "RILO-BOX-03",
      name: "Smart Drop Box Asrama Mahasiswa",
      location: "Lobi Asrama Gedung C",
      distance: "1.4 km dari lokasimu",
      status: "Siap Terima",
      slotsAvailable: "Tersedia (Kapasitas 65%)",
      type: "Smart Box"
    }
  ],

  // 1. KATEGORI PER PIECE (SATUAN PER UKURAN ML / PCS)
  itemsPerPiece: [
    // Botol Plastik PET
    {
      id: "p_pet_250",
      category: "Botol Plastik PET",
      label: "Botol Plastik 250 ml",
      spec: "250 ml",
      icon: "🧴",
      pointsPerUnit: 20,
      unitLabel: "botol"
    },
    {
      id: "p_pet_330",
      category: "Botol Plastik PET",
      label: "Botol Plastik 330 ml",
      spec: "330 ml",
      icon: "🧴",
      pointsPerUnit: 30,
      unitLabel: "botol"
    },
    {
      id: "p_pet_600",
      category: "Botol Plastik PET",
      label: "Botol Plastik 600 ml",
      spec: "600 ml",
      icon: "🧴",
      pointsPerUnit: 50,
      unitLabel: "botol"
    },
    {
      id: "p_pet_1500",
      category: "Botol Plastik PET",
      label: "Botol Plastik 1.500 ml (1.5 L)",
      spec: "1.500 ml",
      icon: "🧴",
      pointsPerUnit: 100,
      unitLabel: "botol"
    },

    // Kaleng Minuman
    {
      id: "p_can_250",
      category: "Kaleng Minuman",
      label: "Kaleng Minuman 250 ml",
      spec: "250 ml",
      icon: "🥫",
      pointsPerUnit: 35,
      unitLabel: "kaleng"
    },
    {
      id: "p_can_330",
      category: "Kaleng Minuman",
      label: "Kaleng Minuman 330 ml",
      spec: "330 ml",
      icon: "🥫",
      pointsPerUnit: 50,
      unitLabel: "kaleng"
    },
    {
      id: "p_can_500",
      category: "Kaleng Minuman",
      label: "Kaleng Minuman 500 ml",
      spec: "500 ml",
      icon: "🥫",
      pointsPerUnit: 75,
      unitLabel: "kaleng"
    },

    // Tutup Botol Plastik
    {
      id: "p_cap",
      category: "Tutup Botol",
      label: "Tutup Botol Plastik",
      spec: "per piece",
      icon: "🔘",
      pointsPerUnit: 5,
      unitLabel: "pcs"
    },

    // Botol Kaca
    {
      id: "p_glass_300",
      category: "Botol Kaca",
      label: "Botol Kaca 300 ml",
      spec: "300 ml",
      icon: "🫙",
      pointsPerUnit: 40,
      unitLabel: "botol"
    },
    {
      id: "p_glass_500",
      category: "Botol Kaca",
      label: "Botol Kaca 500 ml",
      spec: "500 ml",
      icon: "🫙",
      pointsPerUnit: 65,
      unitLabel: "botol"
    },
    {
      id: "p_glass_1000",
      category: "Botol Kaca",
      label: "Botol Kaca 1.000 ml (1 L)",
      spec: "1.000 ml",
      icon: "🫙",
      pointsPerUnit: 120,
      unitLabel: "botol"
    },

    // Kemasan Karton Minuman (Tetra Pak)
    {
      id: "p_tetra_125",
      category: "Kemasan Karton Minuman",
      label: "Karton Minuman 125 ml",
      spec: "125 ml",
      icon: "🧃",
      pointsPerUnit: 15,
      unitLabel: "kotak"
    },
    {
      id: "p_tetra_200",
      category: "Kemasan Karton Minuman",
      label: "Karton Minuman 200 ml",
      spec: "200 ml",
      icon: "🧃",
      pointsPerUnit: 25,
      unitLabel: "kotak"
    },
    {
      id: "p_tetra_250",
      category: "Kemasan Karton Minuman",
      label: "Karton Minuman 250 ml",
      spec: "250 ml",
      icon: "🧃",
      pointsPerUnit: 30,
      unitLabel: "kotak"
    },
    {
      id: "p_tetra_1000",
      category: "Kemasan Karton Minuman",
      label: "Karton Minuman 1.000 ml (1 L)",
      spec: "1.000 ml",
      icon: "🧃",
      pointsPerUnit: 80,
      unitLabel: "kotak"
    }
  ],

  // 2. KATEGORI PER KG (TIMBANGAN KILOAN)
  itemsPerKg: [
    {
      id: "kg_plastic",
      label: "Plastik Campuran Kiloan",
      desc: "Kantong kresek, botol campur, wadah plastik",
      rate: 60,
      icon: "♻️"
    },
    {
      id: "kg_carton",
      label: "Kardus Paket Kiloan",
      desc: "Kardus kemasan paket & box cokelat tebal",
      rate: 45,
      icon: "📦"
    },
    {
      id: "kg_paper",
      label: "Kertas & Arsip HVS Kiloan",
      desc: "Kertas bekas, majalah, dokumen tanpa staples",
      rate: 50,
      icon: "📄"
    },
    {
      id: "kg_metal",
      label: "Kaleng & Besi Kiloan",
      desc: "Aluminium, kaleng biskuit, rongsok logam",
      rate: 150,
      icon: "🥫"
    },
    {
      id: "kg_glass",
      label: "Kaca & Beling Kiloan",
      desc: "Pecahan kaca atau botol campur utuh",
      rate: 30,
      icon: "🫙"
    }
  ],

  // Riwayat Transaksi Setoran
  deposits: [
    {
      id: "DEP-20261018-01",
      date: "2026-10-18",
      time: "14:20 WIB",
      qrBox: "Smart Drop Box Kampus A",
      mode: "Satuan (Per Piece)",
      summary: "3x Botol Plastik 600ml, 2x Kaleng 330ml",
      weightApprox: 0.8,
      pointsEarned: 250,
      status: "Selesai"
    },
    {
      id: "DEP-20261015-02",
      date: "2026-10-15",
      time: "09:45 WIB",
      qrBox: "RILO Hub Margonda Raya",
      mode: "Kiloan (Per Kg)",
      summary: "2.4 kg Kertas & Arsip HVS",
      weightApprox: 2.4,
      pointsEarned: 120,
      status: "Selesai"
    },
    {
      id: "DEP-20261011-03",
      date: "2026-10-11",
      time: "16:10 WIB",
      qrBox: "Smart Drop Box Asrama Mahasiswa",
      mode: "Satuan (Per Piece)",
      summary: "5x Botol Plastik 1.500ml, 10x Tutup Botol",
      weightApprox: 1.2,
      pointsEarned: 550,
      status: "Selesai"
    },
    {
      id: "DEP-20261008-04",
      date: "2026-10-08",
      time: "11:30 WIB",
      qrBox: "Smart Drop Box Kampus A",
      mode: "Kiloan (Per Kg)",
      summary: "0.7 kg Kaleng & Besi",
      weightApprox: 0.7,
      pointsEarned: 105,
      status: "Selesai"
    }
  ],

  // Katalog Reward & Voucher
  rewards: [
    {
      id: "REW-01",
      title: "Voucher Minuman Rp 15.000",
      description: "Berlaku di Kopi Kenangan, Fore, dan Tomoro.",
      pointsCost: 500,
      icon: "☕",
      category: "Kuliner",
      stock: 35
    },
    {
      id: "REW-02",
      title: "Diskon Belanja Rp 20.000",
      description: "Voucher mitra minimarket & Sayurbox.",
      pointsCost: 750,
      icon: "🛒",
      category: "Belanja",
      stock: 50
    },
    {
      id: "REW-03",
      title: "RILO Eco Tote Bag",
      description: "Tas ramah lingkungan hasil daur ulang serat tekstil.",
      pointsCost: 1500,
      icon: "👜",
      category: "Merchandise",
      stock: 12
    },
    {
      id: "REW-04",
      title: "Donasi 1 Bibit Pohon Bakau",
      description: "Ditanam bersama Komunitas Pesisir Hijau.",
      pointsCost: 500,
      icon: "🌱",
      category: "Donasi",
      stock: 999
    }
  ],

  // Voucher Saya yang Telah Ditukar
  redemptions: [
    {
      id: "RDM-01",
      date: "2026-09-20",
      rewardTitle: "Voucher Minuman Rp 15.000",
      pointsSpent: 500,
      code: "RILO-KOPI-7891",
      expiry: "30 Nov 2026",
      status: "Aktif"
    }
  ],

  // Data Banner Berita / Kampanye Komunitas
  banners: [
    {
      id: "b1",
      tag: "TANTANGAN KAMPUS",
      title: "Pilah 10 Botol Hari Ini, Raih Bonus Poin!",
      desc: "Dukung gerakan zero waste kampus dan kumpulkan hadiah menarik.",
      icon: "🏆"
    },
    {
      id: "b2",
      tag: "EDUKASI",
      title: "Kenali Jenis Plastik yang Bernilai Daur Ulang Tinggi",
      desc: "Simak panduan praktis memilah sampah plastik dari rumah.",
      icon: "💡"
    }
  ],

  // Edukasi RILO Learn
  guides: [
    {
      id: "g1",
      title: "Botol Plastik PET",
      icon: "🧴",
      short: "Kosongkan cairan, bilas ringan, dan pisahkan tutup botolnya.",
      content: "Botol PET transparan berlabel daur ulang kode 1 adalah material yang paling dicari oleh industri tekstil dan botol daur ulang. Selalu tiriskan sisa minuman manis agar tidak mengundang semut dan bau."
    },
    {
      id: "g2",
      title: "Kaleng Minuman Aluminium",
      icon: "🥫",
      short: "Tiriskan sisa air minuman sebelum dimasukkan ke drop box.",
      content: "Kaleng aluminium dapat didaur ulang tanpa batas waktu tanpa penurunan kualitas. Satu kaleng daur ulang menghemat energi hingga 95% dibandingkan memproduksi aluminium baru."
    },
    {
      id: "g3",
      title: "Kemasan Karton Minuman",
      icon: "🧃",
      short: "Buka lipatan dan pipihkan kemasan susu atau jus.",
      content: "Kemasan karton tetra pak memiliki lapisan serat kayu berkualitas tinggi serta lapisan aluminium tipis. Pipihkan kotak agar muat lebih banyak di dalam smart drop box."
    },
    {
      id: "g4",
      title: "Botol Kaca",
      icon: "🫙",
      short: "Pastikan botol kaca utuh dan tidak retak berbahaya.",
      content: "Kaca adalah material 100% daur ulang. Selalu letakkan botol kaca dengan hati-hati ke dalam lubang penerimaan agar tidak pecah dan melukai petugas sortasi."
    }
  ]
};

// In-Memory App State
let AppState = JSON.parse(JSON.stringify(INITIAL_DATA));

function resetAppState() {
  AppState = JSON.parse(JSON.stringify(INITIAL_DATA));
}
