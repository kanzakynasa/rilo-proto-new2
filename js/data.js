/**
 * RILO Mobile Prototype - Data Layer & Mock Database
 * Struktur data disesuaikan dengan skema tabel database (MySQL / phpMyAdmin)
 * untuk mempermudah integrasi backend di masa mendatang.
 */

const INITIAL_DATA = {
  // Profil pengguna yang sedang login
  user: {
    id: 1,
    name: "Kaila Zanita",
    email: "kaila.zanita@example.com",
    phone: "0812-3456-7890",
    address: "Jl. Margonda Raya No. 12, Depok, Jawa Barat",
    points: 1240,
    totalWeight: 18.4,
    completedDeposits: 42,
    avatar: "K",
    tier: "RILO Eco Hero",
    joinedDate: "September 2026"
  },

  // Tabel Master Material Sampah
  materials: [
    {
      code: "PET",
      name: "Botol Plastik (PET)",
      rate: 100,
      unit: "kg",
      icon: "🧴",
      category: "Plastik",
      description: "Botol air mineral, botol minuman soda bening atau berwarna transparan.",
      tips: "Kosongkan sisa cairan, bilas bersih, dan remas untuk menghemat ruang."
    },
    {
      code: "HDPE",
      name: "Plastik Tebal (HDPE/PP)",
      rate: 60,
      unit: "kg",
      icon: "🧴",
      category: "Plastik",
      description: "Botol sampo, deterjen cair, wadah skincare tebal, tutup galon.",
      tips: "Pastikan cairan kimia/sabun sudah terbilas dan kering."
    },
    {
      code: "PAPER",
      name: "Kertas & Dokumen",
      rate: 50,
      unit: "kg",
      icon: "📄",
      category: "Kertas",
      description: "Kertas HVS, buku tulis bekas, majalah, kertas struk non-thermal.",
      tips: "Jaga agar tidak terkena air, minyak, atau noda makanan."
    },
    {
      code: "CARTON",
      name: "Kardus & Karton",
      rate: 45,
      unit: "kg",
      icon: "📦",
      category: "Kertas",
      description: "Kardus cokelat bekas paket, packaging box tebal bergelombang.",
      tips: "Lepaskan selotip lakban plastik sebisa mungkin dan lipat pipih."
    },
    {
      code: "CAN",
      name: "Kaleng & Logam",
      rate: 150,
      unit: "kg",
      icon: "🥫",
      category: "Logam",
      description: "Kaleng soda aluminium, kaleng biskuit, kaleng susu kental manis.",
      tips: "Cuci sisa isi agar tidak mengundang semut. Hati-hati bagian pinggir yang tajam."
    },
    {
      code: "GLASS",
      name: "Kaca & Botol Beling",
      rate: 30,
      unit: "kg",
      icon: "🫙",
      category: "Kaca",
      description: "Botol kecap, sirup, toples kaca utuh.",
      tips: "Kemas dengan aman agar tidak pecah selama pengangkutan."
    }
  ],

  // Tabel Transaksi Setoran
  deposits: [
    {
      id: "DEP-20261018-01",
      date: "2026-10-18",
      materialCode: "PET",
      materialName: "Botol Plastik (PET)",
      weight: 1.8,
      method: "Drop-off",
      location: "RILO Point Kampus",
      pointsEarned: 180,
      status: "Selesai",
      notes: "Botol plastik bersih sudah dipilah"
    },
    {
      id: "DEP-20261015-02",
      date: "2026-10-15",
      materialCode: "PAPER",
      materialName: "Kertas & Dokumen",
      weight: 2.4,
      method: "Drop-off",
      location: "RILO Hub Margonda",
      pointsEarned: 120,
      status: "Selesai",
      notes: "Kertas arsip tugas kuliah"
    },
    {
      id: "DEP-20261011-03",
      date: "2026-10-11",
      materialCode: "CARTON",
      materialName: "Kardus & Karton",
      weight: 1.2,
      method: "Pickup",
      location: "Jl. Margonda Raya No. 12",
      pointsEarned: 54,
      status: "Selesai",
      notes: "Kardus paket online shop"
    },
    {
      id: "DEP-20261008-04",
      date: "2026-10-08",
      materialCode: "CAN",
      materialName: "Kaleng & Logam",
      weight: 0.7,
      method: "Drop-off",
      location: "RILO Point Kampus",
      pointsEarned: 105,
      status: "Selesai",
      notes: "Kaleng minuman ringan"
    }
  ],

  // Tabel Katalog Reward
  rewards: [
    {
      id: "REW-01",
      title: "Voucher Minuman Rp 15.000",
      description: "Berlaku di Kopi Kenangan & Fore mitra RILO kampus.",
      pointsCost: 500,
      icon: "☕",
      category: "Voucher F&B",
      stock: 45
    },
    {
      id: "REW-02",
      title: "Diskon Ongkir Pickup 100%",
      description: "Gratis biaya penjemputan sampah langsung ke rumah.",
      pointsCost: 750,
      icon: "🚚",
      category: "Layanan",
      stock: 100
    },
    {
      id: "REW-03",
      title: "RILO Eco Tote Bag",
      description: "Tas kain ramah lingkungan hasil daur ulang serat tekstil.",
      pointsCost: 1500,
      icon: "👜",
      category: "Merchandise",
      stock: 12
    },
    {
      id: "REW-04",
      title: "Donasi 1 Bibit Pohon Bakau",
      description: "Ditanam bersama Komunitas Mangrove Pesisir.",
      pointsCost: 500,
      icon: "🌱",
      category: "Donasi Lingkungan",
      stock: 999
    },
    {
      id: "REW-05",
      title: "Voucher Saldo e-Wallet Rp 25.000",
      description: "Dapat ditukarkan ke saldo Gopay, OVO, atau ShopeePay.",
      pointsCost: 2000,
      icon: "💳",
      category: "e-Money",
      stock: 20
    }
  ],

  // Riwayat Penukaran Reward
  redemptions: [
    {
      id: "RDM-20260920-01",
      date: "2026-09-20",
      rewardTitle: "Voucher Minuman Rp 15.000",
      pointsSpent: 500,
      code: "RILO-KOPI-7891",
      status: "Sudah Digunakan"
    }
  ],

  // Data Tantangan Komunitas
  community: {
    monthlyTargetKg: 1000,
    currentKg: 720,
    activeChallenge: "Tantangan Pilah Bareng Kampus Hijau",
    joinedChallenge: true,
    leaderboard: [
      { rank: "01", name: "Komunitas Kampus A", weight: 240, status: "Aktif", badge: "🥇" },
      { rank: "02", name: "Bank Sampah RW 05", weight: 190, status: "Aktif", badge: "🥈" },
      { rank: "03", name: "Green Youth Club", weight: 165, status: "Berlangsung", badge: "🥉" },
      { rank: "04", name: "Komunitas Penggiat Depok", weight: 125, status: "Aktif", badge: "4" }
    ]
  },

  // Materi Edukasi RILO Learn
  guides: [
    {
      id: "g1",
      title: "Botol Plastik PET",
      icon: "🧴",
      short: "Kosongkan isi, bilas ringan, dan lepaskan label jika memungkinkan.",
      content: "Botol berbahan Polyethylene Terephthalate (PET) berlogo daur ulang angka 1 paling diminati industri daur ulang. Pastikan botol bebas dari sisa cairan manis dan minyak. Mengempeskan botol membantu mengoptimalkan ruang tampung bank sampah."
    },
    {
      id: "g2",
      title: "Kertas & Kardus Bekas",
      icon: "📦",
      short: "Pisahkan kardus dari plastik perekat dan simpan dalam kondisi kering.",
      content: "Kertas yang basah atau tercampur minyak makanan (seperti kotak pizza berlemak) tidak bisa didaur ulang dengan baik. Lipat kardus hingga pipih untuk mempermudah penimbangan dan pengangkutan."
    },
    {
      id: "g3",
      title: "Kaleng & Aluminium",
      icon: "🥫",
      short: "Bilas bersih kaleng bekas makanan atau minuman agar tidak membusuk.",
      content: "Aluminium dan logam memiliki nilai daur ulang sangat tinggi dan dapat didaur ulang tanpa henti. Cukup bersihkan sisa saus/minuman dan keringkan sebelum disetor."
    },
    {
      id: "g4",
      title: "Kaca & Botol Beling",
      icon: "🫙",
      short: "Kemas dengan hati-hati. Hindari mencampur kaca pecah dengan kaca utuh.",
      content: "Kaca adalah material 100% dapat didaur ulang berulang kali. Pastikan botol tidak pecah dan dikemas dalam wadah yang aman agar tidak melukai petugas bank sampah."
    },
    {
      id: "g5",
      title: "Prinsip Bersih & Kering",
      icon: "🧼",
      short: "Standar utama penerimaan sampah daur ulang bernilai tinggi.",
      content: "Sampah daur ulang bukan sampah kotor. Membersihkan secukupnya mencegah timbulnya aroma tak sedap, belatung, serta kontaminasi pada tumpukan sampah lain di gudang penyimpanan."
    },
    {
      id: "g6",
      title: "Alur Perjalanan Sampah",
      icon: "🔄",
      short: "Dari tanganmu, ditimbang, dicatat, hingga diproses oleh mitra industri.",
      content: "Setiap gram sampah yang kamu setorkan akan melewati proses sortasi manual di RILO Hub, dipadatkan dengan mesin pres (baling), lalu dikirim ke pabrik peleburan mitra untuk diolah kembali menjadi produk baru."
    }
  ]
};

// Objek penampung state aktif runtime aplikasi
let AppState = JSON.parse(JSON.stringify(INITIAL_DATA));

// Helper untuk reset state kembali ke awal (karena data in-memory)
function resetAppState() {
  AppState = JSON.parse(JSON.stringify(INITIAL_DATA));
}
