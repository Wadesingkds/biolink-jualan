# DEPLOYMENT GUIDE

## Quick Start Deployment

### Step 1: Daftar RajaOngkir (5 menit)

1. Buka https://rajaongkir.com/akun/daftar
2. Isi form:
   - Email: your@email.com
   - Password: (buat password)
   - Nama: Toko Mas Didik
3. Verifikasi email (cek inbox)
4. Login → Dashboard → **Copy API Key**
5. Simpan API key (format: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### Step 2: Deploy ke Vercel (10 menit)

**A. Install Vercel CLI**

```bash
# Install Node.js dulu (kalau belum ada)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Vercel CLI
npm install -g vercel
```

**B. Deploy Project**

```bash
# Masuk ke folder project
cd /tmp/biolink-jualan

# Login ke Vercel (akan buka browser)
vercel login

# Deploy
vercel --prod

# Ikuti prompt:
# - Set up and deploy? Y
# - Which scope? (pilih account kamu)
# - Link to existing project? N
# - Project name? biolink-jualan (atau nama lain)
# - Directory? ./ (enter)
# - Override settings? N
```

**C. Set Environment Variable**

```bash
# Add RajaOngkir API key
vercel env add RAJAONGKIR_KEY production

# Paste API key yang tadi disimpan, tekan Enter

# Redeploy untuk apply env variable
vercel --prod
```

**D. Copy Deployment URL**

Setelah deploy selesai, Vercel akan kasih URL:
```
https://biolink-jualan-xxxxx.vercel.app
```

### Step 3: Update Configuration (2 menit)

**Edit `script.js` line 6:**

```javascript
const CONFIG = {
  API_BASE: 'https://biolink-jualan-xxxxx.vercel.app/api', // Ganti dengan URL Vercel kamu
  WHATSAPP_NUMBER: '6285156081257', // Ganti dengan nomor WA kamu
  ORIGIN_CITY_ID: 210, // Kudus (cari city ID kamu di rajaongkir.com/dokumentasi/kota)
  FREE_SHIPPING_MIN: 100000,
  FLAT_SHIPPING_COST: 10000
};
```

**Commit & redeploy:**

```bash
git add script.js
git commit -m "Update API endpoint"
vercel --prod
```

### Step 4: Add Product Images (15 menit)

**A. Prepare Images**

1. Siapkan foto produk (minimal 6 produk)
2. Resize ke 400x533px (ratio 3:4)
3. Compress dengan TinyPNG.com
4. Rename:
   - `parfum1.jpg`
   - `parfum2.jpg`
   - `daster1.jpg`
   - `daster2.jpg`
   - `ebook1.jpg`
   - `template1.jpg`

**B. Upload Images**

```bash
# Copy images ke folder
cp ~/Downloads/parfum1.jpg assets/images/products/
cp ~/Downloads/parfum2.jpg assets/images/products/
# ... dst

# Atau upload via Vercel dashboard:
# 1. Buka https://vercel.com/dashboard
# 2. Pilih project biolink-jualan
# 3. Settings → Storage → Upload files
```

**C. Add Avatar & Icons**

```bash
# Avatar (80x80px, circle crop)
cp ~/avatar.jpg assets/images/avatar.jpg

# Logo/Favicon (256x256px)
cp ~/logo.png assets/images/logo.png

# OG Image (1200x630px untuk social share)
cp ~/og-image.jpg assets/images/og-image.jpg

# Payment icons (download dari Google)
wget https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg -O assets/icons/bca.png
wget https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg -O assets/icons/gopay.png
wget https://qris.id/homepage/assets/images/qris-logo.png -O assets/icons/qris.png
```

**D. Redeploy**

```bash
git add assets/
git commit -m "Add product images"
vercel --prod
```

### Step 5: Setup Analytics (10 menit)

**A. Meta Pixel (Facebook/Instagram Ads)**

1. Buka https://business.facebook.com/events_manager
2. Create Pixel → Copy Pixel ID
3. Edit `index.html` line 47:
   ```javascript
   fbq('init', 'YOUR_PIXEL_ID'); // Ganti dengan Pixel ID kamu
   ```

**B. Google Analytics**

1. Buka https://analytics.google.com
2. Create Property → Copy Measurement ID (format: G-XXXXXXXXXX)
3. Edit `index.html` line 58:
   ```javascript
   gtag('config', 'G-XXXXXXXXXX'); // Ganti dengan Measurement ID kamu
   ```

**C. Redeploy**

```bash
git add index.html
git commit -m "Add analytics tracking"
vercel --prod
```

### Step 6: Test Everything (10 menit)

**Checklist:**

```bash
# Buka URL Vercel di browser
open https://biolink-jualan-xxxxx.vercel.app
```

- [ ] Halaman load dengan benar
- [ ] Product images muncul
- [ ] Klik "Beli Sekarang" → modal muncul
- [ ] Pilih provinsi → dropdown kota muncul
- [ ] Pilih kota + kurir → ongkir muncul
- [ ] Pilih layanan → total update
- [ ] Klik "Lanjut ke WhatsApp" → redirect ke WA dengan message lengkap
- [ ] Test di mobile (Chrome Android)
- [ ] Check analytics (Facebook Events Manager / GA Real-time)

### Step 7: Custom Domain (Optional, 15 menit)

**A. Beli Domain**

- Niagahoster: ~Rp 15K/tahun (.my.id)
- Namecheap: ~$10/tahun (.com)
- Cloudflare: ~$10/tahun (.com)

**B. Connect to Vercel**

1. Vercel Dashboard → Project → Settings → Domains
2. Add Domain: `tokomas didik.com`
3. Copy DNS records yang dikasih Vercel
4. Paste ke domain provider (Niagahoster/Namecheap)
5. Wait 5-60 menit untuk DNS propagation

**C. Update Links**

Edit `script.js`:

```javascript
const CONFIG = {
  API_BASE: 'https://tokomasdidik.com/api', // Domain kamu
  ...
};
```

Redeploy:

```bash
git add script.js
git commit -m "Update to custom domain"
vercel --prod
```

---

## Troubleshooting

### Error: "Failed to calculate shipping"

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

### Error: "Gagal memuat data provinsi"

**Cause:** CORS issue atau API endpoint salah

**Fix:**

1. Check `script.js` line 6 → API_BASE harus match dengan Vercel URL
2. Check browser console (F12) untuk error detail
3. Test API endpoint langsung:
   ```bash
   curl https://biolink-jualan-xxxxx.vercel.app/api/provinces
   ```

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

Edit `data.json`:

```json
{
  "id": "p007",
  "name": "Produk Baru",
  "price": 99000,
  ...
}
```

Redeploy:

```bash
git add data.json
git commit -m "Add new product"
vercel --prod
```

### Update Price

Edit `data.json` → ubah `price` dan `old_price`

Redeploy:

```bash
git add data.json
git commit -m "Update prices"
vercel --prod
```

### Enable Promo Banner

Edit `data.json`:

```json
"promo_banner": {
  "active": true,
  "text": "FLASH SALE 50% - Hari Ini Aja!",
  "countdown": "2026-05-25T23:59:59+07:00"
}
```

Redeploy:

```bash
git add data.json
git commit -m "Enable promo banner"
vercel --prod
```

---

## Monitoring

### Check Analytics

**Meta Pixel:**
- https://business.facebook.com/events_manager
- Events → Test Events (real-time)
- Check: PageView, ViewContent, AddToCart, InitiateCheckout

**Google Analytics:**
- https://analytics.google.com
- Reports → Realtime
- Check: Active users, Events, Conversions

### Check API Usage

**RajaOngkir:**
- https://rajaongkir.com/akun/dashboard
- Check: Request count (max 1000/month on free tier)
- Upgrade to Basic (Rp 25K) jika mendekati limit

**Vercel:**
- https://vercel.com/dashboard
- Analytics → Check bandwidth usage
- Free tier: 100GB/month

---

## Scaling Up

### When to upgrade RajaOngkir:

- **Free tier:** 1000 req/month (~33/day)
  - Good for: Testing, low traffic (<10 orders/day)
  
- **Basic (Rp 25K/month):** 10K req/month (~333/day)
  - Good for: Growing business (10-50 orders/day)
  
- **Pro (Rp 100K/month):** Unlimited
  - Good for: High volume (50+ orders/day)

### Add Payment Gateway:

**Midtrans (Recommended):**
- Fee: 2.9% + Rp 2000
- Support: VA, e-wallet, credit card, QRIS
- Docs: https://docs.midtrans.com

**Xendit:**
- Fee: 2.9%
- Support: VA, e-wallet, credit card, QRIS
- Docs: https://docs.xendit.co

### Add Order Management:

**Google Sheets (Free):**
- Manual input via WhatsApp
- Apps Script for automation

**Notion (Free):**
- Database for orders
- Kanban board for fulfillment

**Airtable (Free tier):**
- Relational database
- Automation workflows

---

## Support

Jika stuck atau butuh bantuan:

1. **Check README.md** → Troubleshooting section
2. **Check browser console** (F12) → Error messages
3. **Check Vercel logs** → Dashboard → Deployments → View logs
4. **Contact:** WhatsApp +62 851-5608-1257

---

**Total deployment time: ~1 jam**

**Cost: Rp 0 (semua free tier)**