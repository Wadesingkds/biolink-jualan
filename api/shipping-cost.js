// Vercel Function: Calculate Shipping Cost (Biteship)
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
  
  const BITESHIP_API_KEY = process.env.BITESHIP_API_KEY;
  
  if (!BITESHIP_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  
  // Origin: Kudus, Jawa Tengah
  const ORIGIN_AREA_ID = '5c2e8d8e-4cdb-4e6d-b5e0-1b3f6c8a9e7d'; // Kudus area ID from Biteship
  
  try {
    // Map courier names
    const courierMap = {
      'jne': 'jne',
      'jnt': 'jnt',
      'sicepat': 'sicepat',
      'anteraja': 'anteraja',
      'ninja': 'ninja',
      'idexpress': 'ide'
    };
    
    const biteshipCourier = courierMap[courier.toLowerCase()] || 'jne';
    
    // Prepare request body
    const requestBody = JSON.stringify({
      origin_area_id: ORIGIN_AREA_ID,
      destination_area_id: destination,
      couriers: biteshipCourier,
      items: [{
        name: 'Product',
        value: 100000,
        weight: parseInt(weight),
        quantity: 1
      }]
    });
    
    // Call Biteship API
    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.biteship.com',
        path: '/v1/rates/couriers',
        method: 'POST',
        headers: {
          'Authorization': BITESHIP_API_KEY,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody)
        },
        timeout: 15000
      };
      
      const request = https.request(options, (response) => {
        let body = '';
        
        response.on('data', (chunk) => {
          body += chunk;
        });
        
        response.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve(parsed);
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });
      
      request.on('error', (error) => {
        reject(error);
      });
      
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
      
      request.write(requestBody);
      request.end();
    });
    
    // Transform Biteship response to RajaOngkir format
    const costs = [];
    
    if (data.pricing && Array.isArray(data.pricing)) {
      data.pricing.forEach(pricing => {
        costs.push({
          service: pricing.rate_name || pricing.courier_service_name,
          description: pricing.description || '',
          cost: [{
            value: pricing.price,
            etd: pricing.min_day === pricing.max_day 
              ? `${pricing.min_day}` 
              : `${pricing.min_day}-${pricing.max_day}`,
            note: ''
          }]
        });
      });
    }
    
    // Return in RajaOngkir-compatible format
    const response = {
      rajaongkir: {
        query: {
          origin: ORIGIN_AREA_ID,
          destination: destination,
          weight: weight,
          courier: courier
        },
        status: {
          code: 200,
          description: 'OK'
        },
        origin_details: {
          city_id: ORIGIN_AREA_ID,
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
          code: biteshipCourier,
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