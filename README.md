<<<<<<< HEAD
# RILO — Web Mobile Prototype Bank Sampah Terintegrasi

Aplikasi web mobile prototype (SPA - Single Page Application) untuk demonstrasi inovasi bank sampah digital **RILO (Waste, returned with value)**. 

Didesain khusus dengan pendekatan **Mobile-First UX** yang menyerupai aplikasi Android / iOS asli dengan *Bottom Navigation Bar*, *Bottom Sheet Modals*, *Floating Action Button (Setor)*, dan *Interactive State Management*.

---

## 📱 Arsitektur & Struktur File
Proyek ini dibangun modular tanpa framework (Zero Dependency, Pure Vanilla HTML5, CSS3, & Modern JS ES6) sehingga sangat ringan, cepat dibuka di smartphone, dan siap dihubungkan ke backend REST API (PHP & MySQL / phpMyAdmin).

```text
rilo-prototype/
│
├── index.html          # Shell aplikasi web mobile utama & container layout
├── css/
│   └── style.css       # Design system mobile, bottom bar, bottom sheet, & tema wine RILO
├── js/
│   ├── data.js         # Mock database in-memory (skema tabel: users, materials, deposits, rewards)
│   └── app.js          # Controller, router tampilan, kalkulator poin live, & interaksi
└── README.md           # Dokumentasi & panduan deployment
```

---

## 🚀 Fitur Unggulan Web Mobile
1. **Beranda (Home)**:
   - Dompet digital RILO Points dengan gradien elegan.
   - Ringkasan total sampah disetor (kg), total transaksi, dan progres target bulanan.
   - Menu aksi cepat (*Quick Actions*) dan daftar 3 transaksi terakhir.
2. **Form Setor Sampah Interaktif (FAB Setor)**:
   - Visual chip selector untuk 6 jenis material sampah (Plastik PET, HDPE, Kertas, Kardus, Kaleng/Logam, Kaca).
   - Live Point Calculator (kalkulasi poin otomatis secara realtime saat berat/material diubah).
   - Pilihan metode: **Drop-off** (antar mandiri ke RILO Point) atau **Pickup** (jemput driver).
   - Notifikasi sukses mengambang (Toast Notification).
3. **Riwayat Transaksi (History)**:
   - Filter status dinamis (*Semua*, *Selesai*, *Menunggu*).
   - Klik kartu transaksi untuk membuka **Bottom Sheet Struk/Invoice Rincian Setoran**.
4. **Katalog Reward & Voucher**:
   - Menampilkan saldo poin aktif.
   - Penukaran reward (voucher kopi/F&B, ongkir penjemputan, merchandise tote bag, donasi bibit pohon).
   - Dialog konfirmasi penukaran poin + *generator voucher code* simulasi.
5. **Dampak Lingkungan (Eco Impact)**:
   - Visualisasi kg sampah terkelola, estimasi emisi $CO_2$ yang dicegah, dan ekuivalen pohon tertanam.
   - Grafik persentase komposisi jenis sampah yang telah disetor.
6. **RILO Learn**:
   - Panduan memilah sampah yang benar untuk edukasi nasabah bank sampah.
7. **Tantangan Komunitas & Leaderboard**:
   - Papan peringkat antar komunitas dan progres pengumpulan sampah bersama.
8. **Pengaturan Akun & Profil**:
   - Form ganti nama pengguna, email, dan alamat penjemputan.
   - Tombol **Reset Data Demo** untuk mengembalikan state awal kapan saja.

---

## 🌐 Cara Hosting Gratis di GitHub Pages

Karena proyek ini bersifat client-side static web:
1. Pastikan seluruh folder `rilo-prototype` (termasuk folder `css/` dan `js/`) di-push ke repository GitHub Anda:
   ```bash
   git add .
   git commit -m "Update RILO Web Mobile Prototype"
   git push origin main
   ```
2. Buka repository Anda di browser GitHub.
3. Masuk ke tab **Settings** → menu **Pages** (di sidebar kiri).
4. Di bagian **Build and deployment**:
   - **Source**: Pilih *Deploy from a branch*.
   - **Branch**: Pilih *main* (atau *master*) dan folder */(root)*.
   - Klik **Save**.
5. Tunggu sekitar 1–2 menit, GitHub Pages akan memberikan link publik (misalnya: `https://username.github.io/rilo-prototype/`).
6. Buka link tersebut di smartphone Anda. Anda juga bisa memilih *"Add to Home Screen"* di browser Chrome/Safari smartphone untuk pengalaman seperti aplikasi native!

---

## 🗄️ Persiapan Integrasi ke PHP & phpMyAdmin (Tahap Lanjutan)
Struktur di `js/data.js` telah dimodelkan sesuai entitas database relasional:
- Tabel `users` $\rightarrow$ kolom `id`, `name`, `email`, `address`, `points`, `total_weight`
- Tabel `materials` $\rightarrow$ kolom `code`, `name`, `rate_points`, `unit`
- Tabel `deposits` $\rightarrow$ kolom `id`, `user_id`, `material_code`, `weight`, `method`, `points_earned`, `status`
- Tabel `rewards` $\rightarrow$ kolom `id`, `title`, `points_cost`, `icon`

Saat backend PHP sudah siap, logic di `js/app.js` cukup digantikan dengan `fetch('/api/deposit.php')` atau AJAX endpoint.
=======
# rilo-proto-new2
>>>>>>> 8d56aed5ca437cbda1aa350919a2f1c6123bc86f
