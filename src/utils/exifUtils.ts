import exifr from 'exifr';

export interface GPSCoordinates {
  lat: number;
  lng: number;
}

/**
 * Converts Degrees, Minutes, Seconds (DMS) coordinates to Decimal Degrees (DD).
 * Formula: DD = Degrees + (Minutes / 60) + (Seconds / 3600)
 * South (S) and West (W) coordinates are negative.
 * 
 * @param dms - Array containing [Degrees, Minutes, Seconds]
 * @param ref - Direction reference ('N', 'S', 'E', 'W')
 */
export function convertDMSToDD(dms: number[] | any[], ref: string): number {
  if (!dms || dms.length < 3) return 0;
  
  // Extract values, handling rational number objects if returned by older exif parsers
  const getVal = (val: any): number => {
    if (typeof val === 'number') return val;
    if (val && typeof val === 'object' && 'numerator' in val && 'denominator' in val) {
      return val.numerator / val.denominator;
    }
    return parseFloat(val) || 0;
  };

  const degrees = getVal(dms[0]);
  const minutes = getVal(dms[1]);
  const seconds = getVal(dms[2]);

  let dd = degrees + (minutes / 60) + (seconds / 3600);

  if (ref === 'S' || ref === 'W') {
    dd = -dd;
  }

  return dd;
}

/**
 * Extracts GPS coordinates from an image file.
 * Uses the 'exifr' library to read EXIF metadata.
 * Demonstrates manual DMS to DD conversion if raw tags are present.
 * 
 * @param file - The uploaded image file (Blob/File)
 * @returns GPSCoordinates or null if no GPS data is present
 */
export async function extractGPSFromPhoto(file: File): Promise<GPSCoordinates | null> {
  try {
    // Parse raw EXIF tags from the image file
    const exif = await exifr.parse(file, ['GPSLatitude', 'GPSLatitudeRef', 'GPSLongitude', 'GPSLongitudeRef']);
    
    if (exif && exif.GPSLatitude && exif.GPSLatitudeRef && exif.GPSLongitude && exif.GPSLongitudeRef) {
      const lat = convertDMSToDD(exif.GPSLatitude, exif.GPSLatitudeRef);
      const lng = convertDMSToDD(exif.GPSLongitude, exif.GPSLongitudeRef);
      return { lat, lng };
    }
    
    // Fallback: use exifr's direct gps helper
    const gps = await exifr.gps(file);
    if (gps && gps.latitude && gps.longitude) {
      return { lat: gps.latitude, lng: gps.longitude };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing EXIF metadata:', error);
    return null;
  }
}

/**
 * Compresses an image file and returns a Base64 data URL.
 * Keeps maximum dimension (width or height) within 800px to fit in localStorage.
 */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string); // fallback to original Base64 if context creation fails
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => {
        reject(err);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => {
      reject(err);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Performs reverse geocoding using OpenStreetMap Nominatim API to get a human-readable location name.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=he,en`, {
      headers: {
        'User-Agent': 'MasaTravelApp/1.0'
      }
    });
    const data = await response.json();
    if (data && data.address) {
      const addr = data.address;
      const place = data.name || addr.tourism || addr.historic || addr.amenity || addr.building;
      const city = addr.city || addr.town || addr.village || addr.suburb || addr.city_district;
      const country = addr.country;

      if (place && city) {
        return `${place}, ${city}`;
      } else if (city && country) {
        return `${city}, ${country}`;
      } else if (place && country) {
        return `${place}, ${country}`;
      } else if (country) {
        return country;
      }
    }
    return data.display_name ? data.display_name.split(',').slice(0, 2).join(',') : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (err) {
    console.error("Reverse geocoding failed:", err);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}


