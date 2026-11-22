# Saat Teduh Kristen 📖✝️

Aplikasi web modern untuk Saat Teduh Kristen harian, dilengkapi refleksi pribadi interaktif, Verse of the Day, dan Jurnal Mingguan Catatan Khotbah Gereja.

---

## 🌟 Fitur Utama

1. **📖 Saat Teduh Harian Otomatis Berganti (365 Hari)**
   - Setiap hari menyajikan renungan yang berbeda dan alkitabiah (Lengkap dengan tema, nats Alkitab, ayat kunci TB, uraian renungan mendalam, panduan doa, dan langkah praktis).
   - Kalender & Pemilih Tanggal: Bisa membaca renungan hari ini, hari-hari sebelumnya, maupun merencanakan renungan mendatang.

2. **✍️ Lembar Refleksi Pribadi**
   - Penjejak kondisi batin/hati (Bersyukur, Damai, Butuh Kekuatan, Bergumul, Haus Hadirat-Nya).
   - Tiga kolom refleksi: *Pesan Firman / Rhema*, *Penerapan Praktis*, dan *Doa Pribadi*.
   - **Tersimpan Otomatis (Autosave)** di peramban (LocalStorage).
   - Tombol **Tandai Selesai Saat Teduh** dengan animasi selebrasi konfeti dan penjejak rekor kebiasaan (*Streak Tracker* berturut-turut).

3. **✝️ Verse of the Day (Ayat Emas Hari Ini)**
   - Tampilan visual ayat emas harian dalam terjemahan Alkitab Indonesia (TB).
   - Salin ayat 1-klik ke clipboard.
   - Bagikan langsung ke WhatsApp dengan format rapi.
   - **Generator Kartu Ayat (Canvas Story)**: Unduh gambar beresolusi tinggi otomatis (1080x1920) untuk Instagram Story atau Status WhatsApp!

4. **⛪ Jurnal Mingguan Khotbah Gereja**
   - Catatan khusus untuk ibadah hari Minggu: Tanggal, Sesi Ibadah, Nama Gereja, Pengkhotbah/Pendeta, Tema, Nats Alkitab Pokok.
   - Poin-poin utama khotbah, Rhema pribadi, dan komitmen tindakan nyata selama seminggu ke depan.
   - Filter pencarian cepat, edit, hapus, dan bagikan ringkasan khotbah ke WhatsApp atau cetak.

5. **🎵 Musik Doa Instrumental (Ambient Synthesizer)**
   - Musik instrumental pad & denting lonceng doa yang tenang menggunakan Web Audio API tanpa membutuhkan kuota unduh audio eksternal.

6. **⚙️ Personalisasi & Cadangan Data**
   - 3 Tema visual: Terang Lembut, Sepia Teduh, dan *Dark Sanctuary*.
   - Pilihan ukuran huruf teks renungan (Normal, Besar, Sangat Besar).
   - Ekspor & Impor file cadangan JSON agar catatan tidak hilang saat berganti perangkat.

---

## 🚀 Cara Deploy Langsung ke Vercel

Aplikasi ini dibuat murni menggunakan teknologi web modern statis (HTML5, Tailwind CSS, Vanilla JS, Web Audio API), sehingga **100% kompatibel dan langsung siap dideploy ke Vercel** tanpa perlu konfigurasi build yang rumit!

### Cara 1: Deploy Melalui GitHub (Paling Direkomendasikan & 1-Klik)

1. Buat repositori baru di akun GitHub Anda (misal: `saat-teduh-kristen`).
2. Masukkan perintah berikut di terminal:
   ```bash
   git init
   git add .
   git commit -m "feat: inisialisasi aplikasi saat teduh kristen"
   git branch -M main
   git remote add origin https://github.com/USERNAME-ANDA/saat-teduh-kristen.git
   git push -u origin main
   ```
3. Buka dashboard [Vercel](https://vercel.com).
4. Klik **"Add New..."** → **"Project"**.
5. Pilih repositori `saat-teduh-kristen` dari GitHub Anda.
6. Klik tombol biru **"Deploy"**!
7. Selesai! Aplikasi Anda langsung live di internet dengan domain gratis `https://saat-teduh-kristen-xxx.vercel.app`.

### Cara 2: Deploy Menggunakan Vercel CLI

Bila Anda memiliki `vercel` terpasang:
```bash
# Login ke Vercel (jika belum)
vercel login

# Jalankan deploy ke produksi
vercel --prod
```

---

## 📁 Struktur Berkas

```
Saat teduh/
├── index.html          # Antarmuka utama aplikasi
├── styles.css          # Desain sistem, tema sepia/dark, dan animasi
├── vercel.json         # Konfigurasi deployment Vercel
├── README.md           # Petunjuk penggunaan dan deployment
├── data/
│   ├── devotionals.js  # Koleksi renungan harian dan generator 365 hari
│   └── verses.js       # Koleksi ayat emas Verse of the Day
└── js/
    ├── app.js          # Logika aplikasi, refleksi, jurnal khotbah, dan streak
    └── audio.js        # Generator musik instrumental doa (Web Audio API)
```
