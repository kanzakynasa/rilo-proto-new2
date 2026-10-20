/**
 * RILO Mobile App - Data Layer & Mock Database
 * Skema data dengan koordinat map titik drop point dan kategori sampah spesifik
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

  // Titik Smart Drop Box & Hub RILO (Lengkap dengan Koordinat Peta)
  qrLocations: [
    {
      id: "RILO-BOX-01",
      name: "Smart Drop Box Kampus A",
      location: "Gedung Rektorat Lt. 1",
      lat: -6.3628,
      lng: 106.8282,
      distance: "120m",
      status: "Online & Siap Terima",
      capacityPercent: 38,
      slotsAvailable: "Kapasitas Tersedia 62%",
      operatingHours: "07.00 - 21.00 WIB",
      type: "Smart Box"
    },
    {
      id: "RILO-BOX-02",
      name: "RILO Hub Margonda Raya",
      location: "Jl. Margonda Raya No. 45",
      lat: -6.3725,
      lng: 106.8320,
      distance: "850m",
      status: "Buka Sekarang",
      capacityPercent: 55,
      slotsAvailable: "Drop Point & Timbangan Kiloan",
      operatingHours: "08.00 - 18.00 WIB",
      type: "Mitra Hub"
    },
    {
      id: "RILO-BOX-03",
      name: "Smart Drop Box Asrama",
      location: "Lobi Asrama Gedung C",
      lat: -6.3560,
      lng: 106.8315,
      distance: "1.4 km",
      status: "Online & Siap Terima",
      capacityPercent: 42,
      slotsAvailable: "Kapasitas Tersedia 58%",
      operatingHours: "24 Jam",
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
      iconType: "bottle",
      pointsPerUnit: 20,
      unitLabel: "botol"
    },
    {
      id: "p_pet_330",
      category: "Botol Plastik PET",
      label: "Botol Plastik 330 ml",
      spec: "330 ml",
      iconType: "bottle",
      pointsPerUnit: 30,
      unitLabel: "botol"
    },
    {
      id: "p_pet_600",
      category: "Botol Plastik PET",
      label: "Botol Plastik 600 ml",
      spec: "600 ml",
      iconType: "bottle",
      pointsPerUnit: 50,
      unitLabel: "botol"
    },
    {
      id: "p_pet_1500",
      category: "Botol Plastik PET",
      label: "Botol Plastik 1.500 ml",
      spec: "1.500 ml (1.5L)",
      iconType: "bottle-large",
      pointsPerUnit: 100,
      unitLabel: "botol"
    },

    // Kaleng Minuman
    {
      id: "p_can_250",
      category: "Kaleng Minuman",
      label: "Kaleng Minuman 250 ml",
      spec: "250 ml",
      iconType: "can",
      pointsPerUnit: 35,
      unitLabel: "kaleng"
    },
    {
      id: "p_can_330",
      category: "Kaleng Minuman",
      label: "Kaleng Minuman 330 ml",
      spec: "330 ml",
      iconType: "can",
      pointsPerUnit: 50,
      unitLabel: "kaleng"
    },
    {
      id: "p_can_500",
      category: "Kaleng Minuman",
      label: "Kaleng Minuman 500 ml",
      spec: "500 ml",
      iconType: "can",
      pointsPerUnit: 75,
      unitLabel: "kaleng"
    },

    // Tutup Botol Plastik
    {
      id: "p_cap",
      category: "Tutup Botol",
      label: "Tutup Botol Plastik",
      spec: "per piece",
      iconType: "cap",
      pointsPerUnit: 5,
      unitLabel: "pcs"
    },

    // Botol Kaca
    {
      id: "p_glass_300",
      category: "Botol Kaca",
      label: "Botol Kaca 300 ml",
      spec: "300 ml",
      iconType: "glass",
      pointsPerUnit: 40,
      unitLabel: "botol"
    },
    {
      id: "p_glass_500",
      category: "Botol Kaca",
      label: "Botol Kaca 500 ml",
      spec: "500 ml",
      iconType: "glass",
      pointsPerUnit: 65,
      unitLabel: "botol"
    },
    {
      id: "p_glass_1000",
      category: "Botol Kaca",
      label: "Botol Kaca 1.000 ml",
      spec: "1.000 ml (1L)",
      iconType: "glass-large",
      pointsPerUnit: 120,
      unitLabel: "botol"
    },

    // Kemasan Karton Minuman (Tetra Pak)
    {
      id: "p_tetra_125",
      category: "Kemasan Karton Minuman",
      label: "Karton Minuman 125 ml",
      spec: "125 ml",
      iconType: "carton",
      pointsPerUnit: 15,
      unitLabel: "kotak"
    },
    {
      id: "p_tetra_200",
      category: "Kemasan Karton Minuman",
      label: "Karton Minuman 200 ml",
      spec: "200 ml",
      iconType: "carton",
      pointsPerUnit: 25,
      unitLabel: "kotak"
    },
    {
      id: "p_tetra_250",
      category: "Kemasan Karton Minuman",
      label: "Karton Minuman 250 ml",
      spec: "250 ml",
      iconType: "carton",
      pointsPerUnit: 30,
      unitLabel: "kotak"
    },
    {
      id: "p_tetra_1000",
      category: "Kemasan Karton Minuman",
      label: "Karton Minuman 1.000 ml",
      spec: "1.000 ml (1L)",
      iconType: "carton-large",
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
      iconType: "plastic-kg"
    },
    {
      id: "kg_carton",
      label: "Kardus Paket Kiloan",
      desc: "Kardus kemasan paket & box cokelat tebal",
      rate: 45,
      iconType: "box-kg"
    },
    {
      id: "kg_paper",
      label: "Kertas & Arsip HVS Kiloan",
      desc: "Kertas bekas, majalah, dokumen tanpa staples",
      rate: 50,
      iconType: "paper-kg"
    },
    {
      id: "kg_metal",
      label: "Kaleng & Besi Kiloan",
      desc: "Aluminium, kaleng biskuit, rongsok logam",
      rate: 150,
      iconType: "metal-kg"
    },
    {
      id: "kg_glass",
      label: "Kaca & Beling Kiloan",
      desc: "Pecahan kaca atau botol campur utuh",
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
      qrBox: "Smart Drop Box Asrama",
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
      partner: "Kopi Kenangan",
      title: "Voucher Minuman Rp 15.000",
      description: "Diskon Rp 15rb untuk semua varian minuman kopi/non-kopi.",
      pointsCost: 500,
      tag: "Kuliner",
      stock: 45
    },
    {
      id: "REW-02",
      partner: "Sayurbox",
      title: "Diskon Belanja Rp 20.000",
      description: "Voucher belanja produk sayur & buah organik mitra RILO.",
      pointsCost: 750,
      tag: "Belanja",
      stock: 30
    },
    {
      id: "REW-03",
      partner: "RILO Merchandise",
      title: "RILO Eco Tote Bag",
      description: "Tas ramah lingkungan hasil olahan daur ulang serat tekstil.",
      pointsCost: 1500,
      tag: "Merchandise",
      stock: 12
    },
    {
      id: "REW-04",
      partner: "Yayasan Mangrove",
      title: "Donasi 1 Bibit Pohon Bakau",
      description: "Ditanam atas namamu di kawasan pesisir restorasi hijau.",
      pointsCost: 500,
      tag: "Donasi",
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
      pointsSpent: 500,
      code: "RILO-KOPI-7891",
      expiry: "30 Nov 2026",
      status: "Tersedia"
    }
  ],

  // Edukasi & Artikel Daur Ulang
  guides: [
    {
      id: "g1",
      tag: "PLASTIK",
      title: "Cara Menyiapkan Botol Plastik PET Sebelum Disetor",
      readTime: "2 mnt baca",
      content: "Botol PET transparan berlabel daur ulang kode 1 adalah material yang paling diminati industri daur ulang. Pastikan botol dikosongkan dari cairan manis, dibilas ringan, dan lepaskan tutupnya karena memiliki jenis plastik yang berbeda."
    },
    {
      id: "g2",
      tag: "LOGAM",
      title: "Nilai Daur Ulang Kaleng Aluminium Tanpa Batas",
      readTime: "3 mnt baca",
      content: "Aluminium dapat didaur ulang 100% tanpa penurunan kualitas fisik. Satu kaleng daur ulang mampu menghemat energi hingga 95% dibandingkan pengolahan bijih bauksit baru."
    },
    {
      id: "g3",
      tag: "KARTON",
      title: "Langkah Memipihkan Kemasan Karton Minuman",
      readTime: "2 mnt baca",
      content: "Kemasan karton tetra pak mengandung lapisan serat kertas murni dan aluminium tipis. Membuka lipatan samping dan memipihkannya akan menghemat volume ruang di smart drop box."
    }
  ]
};

// In-Memory App State
let AppState = JSON.parse(JSON.stringify(INITIAL_DATA));

function resetAppState() {
  AppState = JSON.parse(JSON.stringify(INITIAL_DATA));
}
