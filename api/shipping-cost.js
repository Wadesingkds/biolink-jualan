// Vercel Function: Calculate Shipping Cost
// Path: api/shipping-cost.js

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
        courier: courier
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('RajaOngkir API error:', response.status, errorText);
      throw new Error(`RajaOngkir API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache for 1 hour (shipping costs change rarely)
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error calculating shipping:', error);
    res.status(500).json({ error: error.message });
  }
}