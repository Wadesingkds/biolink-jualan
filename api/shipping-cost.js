// Vercel Function: Calculate Shipping Cost
// Path: api/shipping-cost.js

const https = require('https');
const querystring = require('querystring');

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
  
  const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_KEY;
  const ORIGIN_CITY_ID = 210; // Kudus
  
  if (!RAJAONGKIR_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  
  try {
    const postData = querystring.stringify({
      origin: ORIGIN_CITY_ID,
      destination: destination,
      weight: weight,
      courier: courier
    });
    
    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.rajaongkir.com',
        path: '/starter/cost',
        method: 'POST',
        headers: {
          'key': RAJAONGKIR_API_KEY,
          'content-type': 'application/x-www-form-urlencoded',
          'content-length': Buffer.byteLength(postData)
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
      
      request.write(postData);
      request.end();
    });
    
    // Cache for 1 hour (shipping costs change rarely)
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error calculating shipping:', error.message);
    res.status(500).json({ 
      error: 'Failed to calculate shipping',
      details: error.message 
    });
  }
}