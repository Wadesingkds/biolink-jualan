// Vercel Function: Get Cities by Province
// Path: api/cities/[provinceId].js

const https = require('https');

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { provinceId } = req.query;
  
  if (!provinceId) {
    return res.status(400).json({ error: 'Province ID required' });
  }
  
  const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_KEY;
  
  if (!RAJAONGKIR_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  
  try {
    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.rajaongkir.com',
        path: `/starter/city?province=${provinceId}`,
        method: 'GET',
        headers: {
          'key': RAJAONGKIR_API_KEY
        },
        timeout: 10000
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
      
      request.end();
    });
    
    // Cache for 24 hours (cities rarely change)
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching cities:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch cities',
      details: error.message 
    });
  }
}