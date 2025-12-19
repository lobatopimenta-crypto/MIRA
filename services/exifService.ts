
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

/**
 * Tenta extrair GPS de vídeos procurando por padrões ISO 6709 no cabeçalho binário.
 * Muitos drones (DJI, GoPro) e smartphones salvam a localização em texto puro nos primeiros KB/MB.
 */
const extractVideoGps = async (file: File): Promise<{ lat: number | null; lng: number | null; timestamp?: string }> => {
  try {
    // Lemos os primeiros 512KB do vídeo (onde geralmente estão os metadados 'moov' ou 'udta')
    const blob = file.slice(0, 512 * 1024);
    const buffer = await blob.arrayBuffer();
    const decoder = new TextDecoder();
    const text = decoder.decode(buffer);

    // Padrão ISO 6709: +45.1234-122.1234/ ou similares
    // Exemplo DJI: [long : -46.123456] [lat : -23.123456] [rel_alt: 10.000]
    const djiLatMatch = text.match(/\[lat\s*:\s*(-?\d+\.\d+)\]/);
    const djiLngMatch = text.match(/\[long\s*:\s*(-?\d+\.\d+)\]/);
    
    if (djiLatMatch && djiLngMatch) {
      return { 
        lat: parseFloat(djiLatMatch[1]), 
        lng: parseFloat(djiLngMatch[1]),
        timestamp: new Date(file.lastModified).toISOString() 
      };
    }

    // Procura por padrão decimal simples (muitas câmeras usam +DD.DDDD+DDD.DDDD)
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
