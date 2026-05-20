// ===========================
// CONFIGURATION
// ===========================

const CONFIG = {
  API_BASE: 'https://biolink-jualan.vercel.app/api',
  WHATSAPP_NUMBER: '6285156081257',
  ORIGIN_CITY_ID: 210, // Kudus
  FREE_SHIPPING_MIN: 100000,
  FLAT_SHIPPING_COST: 10000
};

// ===========================
// STATE
// ===========================

let selectedProduct = null;
let selectedShipping = null;
let provinces = [];
let cities = [];

// ===========================
// DATA LOADING
// ===========================

// Load products from data.json
async function loadProducts() {
  try {
    const response = await fetch('data.json');
    const data = await response.json();
    
    renderProducts(data.products);
    renderTestimonials(data.testimonials);
    
    // Show promo banner if active
    if (data.promo_banner && data.promo_banner.active) {
      showPromoBanner(data.promo_banner);
    }
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Render products
function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = '';
  
  products.forEach(product => {
    const card = createProductCard(product);
    grid.appendChild(card);
  });
}

// Create product card
function createProductCard(product) {
  const article = document.createElement('article');
  article.className = 'product-card';
  article.setAttribute('itemscope', '');
  article.setAttribute('itemtype', 'https://schema.org/Product');
  article.onclick = () => openCheckoutModal(product);
  
  // Calculate discount percentage
  const discountPercent = product.old_price 
    ? Math.round((1 - product.price / product.old_price) * 100)
    : 0;
  
  article.innerHTML = `
    <div class="product-image-wrapper">
      <img 
        src="${product.thumbnail}" 
        alt="${product.name}"
        class="product-image"
        itemprop="image"
        loading="lazy"
        width="400"
        height="533"
      >
      <div class="product-badges">
        ${product.badges.map(badge => {
          let badgeClass = 'product-badge';
          if (badge.includes('DISKON')) badgeClass += ' discount';
          else if (badge.includes('BEST')) badgeClass += ' bestseller';
          else if (badge.includes('NEW')) badgeClass += ' new';
          return `<span class="${badgeClass}">${badge}</span>`;
        }).join('')}
      </div>
    </div>
    
    <div class="product-info">
      <h3 class="product-name" itemprop="name">${product.name}</h3>
      
      <div class="product-rating" itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
        <span class="stars">⭐⭐⭐⭐⭐</span>
        <span class="rating-value">
          <span itemprop="ratingValue">${product.rating}</span>
        </span>
        <meta itemprop="reviewCount" content="${product.sold}">
      </div>
      
      <div class="product-sold">${product.sold.toLocaleString('id-ID')} terjual</div>
      
      <div class="product-price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
        <meta itemprop="priceCurrency" content="IDR">
        <meta itemprop="price" content="${product.price}">
        <link itemprop="availability" href="https://schema.org/InStock">
        <span class="price-current">Rp ${product.price.toLocaleString('id-ID')}</span>
        ${product.old_price ? `<span class="price-old">Rp ${product.old_price.toLocaleString('id-ID')}</span>` : ''}
      </div>
      
      <div class="product-shipping">
        <span>🚚</span>
        <span>${product.shipping}</span>
      </div>
      
      <button class="product-cta" onclick="event.stopPropagation(); openCheckoutModal(${JSON.stringify(product).replace(/"/g, '&quot;')})">
        Beli Sekarang
      </button>
    </div>
  `;
  
  return article;
}

// Render testimonials
function renderTestimonials(testimonials) {
  const grid = document.getElementById('testimonial-grid');
  grid.innerHTML = '';
  
  testimonials.forEach(testimonial => {
    const card = document.createElement('div');
    card.className = 'testimonial-card';
    
    const initial = testimonial.author.charAt(0).toUpperCase();
    const stars = '⭐'.repeat(testimonial.rating);
    
    card.innerHTML = `
      <div class="testimonial-header">
        <div class="testimonial-avatar">${initial}</div>
        <div class="testimonial-author">
          <div class="testimonial-name">${testimonial.author}</div>
          <div class="testimonial-location">${testimonial.location}</div>
        </div>
        <div class="testimonial-rating">${stars}</div>
      </div>
      <p class="testimonial-text">"${testimonial.text}"</p>
    `;
    
    grid.appendChild(card);
  });
}

// Show promo banner
function showPromoBanner(promo) {
  const banner = document.getElementById('promo-banner');
  banner.style.display = 'block';
  
  // Countdown timer
  if (promo.countdown) {
    const countdownEl = document.getElementById('countdown');
    const endTime = new Date(promo.countdown).getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = endTime - now;
      
      if (distance < 0) {
        banner.style.display = 'none';
        return;
      }
      
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      countdownEl.textContent = `Berakhir dalam ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }
}

// ===========================
// CHECKOUT MODAL
// ===========================

function openCheckoutModal(product) {
  selectedProduct = product;
  selectedShipping = null;
  
  const modal = document.getElementById('checkout-modal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Populate cart item
  const cartItem = document.getElementById('cart-item');
  cartItem.innerHTML = `
    <img src="${product.thumbnail}" alt="${product.name}" class="cart-item-image">
    <div class="cart-item-info">
      <div class="cart-item-name">${product.name}</div>
      <div class="cart-item-price">Rp ${product.price.toLocaleString('id-ID')}</div>
    </div>
  `;
  
  // Update subtotal
  document.getElementById('subtotal').textContent = `Rp ${product.price.toLocaleString('id-ID')}`;
  document.getElementById('total').textContent = `Rp ${product.price.toLocaleString('id-ID')}`;
  
  // Reset form
  document.getElementById('province').value = '';
  document.getElementById('city').innerHTML = '<option value="">Pilih Kota</option>';
  document.getElementById('courier').value = 'jne';
  document.getElementById('shipping-options').style.display = 'none';
  document.getElementById('shipping-cost').textContent = '-';
  document.getElementById('checkout-btn').disabled = true;
  
  // Load provinces if not loaded
  if (provinces.length === 0) {
    loadProvinces();
  }
  
  // Track event
  trackEvent('AddToCart', {
    content_name: product.name,
    content_ids: [product.id],
    value: product.price,
    currency: 'IDR'
  });
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// ===========================
// SHIPPING CALCULATION
// ===========================

async function loadProvinces() {
  try {
    const response = await fetch(`${CONFIG.API_BASE}/provinces`);
    const data = await response.json();
    
    provinces = data.rajaongkir.results;
    
    const select = document.getElementById('province');
    provinces.forEach(province => {
      const option = document.createElement('option');
      option.value = province.province_id;
      option.textContent = province.province;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading provinces:', error);
    alert('Gagal memuat data provinsi. Silakan refresh halaman.');
  }
}

async function loadCities() {
  const provinceId = document.getElementById('province').value;
  if (!provinceId) return;
  
  const citySelect = document.getElementById('city');
  citySelect.innerHTML = '<option value="">Memuat kota...</option>';
  citySelect.disabled = true;
  
  try {
    const response = await fetch(`${CONFIG.API_BASE}/cities/${provinceId}`);
    const data = await response.json();
    
    cities = data.rajaongkir.results;
    
    citySelect.innerHTML = '<option value="">Pilih Kota</option>';
    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = city.city_id;
      option.textContent = `${city.type} ${city.city_name}`;
      select.appendChild(option);
    });
    
    citySelect.disabled = false;
  } catch (error) {
    console.error('Error loading cities:', error);
    citySelect.innerHTML = '<option value="">Gagal memuat kota</option>';
  }
}

async function calculateShipping() {
  const cityId = document.getElementById('city').value;
  const courier = document.getElementById('courier').value;
  
  if (!cityId || !courier || !selectedProduct) return;
  
  // Show loading
  document.getElementById('loading').style.display = 'flex';
  document.getElementById('shipping-options').style.display = 'none';
  document.getElementById('error-message').style.display = 'none';
  
  try {
    const response = await fetch(`${CONFIG.API_BASE}/shipping-cost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: cityId,
        weight: selectedProduct.weight,
        courier: courier
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to calculate shipping');
    }
    
    const data = await response.json();
    
    // Hide loading
    document.getElementById('loading').style.display = 'none';
    
    // Display shipping options
    if (data.rajaongkir.results[0].costs.length > 0) {
      displayShippingOptions(data.rajaongkir.results[0].costs);
      
      // Track event
      trackEvent('ShippingCalculated', {
        destination: cityId,
        courier: courier
      });
    } else {
      throw new Error('No shipping options available');
    }
    
  } catch (error) {
    console.error('Error calculating shipping:', error);
    document.getElementById('loading').style.display = 'none';
    
    const errorBox = document.getElementById('error-message');
    errorBox.textContent = 'Gagal menghitung ongkir. Silakan coba lagi atau hubungi kami via WhatsApp.';
    errorBox.style.display = 'block';
  }
}

function displayShippingOptions(costs) {
  const container = document.getElementById('services');
  container.innerHTML = '';
  
  costs.forEach((cost, index) => {
    const service = cost.service;
    const price = cost.cost[0].value;
    const etd = cost.cost[0].etd;
    
    const label = document.createElement('label');
    label.className = 'service-option';
    label.innerHTML = `
      <input 
        type="radio" 
        name="shipping" 
        value="${price}" 
        data-service="${service}" 
        data-etd="${etd}"
        onchange="selectShipping(${price}, '${service}', '${etd}')"
        ${index === 0 ? 'checked' : ''}
      >
      <div class="service-info">
        <span class="service-name">${service}</span>
        <span class="service-etd">${etd} hari</span>
      </div>
      <span class="service-price">Rp ${price.toLocaleString('id-ID')}</span>
    `;
    
    container.appendChild(label);
  });
  
  document.getElementById('shipping-options').style.display = 'block';
  
  // Auto-select first option
  if (costs.length > 0) {
    const firstCost = costs[0].cost[0];
    selectShipping(firstCost.value, costs[0].service, firstCost.etd);
  }
}

function selectShipping(price, service, etd) {
  selectedShipping = { price, service, etd };
  
  const subtotal = selectedProduct.price;
  
  // Check free shipping
  let finalShippingCost = price;
  let isFreeShipping = false;
  
  if (subtotal >= CONFIG.FREE_SHIPPING_MIN) {
    finalShippingCost = 0;
    isFreeShipping = true;
  }
  
  const total = subtotal + finalShippingCost;
  
  // Update UI
  if (isFreeShipping) {
    document.getElementById('shipping-cost').innerHTML = '<span class="free">GRATIS</span>';
    document.getElementById('free-shipping-notice').style.display = 'block';
  } else {
    document.getElementById('shipping-cost').textContent = `Rp ${finalShippingCost.toLocaleString('id-ID')}`;
    document.getElementById('free-shipping-notice').style.display = 'none';
  }
  
  document.getElementById('total').textContent = `Rp ${total.toLocaleString('id-ID')}`;
  
  // Enable checkout button
  document.getElementById('checkout-btn').disabled = false;
  
  // Track event
  trackEvent('ShippingSelected', {
    service: service,
    cost: finalShippingCost
  });
}

// ===========================
// WHATSAPP CHECKOUT
// ===========================

function proceedToWhatsApp() {
  if (!selectedProduct || !selectedShipping) {
    alert('Silakan pilih layanan pengiriman terlebih dahulu');
    return;
  }
  
  const province = document.getElementById('province').selectedOptions[0].text;
  const city = document.getElementById('city').selectedOptions[0].text;
  const courier = document.getElementById('courier').selectedOptions[0].text;
  
  const subtotal = selectedProduct.price;
  const shippingCost = subtotal >= CONFIG.FREE_SHIPPING_MIN ? 0 : selectedShipping.price;
  const total = subtotal + shippingCost;
  
  // Get UTM params
  const utm = JSON.parse(localStorage.getItem('utm') || '{}');
  const utmSource = utm.source ? `\n\n[Ref: ${utm.source}/${utm.campaign || 'direct'}]` : '';
  
  const message = `
Halo, saya mau order:

• ${selectedProduct.name} - Rp ${selectedProduct.price.toLocaleString('id-ID')}

Subtotal: Rp ${subtotal.toLocaleString('id-ID')}
Ongkir (${courier} ${selectedShipping.service}): ${shippingCost === 0 ? 'GRATIS' : 'Rp ' + shippingCost.toLocaleString('id-ID')}
*Total: Rp ${total.toLocaleString('id-ID')}*

Tujuan: ${city}, ${province}
Estimasi: ${selectedShipping.etd} hari

Nama: [isi nama]
Alamat lengkap: [isi alamat]
No HP: [isi nomor]

Mohon diproses ya, terima kasih! 🙏${utmSource}
  `.trim();
  
  const waLink = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  
  // Track conversion
  trackEvent('InitiateCheckout', {
    content_name: selectedProduct.name,
    value: total,
    currency: 'IDR',
    num_items: 1
  });
  
  trackEvent('Contact', {
    content_name: selectedProduct.name,
    value: total,
    currency: 'IDR'
  });
  
  // Store pending order
  localStorage.setItem('pending_order', JSON.stringify({
    id: 'ORD_' + Date.now(),
    product: selectedProduct,
    total: total,
    timestamp: new Date().toISOString()
  }));
  
  // Open WhatsApp
  window.open(waLink, '_blank');
  
  // Close modal
  setTimeout(() => {
    closeCheckoutModal();
  }, 500);
}

// ===========================
// TRACKING
// ===========================

function trackEvent(eventName, params) {
  // Meta Pixel
  if (typeof fbq !== 'undefined') {
    if (eventName === 'ShippingCalculated' || eventName === 'ShippingSelected') {
      fbq('trackCustom', eventName, params);
    } else {
      fbq('track', eventName, params);
    }
  }
  
  // Google Analytics
  if (typeof gtag !== 'undefined') {
    const eventMap = {
      'AddToCart': 'add_to_cart',
      'InitiateCheckout': 'begin_checkout',
      'Contact': 'generate_lead'
    };
    
    const gaEvent = eventMap[eventName] || eventName.toLowerCase();
    gtag('event', gaEvent, params);
  }
  
  // GTM Data Layer
  if (typeof dataLayer !== 'undefined') {
    dataLayer.push({
      'event': eventName,
      ...params
    });
  }
}

// Capture UTM parameters
function captureUTM() {
  const params = new URLSearchParams(window.location.search);
  const utm = {
    source: params.get('utm_source'),
    medium: params.get('utm_medium'),
    campaign: params.get('utm_campaign'),
    content: params.get('utm_content'),
    term: params.get('utm_term')
  };
  
  if (utm.source) {
    localStorage.setItem('utm', JSON.stringify(utm));
  }
}

// ===========================
// SCROLL REVEAL
// ===========================

function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
  });
  
  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });
}

// ===========================
// CATEGORY FILTER
// ===========================

function filterByCategory(category) {
  // Smooth scroll to products section
  document.querySelector('.products').scrollIntoView({ behavior: 'smooth' });
  
  // Filter products (if needed)
  // For now, just scroll to section
}

// ===========================
// INITIALIZATION
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  // Capture UTM
  captureUTM();
  
  // Load products
  loadProducts();
  
  // Init scroll reveal
  initScrollReveal();
  
  // Category click handlers
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const category = card.dataset.category;
      filterByCategory(category);
    });
  });
  
  // Close modal on overlay click
  document.querySelector('.modal-overlay')?.addEventListener('click', closeCheckoutModal);
  
  // Close modal on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCheckoutModal();
    }
  });
});

// ===========================
// EXPOSE FUNCTIONS TO GLOBAL
// ===========================

window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.loadCities = loadCities;
window.calculateShipping = calculateShipping;
window.selectShipping = selectShipping;
window.proceedToWhatsApp = proceedToWhatsApp;