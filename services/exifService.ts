
// @ts-ignore - EXIF is loaded via script tag in index.html
const EXIF = window.EXIF;

export const extractGpsData = async (file: File): Promise<{ lat: number | null; lng: number | null; timestamp?: string }> => {
  if (file.type.includes('image')) {
    return extractImageGps(file);
  } else if (file.type.includes('video')) {
    return extractVideoGps(file);
  }
  return { lat: null, lng: null };
};

const extractImageGps = (file: File): Promise<{ lat: number | null; lng: number | null; timestamp?: string }> => {
  return new Promise((resolve) => {
    EXIF.getData(file, function(this: any) {
      const lat = EXIF.getTag(this, "GPSLatitude");
      const latRef = EXIF.getTag(this, "GPSLatitudeRef");
      const lng = EXIF.getTag(this, "GPSLongitude");
      const lngRef = EXIF.getTag(this, "GPSLongitudeRef");
      const timestamp = EXIF.getTag(this, "DateTimeOriginal");

      if (lat && lng && latRef && lngRef) {
        const latitude = convertDMSToDecimal(lat[0], lat[1], lat[2], latRef);
        const longitude = convertDMSToDecimal(lng[0], lng[1], lng[2], lngRef);
        resolve({ lat: latitude, lng: longitude, timestamp });
      } else {
        resolve({ lat: null, lng: null });
      }
    });
  });
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
      headers: {
        'Accept-Language': 'pt-BR'
      }
    });
    const data = await response.json();
    if (data && data.address) {
      const { road, house_number, suburb, city, town, village, state } = data.address;
      
      const rua = road || 'Logradouro não identificado';
      const numero = house_number ? `, ${house_number}` : '';
      const bairro = suburb ? `, ${suburb}` : '';
      const cidade = city || town || village || '';
      const estado = state ? ` - ${state}` : '';
      
      return `${rua}${numero}${bairro}, ${cidade}${estado}`.trim();
    }
    return '';
  } catch (error) {
    console.error("Erro na geocodificação reversa:", error);
    return '';
  }
};

export const geocodeAddress = async (address: string): Promise<{lat: number, lng: number} | null> => {
  if (!address) return null;
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (e) {
    console.error("Erro na geocodificação direta:", e);
  }
  return null;
};

export const searchAddress = async (query: string): Promise<string[]> => {
  if (!query || query.length < 3) return [];
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`, {
      headers: {
        'Accept-Language': 'pt-BR'
      }
    });
    const data = await response.json();
    return data.map((item: any) => item.display_name);
  } catch (error) {
    console.error("Erro na busca de endereço:", error);
    return [];
  }
};

const extractVideoGps = async (file: File): Promise<{ lat: number | null; lng: number | null; timestamp?: string }> => {
  try {
    const blob = file.slice(0, 512 * 1024);
    const buffer = await blob.arrayBuffer();
    const decoder = new TextDecoder();
    const text = decoder.decode(buffer);

    const djiLatMatch = text.match(/\[lat\s*:\s*(-?\d+\.\d+)\]/);
    const djiLngMatch = text.match(/\[long\s*:\s*(-?\d+\.\d+)\]/);
    
    if (djiLatMatch && djiLngMatch) {
      return { 
        lat: parseFloat(djiLatMatch[1]), 
        lng: parseFloat(djiLngMatch[1]),
        timestamp: new Date(file.lastModified).toISOString() 
      };
    }

    const isoMatch = text.match(/([+-]\d+\.\d+)([+-]\d+\.\d+)/);
    if (isoMatch) {
      return {
        lat: parseFloat(isoMatch[1]),
        lng: parseFloat(isoMatch[2]),
        timestamp: new Date(file.lastModified).toISOString()
      };
    }

    return { lat: null, lng: null };
  } catch (e) {
    console.error("Erro ao ler metadados de vídeo:", e);
    return { lat: null, lng: null };
  }
};

const convertDMSToDecimal = (degrees: any, minutes: any, seconds: any, direction: string): number => {
  let dd = degrees + minutes / 60 + seconds / 3600;
  if (direction === "S" || direction === "W") {
    dd = dd * -1;
  }
  return dd;
};
