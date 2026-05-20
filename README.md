# Biolink Jualan - Landing Page E-Commerce

Landing page biolink untuk jualan online dengan fitur cek ongkir real-time via RajaOngkir API.

## Features

- ✅ **SEO Optimized** - Meta tags, Open Graph, Twitter Card, Structured Data (JSON-LD)
- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **Real-time Shipping Calculator** - Integration with RajaOngkir API
- ✅ **WhatsApp Checkout** - Direct order via WhatsApp with auto-generated message
- ✅ **Product Catalog** - Grid layout with images, prices, ratings, badges
- ✅ **Free Shipping Logic** - Auto-apply free shipping for orders above threshold
- ✅ **Analytics Ready** - Meta Pixel, Google Analytics, GTM integration
- ✅ **Testimonials Section** - Social proof from customers
- ✅ **FAQ Section** - Structured data for rich snippets
- ✅ **Floating WhatsApp Button** - Always accessible contact
- ✅ **Promo Banner** - With countdown timer
- ✅ **UTM Tracking** - Capture campaign parameters

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript (no framework)
- **API:** RajaOngkir Starter (free tier)
- **Deployment:** GitHub Pages / Vercel / Netlify
- **Analytics:** Meta Pixel, Google Analytics 4, GTM

## File Structure

```
biolink-jualan/
├── index.html          # Main HTML file
├── style.css           # Stylesheet
├── script.js           # JavaScript logic
├── data.json           # Product data
├── README.md           # This file
├── assets/
│   ├── images/
│   │   ├── avatar.jpg          # Store avatar
│   │   ├── logo.png            # Favicon
│   │   ├── og-image.jpg        # Open Graph image (1200x630)
│   │   └── products/
│   │       ├── parfum1.jpg     # Product images (400x533)
│   │       ├── parfum2.jpg
│   │       ├── daster1.jpg
│   │       ├── daster2.jpg
│   │       ├── ebook1.jpg
│   │       └── template1.jpg
│   └── icons/
│       ├── bca.png             # Payment method icons
│       ├── gopay.png
│       └── qris.png
└── api/                        # Backend proxy (Vercel Functions)
    ├── provinces.js
    ├── cities.js
    └── shipping-cost.js
```

## Setup Instructions

### 1. RajaOngkir API Setup

1. Daftar di https://rajaongkir.com/akun/daftar
2. Verifikasi email
3. Login → Dashboard → Copy API Key
4. Free tier: 1000 requests/bulan

### 2. Backend Proxy Setup (Vercel)

**Option A: Vercel Functions (Recommended)**

Create `api/shipping-cost.js`:

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { destination, weight, courier } = req.body;
  const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_KEY;
  const ORIGIN_CITY_ID = 210; // Kudus
  
  try {
    const response = await fetch('https://api.rajaongkir.com/starter/cost', {
      method: 'POST',
      headers: {
        'key': RAJAONGKIR_API_KEY,
        'content-type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        origin: ORIGIN_CITY_ID,
        destination: destination,
        weight: weight,
        courier: courier || 'jne'
      })
    });
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

Create `api/provinces.js`:

```javascript
export default async function handler(req, res) {
  const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_KEY;
  
  try {
    const response = await fetch('https://api.rajaongkir.com/starter/province', {
      headers: { 'key': RAJAONGKIR_API_KEY }
    });
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

Create `api/cities.js`:

```javascript
export default async function handler(req, res) {
  const { provinceId } = req.query;
  const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_KEY;
  
  try {
    const response = await fetch(
      `https://api.rajaongkir.com/starter/city?province=${provinceId}`,
      { headers: { 'key': RAJAONGKIR_API_KEY } }
    );
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

**Deploy to Vercel:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variable
vercel env add RAJAONGKIR_KEY production
# Paste your RajaOngkir API key when prompted
```

### 3. Update Configuration

Edit `script.js`:

```javascript
const CONFIG = {
  API_BASE: 'https://your-project.vercel.app/api', // Your Vercel URL
  WHATSAPP_NUMBER: '6285156081257',
  ORIGIN_CITY_ID: 210, // Your city ID (Kudus = 210)
  FREE_SHIPPING_MIN: 100000,
  FLAT_SHIPPING_COST: 10000
};
```

### 4. Add Product Images

Place product images in `assets/images/products/`:
- Recommended size: 400x533px (3:4 ratio)
- Format: JPG or WebP
- Optimize with TinyPNG or Squoosh

### 5. Update Product Data

Edit `data.json` with your actual products:

```json
{
  "id": "p001",
  "name": "Your Product Name",
  "thumbnail": "assets/images/products/your-image.jpg",
  "price": 149000,
  "old_price": 299000,
  "weight": 500,
  ...
}
```

### 6. Setup Analytics

**Meta Pixel:**

Replace `YOUR_PIXEL_ID` in `index.html` with your actual Pixel ID.

**Google Analytics:**

Replace `G-XXXXXXXXXX` in `index.html` with your GA4 Measurement ID.

### 7. Deploy Frontend

**Option A: GitHub Pages**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/biolink-jualan.git
git push -u origin main

# Enable GitHub Pages in repo settings
# Settings → Pages → Source: main branch
```

**Option B: Vercel (same project)**

```bash
vercel --prod
```

**Option C: Netlify**

```bash
npm i -g netlify-cli
netlify deploy --prod
```

## Customization

### Change Colors

Edit `style.css`:

```css
/* Primary color (WhatsApp green) */
.btn-primary { background: #25D366; }

/* Change to your brand color */
.btn-primary { background: #FF6B6B; }
```

### Change Free Shipping Threshold

Edit `script.js`:

```javascript
const CONFIG = {
  FREE_SHIPPING_MIN: 150000, // Change to 150K
  ...
};
```

### Add More Products

Edit `data.json` and add to `products` array.

### Change Origin City

Find your city ID: https://rajaongkir.com/dokumentasi/kota

Edit `script.js`:

```javascript
const CONFIG = {
  ORIGIN_CITY_ID: 152, // Jakarta
  ...
};
```

## Testing

### Local Testing

```bash
# Serve with Python
python3 -m http.server 8000

# Or with Node.js
npx serve .

# Open http://localhost:8000
```

### Test Checklist

- [ ] Products load correctly
- [ ] Province dropdown populates
- [ ] City dropdown populates when province selected
- [ ] Shipping calculation returns results
- [ ] Multiple courier options displayed
- [ ] Selecting service updates total
- [ ] Free shipping applies when threshold met
- [ ] WhatsApp message includes all details
- [ ] Mobile responsive
- [ ] Analytics events fire (check browser console)

## Performance Optimization

### Image Optimization

```bash
# Install ImageMagick
sudo apt install imagemagick

# Resize and optimize
for img in assets/images/products/*.jpg; do
  convert "$img" -resize 400x533^ -gravity center -extent 400x533 -quality 85 "$img"
done

# Convert to WebP
for img in assets/images/products/*.jpg; do
  cwebp -q 85 "$img" -o "${img%.jpg}.webp"
done
```

### Caching Strategy

Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Troubleshooting

### Shipping calculation fails

1. Check API key is correct
2. Check proxy endpoint is accessible
3. Check browser console for errors
4. Verify RajaOngkir quota (1000/month on free tier)

### Products not loading

1. Check `data.json` is valid JSON (use JSONLint)
2. Check image paths are correct
3. Check browser console for errors

### WhatsApp link not working

1. Verify phone number format: `6285156081257` (no + or spaces)
2. Check message encoding (special characters)
3. Test on mobile device

## Cost Breakdown

- **RajaOngkir API:** FREE (1000 req/month)
- **Vercel Hosting:** FREE (100GB bandwidth)
- **Domain (optional):** ~$10/year
- **Total:** $0-10/year

## Scaling Up

### When to upgrade RajaOngkir:

- Free tier: 1000 req/month (~33/day)
- Basic: Rp 25K/month (10K req)
- Pro: Rp 100K/month (unlimited)

### Add payment gateway:

- Midtrans (2.9% + Rp 2000)
- Xendit (2.9%)
- Doku (3%)

### Add inventory management:

- Google Sheets + Apps Script
- Airtable
- Notion Database

## Support

Jika ada pertanyaan atau butuh bantuan:

- WhatsApp: +62 851-5608-1257
- Email: didik.prasetiadi@example.com

## License

MIT License - Free to use for commercial projects.

---

**Built with ❤️ by Hermes Agent**