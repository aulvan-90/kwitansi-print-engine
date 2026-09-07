# 🧾 Kwitansi Generator & Precision Print Engine (250 × 100 mm)

Aplikasi web presisi tinggi untuk menghasilkan cetakan kwitansi standar toko ATK Indonesia (Paperline, Sinar Dunia, Kiky, dll.) langsung di atas lembaran fisik blangko kwitansi atau kertas putih polos.

- **Domain Target**: `kwitansi.aulvan.com`
- **Target Host**: `aulvan-server`
- **Dimensi Kertas Fisik**: **250 mm × 100 mm (Landscape)**
- **Port Internal Container**: `80`
- **Port Host Server**: `3025`

---

## 🌟 Fitur Utama

1. **Precision CSS Print Engine (@media print)**:
   - `@page { size: 250mm 100mm landscape; margin: 0; }`
   - Pemetaan koordinat teks isian menggunakan satuan milimeter (`mm`) dan `pt` yang presisi di atas garis isian blangko.
   - Margin & padding browser di-reset menjadi `0` untuk menghindari deviasi posisi printer.

2. **Dual Print Mode (Mode Cetak Ganda)**:
   - **Mode 1: "Cetak ke Blangko Toko" (Default)**:
     Menyembunyikan border, label paten, watermark, dan motif kwitansi. Hanya mencetak teks isian (Nomor, Nama, Terbilang, Nominal, Tanggal, dan Tanda Tangan) agar pas menimpa kertas blangko fisik toko ATK.
   - **Mode 2: "Cetak ke Kertas Putih Polos"**:
     Mencetak kwitansi lengkap beserta ornamen bingkai guilloche klasik, perforasi pemisah, label resmi, kotak nominal, dan kolom tanda tangan untuk kertas HVS polos berukuran 250 × 100 mm.

3. **Terbilang Otomatis (Pure JavaScript)**:
   - Algoritma terbilang bahasa Indonesia standar akuntansi & perbankan menggunakan `BigInt` (mendukung nominal hingga ratusan triliun).
   - Format standar kwitansi dengan penutup pagar: `# Seratus Juta Rupiah #`.
   - Sinkronisasi instan saat mengetik nominal angka (dengan format otomatis pemisah ribuan titik).

4. **Kalibrasi Posisi Printer (Epson / Canon / HP / Rear Tray)**:
   - Slider penyesuaian **Offset X (± mm)** dan **Offset Y (± mm)** untuk mengatasi toleransi mekanis roller printer.
   - Penyesuaian ukuran huruf (**Font Size pt**) dan pemilihan tipe font (Courier Mesin Ketik, Times New Roman, atau Modern Sans).
   - **Penyimpanan Otomatis**: Setelan kalibrasi tersimpan di `localStorage` browser.

5. **Fitur Tambahan**:
   - Kolom Saksi / Mengetahui (opsi toggle tampilkan/sembunyikan).
   - Toggle Cetak Lembar Bonggol / Stub (Arsip kiri 0–64 mm).
   - Deteksi Materai Otomatis: Menampilkan slot Materai Rp 10.000 untuk transaksi ≥ Rp 5.000.000 (pada mode cetak kertas polos).
   - Shortcut keyboard: `Ctrl + P` / `Cmd + P` langsung memicu dialog cetak.

---

## 📁 Struktur Direktori

```text
kwitansi-print-engine/
├── css/
│   ├── print.css          # Engine CSS Print presisi 250x100mm & koordinat absolut mm
│   └── style.css          # Antarmuka web modern responsif (Dark Mode Emerald)
├── js/
│   ├── app.js             # Controller interaksi form, kalibrasi, zoom & sync
│   └── terbilang.js       # Engine konversi angka nominal ke kalimat terbilang Indonesia
├── Dockerfile             # Multi-stage lightweight Nginx Alpine production image
├── docker-compose.yml     # Konfigurasi container service port 3025:80
├── nginx-container.conf   # Konfigurasi internal Nginx (Gzip, caching, security headers)
├── nginx.conf             # Konfigurasi Reverse Proxy host aulvan-server (kwitansi.aulvan.com)
├── index.html             # Tampilan aplikasi & live preview canvas 250x100mm
└── README.md              # Dokumentasi & panduan deployment
```

---

## 🚀 Panduan Deployment ke `aulvan-server`

### 1. Jalankan Container Menggunakan Docker Compose

Salin direktori proyek ke `aulvan-server` (misalnya di `/opt/apps/kwitansi-print-engine` atau `~/kwitansi-print-engine`), lalu jalankan:

```bash
cd /opt/apps/kwitansi-print-engine
docker compose up -d --build
```

Periksa status container:
```bash
docker ps -f name=kwitansi-print-engine
curl -I http://127.0.0.1:3025/healthz
```

### 2. Pasang Konfigurasi Reverse Proxy Nginx pada Host `aulvan-server`

Salin file `nginx.conf` ke direktori Nginx host:

```bash
# Untuk Ubuntu / Debian:
sudo cp nginx.conf /etc/nginx/sites-available/kwitansi.aulvan.com.conf
sudo ln -s /etc/nginx/sites-available/kwitansi.aulvan.com.conf /etc/nginx/sites-enabled/

# Atau untuk CentOS / Alpine host (conf.d):
sudo cp nginx.conf /etc/nginx/conf.d/kwitansi.aulvan.com.conf
```

Uji sintaks Nginx dan lakukan reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Pasang Sertifikat SSL Gratis (Let's Encrypt Certbot)

Jalankan perintah Certbot berikut pada host:
```bash
sudo certbot --nginx -d kwitansi.aulvan.com
```

Pilih opsi untuk otomatis mengalihkan (redirect) seluruh trafik HTTP ke HTTPS.

---

## 🖨️ Panduan Pengaturan Printer (Print Dialog Setup)

Agar hasil cetakan pas tepat di atas garis blangko fisik:

1. **Ukuran Kertas (Paper Size)**:
   - Buat ukuran kertas khusus (Custom Paper Size / User Defined):
     - **Lebar**: `250 mm` (25 cm)
     - **Tinggi**: `100 mm` (10 cm)
     - **Orientasi**: Landscape
2. **Margin**:
   - Pilih **"None"** atau **"Minimum"** (0 mm).
3. **Skala (Scale)**:
   - Pastikan disetel ke **100%** (Jangan pilih *Fit to printable area* / *Fit to page*).
4. **Header & Footer**:
   - **Hapus centang** opsi "Headers and Footers" di dialog print browser.
5. **Background Graphics**:
   - **Centang** jika menggunakan "Mode Kertas Putih Polos".
   - Jika menggunakan "Mode Blangko Toko", background otomatis disembunyikan oleh sistem.
6. **Kalibrasi Tray Printer**:
   - Jika hasil cetak bergeser 1-2 mm ke kiri/kanan karena penjepit kertas tray printer Epson/inkjet, geser slider **Offset X** atau **Offset Y** pada panel kalibrasi aplikasi, lalu klik **"Simpan Setelan"**.
