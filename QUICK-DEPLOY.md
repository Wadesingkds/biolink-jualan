# QUICK DEPLOYMENT GUIDE
## Deploy Biolink Jualan ke Vercel dalam 10 Menit

---

## Prerequisites

- [ ] Akun Vercel (daftar gratis di https://vercel.com/signup)
- [ ] RajaOngkir API Key (daftar di https://rajaongkir.com/akun/daftar)
- [ ] Git installed di local machine
- [ ] Node.js installed (download di https://nodejs.org)

---

## Step 1: Clone Repository (2 menit)

### Windows (Git Bash / PowerShell):

```bash
# Buka terminal
cd Desktop
git clone https://github.com/Wadesingkds/biolink-jualan.git
cd biolink-jualan
```

### Mac/Linux:

```bash
# Buka terminal
cd ~/Desktop
git clone https://github.com/Wadesingkds/biolink-jualan.git
cd biolink-jualan
```

---

## Step 2: Install Vercel CLI (1 menit)

```bash
# Install globally
npm install -g vercel

# Verify installation
vercel --version
# Output: Vercel CLI 54.x.x
```

**Troubleshooting:**

Jika `npm: command not found`:
- Download Node.js: https://nodejs.org/en/download
- Install Node.js (include npm)
- Restart terminal
- Coba lagi

---

## Step 3: Login ke Vercel (1 menit)

```bash
vercel login
```

**Akan buka browser dengan pilihan:**
- Continue with GitHub (Recommended)
- Continue with GitLab
- Continue with Bitbucket
- Continue with Email

**Pilih "Continue with GitHub"** (karena repo udah di GitHub)

**Authorize Vercel** → Klik "Authorize Vercel"

**Kembali ke terminal** → Akan muncul:
```
> Success! GitHub authentication complete for email@example.com
```

---

## Step 4: Deploy Project (2 menit)

```bash
# Deploy ke production
vercel --prod
```

**Vercel akan tanya beberapa hal:**

```
? Set up and deploy "~/Desktop/biolink-jualan"? [Y/n]
→ Ketik: Y (Enter)

? Which scope do you want to deploy to?
→ Pilih: Your Personal Account (Enter)

? Link to existing project? [y/N]
→ Ketik: N (Enter)

? What's your project's name? (biolink-jualan)
→ Enter (pakai default)

? In which directory is your code located? ./
→ Enter (pakai default)

Auto-detected Project Settings (Static Site):
- Build Command: (none)
- Output Directory: .
- Development Command: (none)

? Want to override the settings? [y/N]
→ Ketik: N (Enter)
```

**Vercel akan mulai deploy:**

```
🔗  Linked to wadesingkds/biolink-jualan (created .vercel)
🔍  Inspect: https://vercel.com/wadesingkds/biolink-jualan/xxxxx
✅  Production: https://biolink-jualan-xxxxx.vercel.app [2s]
```

**COPY URL PRODUCTION INI!** (format: `https://biolink-jualan-xxxxx.vercel.app`)

---

## Step 5: Set RajaOngkir API Key (2 menit)

### A. Get RajaOngkir API Key

**Kalau belum punya:**

1. Buka https://rajaongkir.com/akun/daftar
2. Isi form:
   - Email: your@email.com
   - Password: (buat password)
   - Nama: Toko Mas Didik
3. Verifikasi email (cek inbox)
4. Login → Dashboard → **Copy API Key**
5. Format: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (32 karakter)

### B. Add to Vercel

```bash
vercel env add RAJAONGKIR_KEY production
```

**Vercel akan tanya:**

```
? What's the value of RAJAONGKIR_KEY?
→ Paste API key lo (Ctrl+V / Cmd+V)
→ Enter

✅  Added Environment Variable RAJAONGKIR_KEY to Project biolink-jualan
```

### C. Redeploy (Apply Environment Variable)

```bash
vercel --prod
```

**Output:**
```
✅  Production: https://biolink-jualan-xxxxx.vercel.app [2s]
```

---

## Step 6: Update Configuration (2 menit)

### A. Update API Endpoint

Edit file `script.js` (line 6):

**Sebelum:**
```javascript
const CONFIG = {
  API_BASE: 'https://yourdomain.com/api',
  ...
};
```

**Sesudah:**
```javascript
const CONFIG = {
  API_BASE: 'https://biolink-jualan-xxxxx.vercel.app/api', // Ganti dengan URL Vercel lo
  WHATSAPP_NUMBER: '6285156081257', // Ganti dengan nomor WA lo
  ORIGIN_CITY_ID: 210, // Kudus (cari city ID lo di rajaongkir.com/dokumentasi/kota)
  FREE_SHIPPING_MIN: 100000,
  FLAT_SHIPPING_COST: 10000
};
```

**Cara cari City ID:**
1. Buka https://rajaongkir.com/dokumentasi/kota
2. Ctrl+F / Cmd+F → ketik nama kota lo
3. Copy `city_id`

Contoh:
- Kudus = 210
- Jakarta = 152
- Surabaya = 444
- Bandung = 23
- Semarang = 419

### B. Commit & Redeploy

```bash
git add script.js
git commit -m "Update API endpoint and WhatsApp number"
git push origin main
vercel --prod
```

---

## Step 7: Test Deployment (5 menit)

### A. Open URL

```bash
# Buka di browser
open https://biolink-jualan-xxxxx.vercel.app

# Atau copy-paste URL ke browser
```

### B. Test Checklist

- [ ] **Halaman load dengan benar**
  - Logo muncul
  - Product cards muncul
  - Layout responsive

- [ ] **Test Checkout Flow**
  - Klik "Beli Sekarang" → Modal muncul
  - Pilih Provinsi → Dropdown kota muncul
  - Pilih Kota → Dropdown terisi
  - Pilih Kurir (JNE/J&T/SiCepat)
  - Klik "Cek Ongkir" → Loading muncul
  - Ongkir muncul dengan beberapa pilihan layanan
  - Pilih layanan → Total update
  - Klik "Lanjut ke WhatsApp" → Redirect ke WA

- [ ] **Test WhatsApp Message**
  - Message auto-generated dengan detail lengkap:
    - Nama produk
    - Harga
    - Ongkir
    - Total
    - Tujuan
    - Estimasi
  - Nomor WA benar (nomor lo)

- [ ] **Test di Mobile**
  - Buka URL di Chrome Android/Safari iOS
  - Test checkout flow
  - Test WhatsApp redirect

### C. Check Browser Console (Developer Mode)

**Chrome:**
- Klik kanan → Inspect → Console tab
- Seharusnya **tidak ada error merah**

**Common errors & fixes:**

```
Error: Failed to fetch provinces
→ Fix: Check API_BASE di script.js (harus match Vercel URL)

Error: 401 Unauthorized
→ Fix: Check RajaOngkir API key (vercel env ls)

Error: CORS
→ Fix: Sudah handled di api/*.js (seharusnya tidak muncul)
```

---

## Step 8: Setup Analytics (Optional, 5 menit)

### A. Meta Pixel (Facebook/Instagram Ads)

1. Buka https://business.facebook.com/events_manager
2. Create Pixel → Copy Pixel ID (format: `1234567890123456`)
3. Edit `index.html` (line 47):
   ```javascript
   fbq('init', '1234567890123456'); // Ganti dengan Pixel ID lo
   ```
4. Commit & redeploy:
   ```bash
   git add index.html
   git commit -m "Add Meta Pixel"
   git push origin main
   vercel --prod
   ```

### B. Google Analytics

1. Buka https://analytics.google.com
2. Create Property → Copy Measurement ID (format: `G-XXXXXXXXXX`)
3. Edit `index.html` (line 58):
   ```javascript
   gtag('config', 'G-XXXXXXXXXX'); // Ganti dengan Measurement ID lo
   ```
4. Commit & redeploy:
   ```bash
   git add index.html
   git commit -m "Add Google Analytics"
   git push origin main
   vercel --prod
   ```

### C. Test Analytics

**Meta Pixel:**
- Buka https://business.facebook.com/events_manager
- Test Events → Buka URL Vercel di tab baru
- Check events: PageView, ViewContent, AddToCart

**Google Analytics:**
- Buka https://analytics.google.com
- Reports → Realtime
- Buka URL Vercel di tab baru
- Check: 1 active user muncul

---

## Step 9: Add Product Images (Optional, 15 menit)

### A. Prepare Images

**Requirements:**
- Size: 400x533px (ratio 3:4)
- Format: JPG or WebP
- File size: <100KB per image
- Naming: `parfum1.jpg`, `parfum2.jpg`, `daster1.jpg`, etc.

**Tools untuk resize:**
- Online: https://squoosh.app (free, no signup)
- Desktop: Photoshop, GIMP, Canva

### B. Upload to Project

```bash
# Copy images ke folder
cp ~/Downloads/parfum1.jpg assets/images/products/
cp ~/Downloads/parfum2.jpg assets/images/products/
cp ~/Downloads/daster1.jpg assets/images/products/
cp ~/Downloads/daster2.jpg assets/images/products/
cp ~/Downloads/ebook1.jpg assets/images/products/
cp ~/Downloads/template1.jpg assets/images/products/

# Commit & push
git add assets/images/products/
git commit -m "Add product images"
git push origin main

# Redeploy
vercel --prod
```

### C. Update data.json (if needed)

Edit `data.json` untuk update product info:

```json
{
  "id": "p001",
  "name": "Parfum Minyak Wangi Premium 20ml",
  "thumbnail": "assets/images/products/parfum1.jpg",
  "price": 149000,
  "old_price": 299000,
  "weight": 500,
  ...
}
```

Commit & redeploy:

```bash
git add data.json
git commit -m "Update product data"
git push origin main
vercel --prod
```

---

## Step 10: Custom Domain (Optional, 15 menit)

### A. Buy Domain

**Recommended providers:**
- Niagahoster: ~Rp 15K/tahun (.my.id)
- Namecheap: ~$10/tahun (.com)
- Cloudflare: ~$10/tahun (.com)

### B. Connect to Vercel

1. Vercel Dashboard → Project → Settings → Domains
2. Add Domain: `tokomasdidik.com`
3. Vercel akan kasih DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. Paste ke domain provider:
   - Niagahoster: DNS Management
   - Namecheap: Advanced DNS
   - Cloudflare: DNS Records

5. Wait 5-60 menit untuk DNS propagation

6. Vercel akan auto-detect dan issue SSL certificate

### C. Update Configuration

Edit `script.js`:

```javascript
const CONFIG = {
  API_BASE: 'https://tokomasdidik.com/api', // Custom domain
  ...
};
```

Commit & redeploy:

```bash
git add script.js
git commit -m "Update to custom domain"
git push origin main
vercel --prod
```

---

## Troubleshooting

### "Failed to calculate shipping"

**Cause:** API key salah atau quota habis

**Fix:**

```bash
# Check env variable
vercel env ls

# Remove old key
vercel env rm RAJAONGKIR_KEY production

# Add new key
vercel env add RAJAONGKIR_KEY production

# Redeploy
vercel --prod
```

### "Gagal memuat data provinsi"

**Cause:** API endpoint salah

**Fix:**

1. Check `script.js` line 6 → API_BASE harus match Vercel URL
2. Test API endpoint:
   ```bash
   curl https://biolink-jualan-xxxxx.vercel.app/api/provinces
   ```
3. Should return JSON with provinces data

### Images tidak muncul

**Cause:** Path salah atau file belum di-upload

**Fix:**

```bash
# Check file exists
ls -la assets/images/products/

# Check path di data.json
cat data.json | grep thumbnail

# Path harus relative: "assets/images/products/parfum1.jpg"
# BUKAN absolute: "/assets/images/products/parfum1.jpg"
```

### WhatsApp link tidak buka

**Cause:** Format nomor salah

**Fix:**

Format yang benar: `6285156081257` (no +, no spaces, no dashes)

Edit `script.js` line 7:

```javascript
WHATSAPP_NUMBER: '6285156081257', // Format: 62 + nomor tanpa 0 di depan
```

---

## Maintenance

### Update Product

```bash
# Edit data.json
nano data.json

# Commit & redeploy
git add data.json
git commit -m "Update products"
git push origin main
vercel --prod
```

### Update Price

```bash
# Edit data.json → ubah price dan old_price
nano data.json

# Commit & redeploy
git add data.json
git commit -m "Update prices"
git push origin main
vercel --prod
```

### Enable Promo Banner

```bash
# Edit data.json
nano data.json

# Change:
"promo_banner": {
  "active": true,
  "text": "FLASH SALE 50% - Hari Ini Aja!",
  "countdown": "2026-05-25T23:59:59+07:00"
}

# Commit & redeploy
git add data.json
git commit -m "Enable promo banner"
git push origin main
vercel --prod
```

---

## Monitoring

### Check Deployment Status

```bash
# List deployments
vercel ls

# Check logs
vercel logs https://biolink-jualan-xxxxx.vercel.app
```

### Check API Usage

**RajaOngkir:**
- https://rajaongkir.com/akun/dashboard
- Check: Request count (max 1000/month on free tier)

**Vercel:**
- https://vercel.com/dashboard
- Analytics → Bandwidth usage (max 100GB/month on free tier)

---

## Cost Summary

- **RajaOngkir API:** FREE (1000 req/month)
- **Vercel Hosting:** FREE (100GB bandwidth)
- **Domain (optional):** ~Rp 15K/tahun
- **Total:** **Rp 0-15K/tahun**

---

## Support

Jika stuck atau butuh bantuan:

1. Check README.md → Troubleshooting section
2. Check browser console (F12) → Error messages
3. Check Vercel logs → `vercel logs`
4. Contact: WhatsApp +62 851-5608-1257

---

## Success Checklist

- [ ] Repository cloned
- [ ] Vercel CLI installed
- [ ] Logged in to Vercel
- [ ] Project deployed
- [ ] RajaOngkir API key added
- [ ] Configuration updated (API_BASE, WHATSAPP_NUMBER)
- [ ] Shipping calculator tested
- [ ] WhatsApp redirect tested
- [ ] Mobile responsive tested
- [ ] Analytics setup (optional)
- [ ] Product images uploaded (optional)
- [ ] Custom domain connected (optional)

---

**Deployment time: ~10-30 menit**

**Selamat! Biolink jualan lo udah live! 🎉**