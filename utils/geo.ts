
import { GOOGLE_MAPS_API_KEY, GOOGLE_GEOCODING_API_KEY, APP_USER_AGENT } from '../constants';

export interface GeoResult {
  lat: number;
  lon: number;
  displayName: string;
}

/**
 * Formats a raw OpenStreetMap address object or string into standard German format.
 * Target: "Parchwitzerstraße 6, 82256 Fürstenfeldbruck"
 */
export const formatAddress = (raw: any): string => {
  // Handle if raw is just a display_name string (fallback)
  if (typeof raw === 'string') return raw;

  // 1. Extract structured data from OSM object
  const road = raw.road || raw.pedestrian || raw.street || raw.footway || raw.path || '';
  const houseNumber = raw.house_number || '';
  const postcode = raw.postcode || '';
  const city = raw.city || raw.town || raw.village || raw.municipality || raw.county || '';

  // 2. Construct standard format if we have the main components
  if (road && city) {
    // German Format: Street HouseNr, Zip City
    // Handle cases where HouseNr might be empty
    const streetPart = houseNumber ? `${road} ${houseNumber}` : road;
    const cityPart = postcode ? `${postcode} ${city}` : city;
    
    return `${streetPart}, ${cityPart}`;
  }

  // 3. Fallback: Clean up the display_name provided by Nominatim
  if (raw.display_name) {
      const parts = raw.display_name.split(',').map((p: string) => p.trim());
      return parts.slice(0, 3).join(', ');
  }

  return '';
};

/**
 * Uses Google Geocoding API for high-precision (Rooftop) coordinates.
 */
export const getCoordinates = async (address: string): Promise<GeoResult | null> => {
  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_GEOCODING_API_KEY}`);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lon: result.geometry.location.lng,
        displayName: result.formatted_address 
      };
    }
    return null;
  } catch (error) {
    console.error("Google Geocoding error:", error);
    return null;
  }
};

/**
 * Searches for addresses in real-time using OpenStreetMap (Nominatim).
 * - Enforces strict User-Agent to prevent blocking.
 * - Filters for Germany (countrycodes=de).
 * - Prioritizes Bavaria via viewbox (approx coordinates).
 */
export const searchAddress = async (query: string): Promise<GeoResult[]> => {
  if (query.length < 3) return [];
  try {
    // Bavaria (Bayern) Bounding Box approx: 9.0, 47.0 to 14.0, 50.5
    // viewbox=left,top,right,bottom
    const bavariaViewbox = '9.0,50.5,14.0,47.0'; 
    
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=de&viewbox=${bavariaViewbox}&bounded=0`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': APP_USER_AGENT,
        'Accept-Language': 'de-DE,de;q=0.9'
      }
    });
    
    if (!response.ok) {
       console.warn("Nominatim API Error", response.status);
       return [];
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data)) return [];

    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      displayName: formatAddress(item.address || item) 
    }));
  } catch (error) {
    console.error("Autosuggest error:", error);
    return [];
  }
};

/**
 * Uses Zippopotam to fetch City/State from PLZ (Zip Code).
 */
export const getLocationFromPlz = async (plz: string): Promise<{ city: string; state: string } | null> => {
  try {
    const response = await fetch(`https://api.zippopotam.us/de/${plz}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.places && data.places.length > 0) {
      return {
        city: data.places[0]['place name'],
        state: data.places[0]['state']
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const getSatelliteImageUrl = (lat: number, lon: number, zoom = 20, size = '600x400'): string => {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=${zoom}&size=${size}&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`;
};

export const getMapImageUrl = (lat: number, lon: number, zoom = 13, size = '600x300'): string => {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=${zoom}&size=${size}&maptype=roadmap&style=feature:all|element:labels|visibility:off&style=feature:road|element:geometry|color:0xffffff&style=feature:landscape|element:geometry|color:0xf5f5f5&key=${GOOGLE_MAPS_API_KEY}`;
};
