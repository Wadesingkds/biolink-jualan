// Vercel Function: Get Cities by Province
// Path: api/cities/[provinceId].js

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
    const https = require('https');
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(
      `https://api.rajaongkir.com/starter/city?province=${provinceId}`,
      { 
        headers: { 'key': RAJAONGKIR_API_KEY },
        agent: new https.Agent({
          rejectUnauthorized: true
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('RajaOngkir API error:', response.status, errorText);
      throw new Error(`RajaOngkir API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache for 24 hours (cities rarely change)
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching cities:', error.message, error.stack);
    res.status(500).json({ 
      error: 'fetch failed',
      details: error.message 
    });
  }
}