# 💰 Finance Buddy

Aplikasi catatan keuangan pribadi yang **elegan**, **modern**, dan **cocok untuk semua usia** — dari anak-anak hingga orang tua. Berjalan 100% di perangkat Anda, siap dijadikan APK Android.

![Status](https://img.shields.io/badge/status-ready-success)
![PWA](https://img.shields.io/badge/PWA-ready-indigo)
![Offline](https://img.shields.io/badge/works-offline-green)
![No Dependencies](https://img.shields.io/badge/dependencies-zero-blue)

---

## ✨ Fitur Lengkap

- 📊 **Dashboard intuitif** — Saldo, ringkasan, grafik 7 hari
- ➕ **Tambah transaksi cepat** — Amount besar, picker kategori visual
- 📜 **Riwayat dengan filter** — Cari, filter income/expense
- 🏷️ **15 kategori default + custom** — Dengan emoji pilihan
- 📈 **Laporan bulanan** — Donut chart & breakdown detail
- 💱 **Multi-currency** — Rupiah 🇮🇩 & Dollar 🇺🇸
- 🌐 **Bilingual** — Indonesia & English
- 🌙 **Dark mode** — Smooth transition, nyaman di mata
- 💾 **Export/Import** — Backup data ke JSON
- 🔐 **Multi-user** — PIN 4 digit, data terpisah per akun
- 🗑️ **Delete confirmation** — Tidak sengaja terhapus? Tidak akan terjadi
- 👁️ **Balance privacy** — Sembunyikan saldo dengan satu tap
- 📱 **PWA** — Install ke home screen
- 📦 **APK-ready** — Bisa dibungkus jadi APK Android

---

## 🎨 Design System

### Prinsip Desain
- **Elegant tapi approachable** — Tidak childish, tidak kaku
- **Aksesibilitas** — Minimum touch target 44px (standar Apple/Material)
- **Kontras tinggi** — Mudah dibaca untuk semua usia
- **Transisi halus** — Animasi 200-300ms, tidak berlebihan
- **Empty states informatif** — Bukan sekadar "tidak ada data"

### Color Palette
```
Primary:    #6366F1 (Indigo) — elegan, terpercaya
Success:    #10B981 (Emerald) — untuk income
Danger:     #F43F5E (Rose) — untuk expense
Background: #FAFAFB (light) / #0F1117 (dark)
```

### Typography
- **Font**: System font stack (SF Pro, Segoe UI, Roboto)
- **Hierarki**: 22px (heading) → 15px (body) → 12-13px (caption)
- **Tabular numerals** untuk angka (alignment sempurna)

---

## 🚀 Cara Menjalankan

### Cara 1: Local server (recommended untuk PWA)
```bash
cd finance-app
python -m http.server 8765
# atau
npx serve .
# atau
php -S localhost:8765
```
Buka: **http://localhost:8765**

### Cara 2: Deploy ke internet (gratis)
1. **Netlify Drop**: Drag folder ke [app.netlify.com/drop](https://app.netlify.com/drop)
2. **Vercel**: `npx vercel` di dalam folder
3. **GitHub Pages**: Push ke repo, aktifkan Pages

---

## 📱 Cara Install Jadi APK Android

### Cara A: Tambah ke Home Screen (PWA — paling cepat)
1. Buka app di **Chrome Android**
2. Tap menu (⋮) → **"Install app"** atau **"Add to Home screen"**
3. App muncul seperti aplikasi native 🎉

### Cara B: APK beneran
#### 🔧 PWABuilder (paling gampang — 5 menit)
1. Deploy app ke hosting
2. Buka https://www.pwabuilder.com
3. Masukkan URL app
4. Klik **Package For Stores → Android**
5. Download APK-nya!

#### 🔧 Bubblewrap (Google official CLI)
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://your-url/manifest.json
bubblewrap build
# Output: app-release-signed.apk
```

#### 🔧 Capacitor (advanced)
```bash
npm init @capacitor/app
npx cap add android
npx cap sync
npx cap open android  # Build di Android Studio
```

---

## 📂 Struktur File

```
finance-app/
├── index.html              # Halaman utama
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (offline)
├── css/
│   └── style.css           # Design system lengkap
├── js/
│   ├── app.js              # Main logic
│   ├── i18n.js             # Bahasa ID/EN
│   ├── storage.js          # localStorage manager
│   ├── categories.js       # Default categories
│   └── charts.js           # Canvas charts (no deps)
├── icons/
│   ├── icon.svg            # App icon (vector)
│   ├── icon-192.png        # 192×192 PNG
│   └── icon-512.png        # 512×512 PNG
└── README.md
```

**Zero npm dependencies untuk runtime!** Semua pakai vanilla JS + Canvas API.

---

## 🔐 Catatan Keamanan

- ✅ Data tersimpan 100% di perangkat (tidak dikirim ke server)
- ✅ PIN 4-digit melindungi antar user di device yang sama
- ⚠️ PIN disimpan plain-text di localStorage — **bukan** untuk keamanan tinggi
- 💡 Untuk produksi: integrasikan Supabase/Firebase (lihat roadmap)

---

## 💡 Tips Penggunaan

- **Backup rutin**: Settings → Export Data setiap minggu/bulan
- **Multi-user**: Buka dengan email berbeda untuk akun terpisah
- **Custom kategori**: Halaman Kategori → Tambah Kategori
- **Privacy**: Tap icon mata di balance card untuk hide/show saldo
- **Cepat**: Tap tombol "Pemasukan" / "Pengeluaran" di dashboard untuk input langsung

---

## 📋 Roadmap

- [ ] Integrasi Supabase untuk cloud sync
- [ ] Recurring transactions (langganan, dll)
- [ ] Budget targets & alerts
- [ ] Multi-currency per transaction
- [ ] Laporan tahunan
- [ ] Export PDF
- [ ] Widget Android
- [ ] Notifikasi pengingat
- [ ] Dark mode otomatis (berdasarkan jam)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML/CSS/JS |
| Charts | Pure Canvas API (no Chart.js!) |
| Storage | localStorage |
| PWA | Service Worker + Web App Manifest |
| i18n | Custom ID/EN translations |
| Icons | Inline SVG (no icon library) |
| APK build | PWABuilder / Bubblewrap / Capacitor |

---

## 📄 Lisensi

Gratis untuk penggunaan pribadi, edukasi, dan komersial. Buat sendiri, modif sendiri, deploy sendiri. 💜

Dibuat dengan ❤️ untuk semua orang yang ingin kelola keuangan dengan tenang.