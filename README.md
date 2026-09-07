# 🧾 Kwitansi Generator & Precision Print Engine (250 × 100 mm)

[![Docker](https://img.shields.io/badge/Docker-Containerized-blue?logo=docker)](https://www.docker.com/)
[![Nginx](https://img.shields.io/badge/Web_Server-Nginx_Alpine-green?logo=nginx)](https://nginx.org/)
[![Target Host](https://img.shields.io/badge/Target_Host-aulvan--server-orange)](https://aulvan.com)
[![Domain](https://img.shields.io/badge/Domain-kwitansi.aulvan.com-emerald)](https://kwitansi.aulvan.com)
[![License](https://img.shields.io/badge/License-MIT-lightgrey)](LICENSE)

Aplikasi web modern, super ringan, dan berpresisi fisik tinggi (*pixel-perfect physical print engine*) yang dirancang khusus untuk menghasilkan cetakan data transaksi kwitansi langsung di atas lembaran fisik **blangko kwitansi standar toko ATK Indonesia** (Paperline, Sinar Dunia / SiDU 40 M, Kiky, dsb.) atau dicetak pada kertas HVS putih polos berukuran **250 mm × 100 mm**.

---

## 📌 Latar Belakang & Solusi Masalah

Mencetak data kwitansi menggunakan template dokumen biasa (Word / Excel / PDF biasa) sering kali menimbulkan masalah:
1. **Deviasi Margin Browser**: Jendela print browser sering menambahkan margin default (0.5 inci / 12 mm) sehingga posisi teks meleset jauh dari garis fisik kertas toko ATK.
2. **Ketiadaan Mode Khusus Blangko**: Mencetak dokumen utuh di atas kertas blangko menyebabkan tulisan bawaan pabrik (judul "KWITANSI", nomor, garis) tercetak dobel / berbayang (*ghosting*).
3. **Toleransi Mekanis Printer**: Penjepit tray kertas pada printer (terutama tray belakang Epson LQ/LX series atau Inkjet L-series) sering kali memiliki pergeseran 1–2 mm.

**Solusi yang Diterapkan Pada Aplikasi Ini:**
- **CSS `@page` Berpresisi Fisik**: Mengunci ukuran kertas pada `250mm 100mm landscape` dengan margin `0`.
- **Dual Mode Printing**:
  - **Mode Blangko Toko**: Menyembunyikan seluruh bingkai, garis, dan label bawaan pabrik, hanya mencetak teks isian murni untuk menimpa kertas blangko fisik.
  - **Mode Kertas Polos**: Mencetak kwitansi lengkap beserta ornamen bingkai klasik guilloche biru jika dicetak pada lembaran HVS putih polos.
- **Micro-Calibration Engine**: Pengaturan *Offset X* dan *Offset Y* dalam satuan milimeter yang tersimpan di `localStorage` browser.

---

## 📐 Spesifikasi Lembar Fisik & Koordinat Presisi

- **Dimensi Kertas Fisik**: **Lebar 250 mm × Tinggi 100 mm** (*Landscape*)
- **Rasio Pembagian Kertas**:
  - **Lembar Bonggol Kiri (Arsip / Stub)**: `0 mm – 43 mm`
  - **Garis Perforasi (Sobekan)**: `42.5 mm – 43 mm`
  - **Kwitansi Utama**: `44 mm – 250 mm`

### Tabel Pemetaan Koordinat Elemen Fisik (Standar SiDU / Paperline 40 M)

| Elemen Isian | Koordinat Fisik ($X$ / $Y$) | Ukuran / Karakteristik | Keterangan |
| :--- | :---: | :---: | :--- |
| **No. Kwitansi** | $X = 65\text{ mm}$, $Y = 10.2\text{ mm}$ | Lebar: `37 mm`, Font: `10 pt` Bold | Mengisi garis setelah label *"No."* |
| **Telah Terima Dari** | $X = 100\text{ mm}$, $Y = 18.8\text{ mm}$ | Lebar: `140 mm`, Font: `10.5 pt` Bold | Teks nama/instansi pembayar di atas garis |
| **Uang Sejumlah (Terbilang)** | $X = 96\text{ mm}$, $Y = 28.2\text{ mm}$ | Lebar: `144 mm`, Font: `9.5 pt` Italic Bold | Mengisi kolom arsir pengaman (*security hatch*) |
| **Untuk Pembayaran (Baris 1)** | $X = 99\text{ mm}$, $Y = 39.2\text{ mm}$ | Lebar: `141 mm`, Font: `9.5 pt` | Baris pertama setelah label *"Untuk pembayaran"* |
| **Untuk Pembayaran (Baris 2)** | $X = 54\text{ mm}$, $Y = 46.8\text{ mm}$ | Lebar: `186 mm`, Font: `9.5 pt` | Sambungan baris kedua (lebar penuh) |
| **Untuk Pembayaran (Baris 3)** | $X = 54\text{ mm}$, $Y = 54.0\text{ mm}$ | Lebar: `186 mm`, Font: `9.5 pt` | Sambungan baris ketiga (lebar penuh) |
| **Tempat & Tanggal** | $X = 160\text{ mm}$, $Y = 61.2\text{ mm}$ | Lebar: `80 mm`, Font: `9.5 pt` Center | Garis tanggal di kanan bawah |
| **Kotak Nominal Angka (Rp)** | $X = 72.5\text{ mm}$, $Y = 78.6\text{ mm}$ | Lebar: `50 mm`, Font: `12.5 pt` Bold Monospace | Terletak di tengah kotak arsir jajaran genjang |
| **Kotak Materai 10.000** | $X = 200\text{ mm}$ *(Center)*, $Y = 68.0\text{ mm}$ | Ukuran: `26 mm × 14 mm` | Tepat di atas nama Supriyatna (Simetris) |
| **Tanda Tangan & Penerima** | $X = 200\text{ mm}$ *(Center)*, $Y = 84.5\text{ mm}$ | Lebar: `80 mm`, Font: `10.5 pt` Bold Center | Nama penerima `( SUPRIYATNA )` |
| **Bonggol Kiri (Arsip)** | $X = 21.5\text{ mm}$ *(Center)* | Font: `7.5 pt` - `8 pt` Center | Data arsip toko di dalam bingkai vertikal |

---

## ✨ Fitur-Fitur Unggulan

1. **Konverter Terbilang Otomatis Bahasa Indonesia (`terbilang.js`)**:
   - Dibuat menggunakan JavaScript murni berbasis `BigInt` (bebas dependensi eksternal).
   - Mampu mengonversi nominal dari puluhan ribu hingga ratusan triliun rupiah secara akurat.
   - Otomatis dibungkus pagar format akuntansi resmi perbankan: `# Seratus Juta Rupiah #`.
   - Format nominal angka otomatis menambahkan titik ribuan (`100.000.000`) dan akhiran `,-`.

2. **Overlay Foto Blangko Asli & Slider Transparansi**:
   - Menampilkan foto hasil scan blangko fisik asli langsung di canvas live preview.
   - Slider kepekatan (*opacity 10% – 100%*) memudahkan Anda melihat posisi teks menimpa persis di atas garis sebelum dicetak ke kertas sungguhan.

3. **Smart Word-Wrapping 3 Baris**:
   - Keterangan transaksi pada kolom *"Untuk Pembayaran"* otomatis dibagi secara cerdas ke Baris 1, Baris 2, dan Baris 3 tanpa memotong suku kata.
   - Mendukung input enter manual dari pengguna.

4. **Deteksi Materai Otomatis**:
   - Sesuai regulasi UU Bea Materai Indonesia, transaksi $\ge \text{Rp } 5.000.000$ otomatis memunculkan slot Materai Rp 10.000 di atas tanda tangan penerima.

5. **Panel Kalibrasi Printer (Epson / Inkjet Rear Tray)**:
   - Slider **Offset X (± mm)** dan **Offset Y (± mm)** untuk kompensasi toleransi mekanis printer.
   - Pilihan ukuran huruf (*Font Size pt*) dan tipe font (*Courier Mesin Ketik*, *Times New Roman*, *Modern Sans*).
   - Tombol **"Simpan ke Browser"** menyimpan konfigurasi ke `localStorage` sehingga tidak perlu diatur ulang setiap kali membuka web.

6. **Shortcut Keyboard**:
   - Tekan `Ctrl + P` (Windows/Linux) atau `Cmd + P` (macOS) untuk langsung membuka dialog cetak.

---

## 🖨️ Panduan Setelan Jendela Cetak Browser (Print Setup)

Agar hasil cetak pas tepat di atas garis blangko fisik, lakukan konfigurasi ini pada dialog cetak (*Print Dialog*):

| Opsi Pengaturan | Nilai / Pilihan yang Wajib Disetel | Keterangan |
| :--- | :--- | :--- |
| **Printer Destination** | Pilih Printer Fisik Anda (atau *Save as PDF*) | Rekomendasi: Printer tray belakang |
| **Paper Size** | **Custom: 250 mm × 100 mm** *(Landscape)* | Buat ukuran kertas baru di driver printer jika belum ada |
| **Margins** | **None** atau **0 mm** | **Wajib 0** agar tidak bergeser |
| **Scale** | **100%** (*Actual Size*) | Jangan pilih *Fit to Page* / *Fit to Printable Area* |
| **Headers & Footers** | **Hapus Centang (Uncheck)** | Mencegah tanggal/URL browser tercetak di tepi |
| **Background Graphics** | Centang jika mode Kertas Polos | Pada mode Blangko Toko background otomatis disembunyikan |

---

## 💻 Menjalankan Secara Lokal (Development)

Aplikasi ini dibuat menggunakan arsitektur *Zero-Build* (Vanilla HTML5, CSS3, & Modern JS) sehingga dapat dijalankan seketika tanpa perlu `npm install`:

```bash
# Clone repositori
git clone -b dev https://github.com/aulvan-90/kwitansi-print-engine.git
cd kwitansi-print-engine

# Jalankan server lokal sederhana (pilih salah satu):
python3 -m http.server 8089
# atau jika menggunakan PHP:
php -S 127.0.0.1:8089
# atau menggunakan npx serve:
npx serve -l 8089 .
```
Buka browser di: **`http://127.0.0.1:8089`**

---

## 🚀 Panduan Deployment Produksi ke `aulvan-server`

- **Target Domain**: `kwitansi.aulvan.com`
- **Target Server**: `aulvan-server`
- **Port Mapping**: `3025:80`

### Langkah 1: Jalankan Service via Docker Compose

Pastikan Docker & Docker Compose sudah terpasang di `aulvan-server`:

```bash
cd /opt/apps/kwitansi-print-engine
docker compose up -d --build
```

Periksa apakah container berjalan dengan baik:
```bash
docker ps -f name=kwitansi-print-engine
curl -I http://127.0.0.1:3025/healthz
# Output yang diharapkan: HTTP/1.1 200 OK
```

### Langkah 2: Pasang Konfigurasi Reverse Proxy Nginx pada Host

Salin file `nginx.conf` bawaan proyek ke konfigurasi Nginx host:

```bash
# Untuk Ubuntu / Debian:
sudo cp nginx.conf /etc/nginx/sites-available/kwitansi.aulvan.com.conf
sudo ln -s /etc/nginx/sites-available/kwitansi.aulvan.com.conf /etc/nginx/sites-enabled/

# Uji sintaks & reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Langkah 3: Pasang Sertifikat SSL Gratis (Let's Encrypt Certbot)

Jalankan Certbot untuk mengamankan domain dengan protokol HTTPS:

```bash
sudo certbot --nginx -d kwitansi.aulvan.com
```

Pilih opsi *Redirect* agar seluruh trafik HTTP otomatis dialihkan ke HTTPS. Sekarang aplikasi dapat diakses di **`https://kwitansi.aulvan.com`**.

---

## 📂 Struktur File Repositori

```text
kwitansi-print-engine/
├── css/
│   ├── print.css          # Engine CSS Print fisik 250x100mm & koordinat absolut
│   └── style.css          # Antarmuka web modern Slate & Emerald Dark Mode
├── js/
│   ├── app.js             # Controller sinkronisasi, terbilang, dan kalibrasi printer
│   └── terbilang.js       # Algoritma BigInt konversi nominal angka ke kata terbilang
├── img/
│   └── blanko-original.jpg# Foto scan blangko asli untuk template presisi & overlay
├── Dockerfile             # Multi-stage lightweight Nginx Alpine production image
├── docker-compose.yml     # Konfigurasi container service port 3025:80
├── nginx-container.conf   # Konfigurasi internal Nginx (Gzip, caching, security headers)
├── nginx.conf             # Konfigurasi Reverse Proxy Nginx host kwitansi.aulvan.com
├── index.html             # UI utama aplikasi & live canvas 250x100mm
└── README.md              # Dokumentasi lengkap proyek
```

---

## 👤 Pengembang & Hak Cipta

- **Creative**: Agung
- **Pengembang**: Aulvan Server Team
- **Email**: `aulvan90@gmail.com`
- **Domain**: [kwitansi.aulvan.com](https://kwitansi.aulvan.com)
