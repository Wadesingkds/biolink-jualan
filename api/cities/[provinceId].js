// Vercel Function: Get Cities by Province (Simplified)
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
  
  try {
    // Static city data for major cities (simplified approach)
    const cityData = {
      '6': [ // DKI Jakarta
        { city_id: 'jakarta-pusat', type: 'Kota', city_name: 'Jakarta Pusat' },
        { city_id: 'jakarta-utara', type: 'Kota', city_name: 'Jakarta Utara' },
        { city_id: 'jakarta-barat', type: 'Kota', city_name: 'Jakarta Barat' },
        { city_id: 'jakarta-selatan', type: 'Kota', city_name: 'Jakarta Selatan' },
        { city_id: 'jakarta-timur', type: 'Kota', city_name: 'Jakarta Timur' }
      ],
      '9': [ // Jawa Barat
        { city_id: 'bandung', type: 'Kota', city_name: 'Bandung' },
        { city_id: 'bekasi', type: 'Kota', city_name: 'Bekasi' },
        { city_id: 'bogor', type: 'Kota', city_name: 'Bogor' },
        { city_id: 'depok', type: 'Kota', city_name: 'Depok' },
        { city_id: 'cirebon', type: 'Kota', city_name: 'Cirebon' },
        { city_id: 'sukabumi', type: 'Kota', city_name: 'Sukabumi' },
        { city_id: 'tasikmalaya', type: 'Kota', city_name: 'Tasikmalaya' }
      ],
      '10': [ // Jawa Tengah
        { city_id: 'semarang', type: 'Kota', city_name: 'Semarang' },
        { city_id: 'solo', type: 'Kota', city_name: 'Surakarta' },
        { city_id: 'kudus', type: 'Kabupaten', city_name: 'Kudus' },
        { city_id: 'pati', type: 'Kabupaten', city_name: 'Pati' },
        { city_id: 'jepara', type: 'Kabupaten', city_name: 'Jepara' },
        { city_id: 'magelang', type: 'Kota', city_name: 'Magelang' },
        { city_id: 'salatiga', type: 'Kota', city_name: 'Salatiga' },
        { city_id: 'tegal', type: 'Kota', city_name: 'Tegal' },
        { city_id: 'pekalongan', type: 'Kota', city_name: 'Pekalongan' }
      ],
      '11': [ // Jawa Timur
        { city_id: 'surabaya', type: 'Kota', city_name: 'Surabaya' },
        { city_id: 'malang', type: 'Kota', city_name: 'Malang' },
        { city_id: 'kediri', type: 'Kota', city_name: 'Kediri' },
        { city_id: 'blitar', type: 'Kota', city_name: 'Blitar' },
        { city_id: 'mojokerto', type: 'Kota', city_name: 'Mojokerto' },
        { city_id: 'madiun', type: 'Kota', city_name: 'Madiun' },
        { city_id: 'pasuruan', type: 'Kota', city_name: 'Pasuruan' },
        { city_id: 'probolinggo', type: 'Kota', city_name: 'Probolinggo' }
      ],
      '5': [ // DI Yogyakarta
        { city_id: 'yogyakarta', type: 'Kota', city_name: 'Yogyakarta' },
        { city_id: 'sleman', type: 'Kabupaten', city_name: 'Sleman' },
        { city_id: 'bantul', type: 'Kabupaten', city_name: 'Bantul' },
        { city_id: 'kulon-progo', type: 'Kabupaten', city_name: 'Kulon Progo' },
        { city_id: 'gunung-kidul', type: 'Kabupaten', city_name: 'Gunung Kidul' }
      ],
      '3': [ // Banten
        { city_id: 'tangerang', type: 'Kota', city_name: 'Tangerang' },
        { city_id: 'tangerang-selatan', type: 'Kota', city_name: 'Tangerang Selatan' },
        { city_id: 'serang', type: 'Kota', city_name: 'Serang' },
        { city_id: 'cilegon', type: 'Kota', city_name: 'Cilegon' }
      ],
      '34': [ // Sumatera Utara
        { city_id: 'medan', type: 'Kota', city_name: 'Medan' },
        { city_id: 'binjai', type: 'Kota', city_name: 'Binjai' },
        { city_id: 'pematang-siantar', type: 'Kota', city_name: 'Pematang Siantar' },
        { city_id: 'tebing-tinggi', type: 'Kota', city_name: 'Tebing Tinggi' }
      ],
      '32': [ // Sumatera Barat
        { city_id: 'padang', type: 'Kota', city_name: 'Padang' },
        { city_id: 'bukittinggi', type: 'Kota', city_name: 'Bukittinggi' },
        { city_id: 'payakumbuh', type: 'Kota', city_name: 'Payakumbuh' }
      ],
      '33': [ // Sumatera Selatan
        { city_id: 'palembang', type: 'Kota', city_name: 'Palembang' },
        { city_id: 'prabumulih', type: 'Kota', city_name: 'Prabumulih' },
        { city_id: 'lubuklinggau', type: 'Kota', city_name: 'Lubuklinggau' }
      ],
      '1': [ // Bali
        { city_id: 'denpasar', type: 'Kota', city_name: 'Denpasar' },
        { city_id: 'badung', type: 'Kabupaten', city_name: 'Badung' },
        { city_id: 'gianyar', type: 'Kabupaten', city_name: 'Gianyar' }
      ],
      '28': [ // Sulawesi Selatan
        { city_id: 'makassar', type: 'Kota', city_name: 'Makassar' },
        { city_id: 'pare-pare', type: 'Kota', city_name: 'Pare-Pare' },
        { city_id: 'palopo', type: 'Kota', city_name: 'Palopo' }
      ],
      '12': [ // Kalimantan Barat
        { city_id: 'pontianak', type: 'Kota', city_name: 'Pontianak' },
        { city_id: 'singkawang', type: 'Kota', city_name: 'Singkawang' }
      ],
      '13': [ // Kalimantan Selatan
        { city_id: 'banjarmasin', type: 'Kota', city_name: 'Banjarmasin' },
        { city_id: 'banjarbaru', type: 'Kota', city_name: 'Banjarbaru' }
      ],
      '15': [ // Kalimantan Timur
        { city_id: 'balikpapan', type: 'Kota', city_name: 'Balikpapan' },
        { city_id: 'samarinda', type: 'Kota', city_name: 'Samarinda' },
        { city_id: 'bontang', type: 'Kota', city_name: 'Bontang' }
      ],
      '24': [ // Papua
        { city_id: 'jayapura', type: 'Kota', city_name: 'Jayapura' }
      ]
    };
    
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
    const cities = cityData[provinceId] || [];
    
    // Transform to RajaOngkir format
    const results = cities.map(city => ({
      city_id: city.city_id,
      province_id: provinceId,
      province: provinceName,
      type: city.type,
      city_name: city.city_name,
      postal_code: ''
    }));
    
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
        results: results
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