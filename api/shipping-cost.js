// Vercel Function: Calculate Shipping Cost (Simplified with Static Rates)
// Path: api/shipping-cost.js

const https = require('https');

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { destination, weight, courier } = req.body;
  
  if (!destination || !weight || !courier) {
    return res.status(400).json({ 
      error: 'Missing required fields: destination, weight, courier' 
    });
  }
  
  try {
    // Simplified shipping rates (per kg, base rate)
    // Origin: Kudus, Jawa Tengah
    const shippingRates = {
      // Jawa (close)
      'semarang': { jne: 8000, jnt: 7000, sicepat: 7500 },
      'solo': { jne: 10000, jnt: 9000, sicepat: 9500 },
      'kudus': { jne: 5000, jnt: 5000, sicepat: 5000 },
      'pati': { jne: 7000, jnt: 6000, sicepat: 6500 },
      'jepara': { jne: 7000, jnt: 6000, sicepat: 6500 },
      'yogyakarta': { jne: 12000, jnt: 10000, sicepat: 11000 },
      'jakarta-pusat': { jne: 15000, jnt: 12000, sicepat: 13000 },
      'jakarta-utara': { jne: 15000, jnt: 12000, sicepat: 13000 },
      'jakarta-barat': { jne: 15000, jnt: 12000, sicepat: 13000 },
      'jakarta-selatan': { jne: 15000, jnt: 12000, sicepat: 13000 },
      'jakarta-timur': { jne: 15000, jnt: 12000, sicepat: 13000 },
      'bandung': { jne: 16000, jnt: 13000, sicepat: 14000 },
      'surabaya': { jne: 18000, jnt: 15000, sicepat: 16000 },
      'malang': { jne: 20000, jnt: 17000, sicepat: 18000 },
      'bekasi': { jne: 15000, jnt: 12000, sicepat: 13000 },
      'bogor': { jne: 16000, jnt: 13000, sicepat: 14000 },
      'depok': { jne: 15000, jnt: 12000, sicepat: 13000 },
      'tangerang': { jne: 15000, jnt: 12000, sicepat: 13000 },
      'tangerang-selatan': { jne: 15000, jnt: 12000, sicepat: 13000 },
      
      // Sumatera
      'medan': { jne: 35000, jnt: 30000, sicepat: 32000 },
      'palembang': { jne: 30000, jnt: 25000, sicepat: 27000 },
      'padang': { jne: 35000, jnt: 30000, sicepat: 32000 },
      
      // Kalimantan
      'pontianak': { jne: 40000, jnt: 35000, sicepat: 37000 },
      'banjarmasin': { jne: 40000, jnt: 35000, sicepat: 37000 },
      'balikpapan': { jne: 45000, jnt: 40000, sicepat: 42000 },
      'samarinda': { jne: 45000, jnt: 40000, sicepat: 42000 },
      
      // Sulawesi
      'makassar': { jne: 40000, jnt: 35000, sicepat: 37000 },
      
      // Bali
      'denpasar': { jne: 25000, jnt: 22000, sicepat: 23000 },
      
      // Papua
      'jayapura': { jne: 80000, jnt: 75000, sicepat: 77000 }
    };
    
    // Get base rate for destination
    const baseRates = shippingRates[destination] || { jne: 20000, jnt: 17000, sicepat: 18000 };
    
    // Calculate cost based on weight (per 1000g)
    const weightKg = Math.ceil(parseInt(weight) / 1000);
    const courierLower = courier.toLowerCase();
    const baseRate = baseRates[courierLower] || baseRates.jne;
    
    // Services with different speeds
    const services = {
      'jne': [
        { service: 'REG', multiplier: 1.0, etd: '2-3' },
        { service: 'YES', multiplier: 1.7, etd: '1-1' },
        { service: 'OKE', multiplier: 0.8, etd: '3-5' }
      ],
      'jnt': [
        { service: 'REG', multiplier: 1.0, etd: '2-3' },
        { service: 'EXPRESS', multiplier: 1.5, etd: '1-2' }
      ],
      'sicepat': [
        { service: 'REG', multiplier: 1.0, etd: '2-3' },
        { service: 'BEST', multiplier: 1.6, etd: '1-1' },
        { service: 'GOKIL', multiplier: 0.9, etd: '3-4' }
      ]
    };
    
    const courierServices = services[courierLower] || services.jne;
    
    // Calculate costs for each service
    const costs = courierServices.map(svc => ({
      service: svc.service,
      description: `${courier.toUpperCase()} ${svc.service}`,
      cost: [{
        value: Math.round(baseRate * weightKg * svc.multiplier),
        etd: svc.etd,
        note: ''
      }]
    }));
    
    // Return in RajaOngkir-compatible format
    const response = {
      rajaongkir: {
        query: {
          origin: 'kudus',
          destination: destination,
          weight: weight,
          courier: courier
        },
        status: {
          code: 200,
          description: 'OK'
        },
        origin_details: {
          city_id: 'kudus',
          province_id: '10',
          province: 'Jawa Tengah',
          type: 'Kabupaten',
          city_name: 'Kudus',
          postal_code: '59300'
        },
        destination_details: {
          city_id: destination,
          province_id: '',
          province: '',
          type: '',
          city_name: '',
          postal_code: ''
        },
        results: [{
          code: courierLower,
          name: courier.toUpperCase(),
          costs: costs
        }]
      }
    };
    
    // Cache for 1 hour
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error calculating shipping:', error.message);
    res.status(500).json({ 
      error: 'Failed to calculate shipping',
      details: error.message 
    });
  }
}