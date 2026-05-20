// Vercel Function: Get Cities by Province (Biteship)
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
  
  const BITESHIP_API_KEY = process.env.BITESHIP_API_KEY;
  
  if (!BITESHIP_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  
  try {
    // Map province ID to province name
    const provinceMap = {
      '1': 'Bali', '2': 'Bangka Belitung', '3': 'Banten', '4': 'Bengkulu',
      '5': 'DI Yogyakarta', '6': 'DKI Jakarta', '7': 'Gorontalo', '8': 'Jambi',
      '9': 'Jawa Barat', '10': 'Jawa Tengah', '11': 'Jawa Timur',
      '12': 'Kalimantan Barat', '13': 'Kalimantan Selatan', '14': 'Kalimantan Tengah',
      '15': 'Kalimantan Timur', '16': 'Kalimantan Utara', '17': 'Kepulauan Riau',
      '18': 'Lampung', '19': 'Maluku', '20': 'Maluku Utara',
      '21': 'Nanggroe Aceh Darussalam (NAD)', '22': 'Nusa Tenggara Barat (NTB)',
      '23': 'Nusa Tenggara Timur (NTT)', '24': 'Papua', '25': 'Papua Barat',
      '26': 'Riau', '27': 'Sulawesi Barat', '28': 'Sulawesi Selatan',
      '29': 'Sulawesi Tengah', '30': 'Sulawesi Tenggara', '31': 'Sulawesi Utara',
      '32': 'Sumatera Barat', '33': 'Sumatera Selatan', '34': 'Sumatera Utara'
    };
    
    const provinceName = provinceMap[provinceId];
    
    if (!provinceName) {
      return res.status(404).json({ error: 'Province not found' });
    }
    
    // Fetch cities from Biteship API
    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.biteship.com',
        path: `/v1/maps/areas?countries=ID&input=${encodeURIComponent(provinceName)}&type=single`,
        method: 'GET',
        headers: {
          'Authorization': BITESHIP_API_KEY,
          'Content-Type': 'application/json'
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
    
    // Transform Biteship response to RajaOngkir format
    const cities = [];
    
    if (data.areas && Array.isArray(data.areas)) {
      data.areas.forEach((area, index) => {
        if (area.administrative_division_level === 2) { // City/Kabupaten level
          cities.push({
            city_id: area.id,
            province_id: provinceId,
            province: provinceName,
            type: area.name.startsWith('Kota') ? 'Kota' : 'Kabupaten',
            city_name: area.name.replace(/^(Kota|Kabupaten)\s+/, ''),
            postal_code: ''
          });
        }
      });
    }
    
    // Return in RajaOngkir-compatible format
    const response = {
      rajaongkir: {
        query: {
          province: provinceId
        },
        status: {
          code: 200,
          description: 'OK'
        },
        results: cities
      }
    };
    
    // Cache for 24 hours
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching cities:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch cities',
      details: error.message 
    });
  }
}