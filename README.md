# RILO Mobile Prototype — Bank Sampah Terintegrasi

Aplikasi web mobile prototype (SPA - Single Page Application) untuk demonstrasi inovasi bank sampah digital **RILO (Waste to Value)**. 

Didesain mengadopsi arsitektur visual **RuntahPedia v2** dengan palet warna signature RILO (*Deep Wine Burgundy `#761a38`* dan *Eco Emerald `#15803d`*). Seluruh emoji generik template AI telah digantikan oleh **Clean SVG Icons** modern, lengkap dengan peta interaktif (*Leaflet.js*) pencari titik Smart Drop Box.

---

## 📱 Arsitektur & Struktur Proyek

```text
rilo-prototype/
│
├── index.html          # Shell aplikasi web mobile (App Bar, Router Panel, Dock Navbar, Sheet Modal)
├── css/
│   └── style.css       # Design System RuntahPedia v2 (Pure mobile 100dvh, wine theme, cards, stepper)
├── js/
│   ├── icons.js        # Library Ikon Vektor SVG Clean (Anti-AI Slop)
│   ├── data.js         # Mock Database In-Memory & Titik Koordinat Smart Drop Box
│   └── app.js          # Router, Controller, Leaflet Map Integration, & Realtime State
└── README.md           # Dokumentasi & Panduan Deployment
```

---

## ✨ Fitur Unggulan Sesuai Referensi RuntahPedia

1. **Beranda (Home)**:
   - **Header Lokasi**: Menampilkan geolokasi nasabah (`📍 Margonda, Depok · Drop Point: 120m`).
   - **Kartu Poin**: Menampilkan saldo poin (`1.240 pts`) + estimasi konversi rupiah (`≈ Rp 12.400`), badge status nasabah, serta tombol aksi **Tukar Hadiah** dan **Voucher Saya** (tanpa tombol setor sampah di kartu ini).
   - **Peta Interaktif Drop Box**: Peta OpenStreetMap (Leaflet.js) yang disematkan langsung di beranda untuk mengecek titik Smart Drop Box terdekat di Depok/Kampus dengan marker pin RILO berdenyut dan tombol *"Scan & Buka"*.
   - **Grid 4 Layanan Utama**: *Scan & Setor*, *Cari Drop Box (Peta Penuh)*, *Tukar Hadiah*, dan *Dampak Hijau*.
   - **Banner Kampanye**: Kartu tantangan kampus pilah botol berhadiah voucher.
   - **Aktivitas Terakhir**: 3 transaksi setoran terbaru.

2. **Alur Scan QR Terlebih Dahulu Sebelum Input**:
   - Membuka menu *Setor* akan membawa pengguna ke **Layar Scanner QR**.
   - Tampilan viewfinder kamera realistis dengan animasi laser scan beam merah/wine, deteksi Smart Drop Box terdekat, dan tombol konfirmasi *"Hubungkan Drop Box & Buka Pintu"*.

3. **Input Setoran Sampah (2 Kategori Spesifik)**:
   - **Satuan per Ukuran (Per Piece)**:
     - Botol Plastik PET (250 ml, 330 ml, 600 ml, 1.500 ml)
     - Kaleng Minuman (250 ml, 330 ml, 500 ml)
     - Tutup Botol Plastik (pcs)
     - Botol Kaca (300 ml, 500 ml, 1.000 ml)
     - Kemasan Karton Minuman Tetra Pak (125 ml, 200 ml, 250 ml, 1.000 ml)
     - Dilengkapi stepper counter tactile `[−]` `[qty]` `[+]` dan ikon SVG kemasan bersih.
   - **Timbangan Kiloan (Per Kg)**:
     - Plastik Campuran, Kardus Paket, Kertas HVS, Kaleng & Besi, Kaca & Beling.
   - **Sticky Bottom Checkout Bar**: Kalkulasi total poin realtime dan tombol *"Konfirmasi & Setor"*.

4. **Katalog Voucher & Voucher Saya (Poin Berkurang Pasti)**:
   - Desain kupon modern dengan brand partner (*Kopi Kenangan, Sayurbox, dll.*).
   - Saat ditukar: Saldo poin langsung berkurang seketika dan kupon masuk ke tab **Voucher Saya** lengkap dengan kode kupon unik dan tanggal kedaluwarsa.

5. **Peta Penuh Titik Drop Box (`map-full`)**:
   - Navigasi peta menyeluruh untuk melihat semua titik Smart Drop Box dan Mitra Hub RILO.

---

## 🌐 Cara Menjalankan & Hosting di GitHub Pages

1. **Jalankan Secara Lokal**: Cukup buka file `index.html` di browser Anda.
2. **Hosting Gratis di GitHub Pages**:
   - Push seluruh file di dalam folder `rilo-prototype` ke repository GitHub Anda.
   - Buka **Settings** → **Pages** pada repository.
   - Di bagian *Build and deployment*, pilih branch `main` dan folder `/(root)`, lalu klik **Save**.
   - Akses URL yang diberikan di smartphone Anda.
