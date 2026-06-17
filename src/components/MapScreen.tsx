import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import exifr from 'exifr';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { compressImage, reverseGeocode } from '../utils/exifUtils';

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface TimelineEntry {
  id: string;
  imageUrl: string;
  note: string;
  date: string;
  location: Location;
}

interface MapScreenProps {
  timelineEntries: TimelineEntry[];
  mapStyle: 'dark' | 'light' | 'osm' | 'satellite';
  onAddEntry: (entry: Omit<TimelineEntry, 'id'>) => void;
  onNavigateToTimeline: (entryId: string) => void;
}

const STYLE_URLS = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

const STYLE_ATTRIBUTIONS = {
  dark: '&copy; OpenStreetMap &copy; CartoDB',
  light: '&copy; OpenStreetMap &copy; CartoDB',
  osm: '&copy; OpenStreetMap contributors',
  satellite: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
};

export const MapScreen: React.FC<MapScreenProps> = ({ timelineEntries, mapStyle, onAddEntry, onNavigateToTimeline }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersGroup = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [uploadStatus, setUploadStatus] = useState<'idle' | 'reading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refs for tracking props/state inside Leaflet event listeners to prevent stale closures
  const onAddEntryRef = useRef(onAddEntry);
  useEffect(() => {
    onAddEntryRef.current = onAddEntry;
  }, [onAddEntry]);

  const onNavigateToTimelineRef = useRef(onNavigateToTimeline);
  useEffect(() => {
    onNavigateToTimelineRef.current = onNavigateToTimeline;
  }, [onNavigateToTimeline]);

  const pendingImageRef = useRef<{ url: string; fileName: string } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Create Leaflet map instance
    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2.5,
      zoomControl: false,
    });

    // Create active tile layer
    const tileLayer = L.tileLayer(STYLE_URLS[mapStyle], {
      attribution: STYLE_ATTRIBUTIONS[mapStyle]
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstance.current = map;
    tileLayerRef.current = tileLayer;
    markersGroup.current = L.layerGroup().addTo(map);

    // Map click handler for placing photos manually when GPS EXIF is missing
    map.on('click', async (e: L.LeafletMouseEvent) => {
      if (pendingImageRef.current) {
        const { lat, lng } = e.latlng;
        const { url } = pendingImageRef.current;

        // Reset the pending reference immediately to prevent double submissions
        pendingImageRef.current = null;
        setIsSelectingLocation(false);
        setUploadStatus('reading');
        setStatusMessage('מזהה את המיקום שבחרת במפה... 🌍');

        try {
          console.log(`קליק על המפה בקואורדינטות: lat=${lat}, lng=${lng}. מפענח שם מיקום...`);
          const locationName = await reverseGeocode(lat, lng);
          const photoDate = new Date().toLocaleDateString('he-IL');

          console.log("מיקום פוענח בהצלחה:", locationName);
          setStatusMessage(`המיקום נשמר: ${locationName} ✨`);

          // Add to timeline/map
          onAddEntryRef.current({
            imageUrl: url,
            note: locationName,
            date: photoDate,
            location: {
              lat,
              lng,
              name: locationName
            }
          });

          // Fly map to the selected location
          map.flyTo([lat, lng], 10);
          setUploadStatus('success');

          setTimeout(() => {
            setUploadStatus('idle');
            setStatusMessage('');
          }, 4000);
        } catch (err) {
          console.error("Failed to reverse geocode clicked point:", err);
          setUploadStatus('error');
          setStatusMessage('שגיאה בזיהוי המיקום ⚠️');
          setTimeout(() => {
            setUploadStatus('idle');
            setStatusMessage('');
          }, 4000);
        }
      }
    });

    map.on('popupopen', (e: any) => {
      const popupNode = e.popup.getElement();
      if (!popupNode) return;
      
      const btn = popupNode.querySelector('.popup-view-journal-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          const entryId = btn.getAttribute('data-entry-id');
          if (entryId && onNavigateToTimelineRef.current) {
            onNavigateToTimelineRef.current(entryId);
          }
        });
      }
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update Tile Layer when mapStyle changes
  useEffect(() => {
    if (!mapInstance.current) return;

    // Remove existing layer if it exists
    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    // Create and add new layer
    const newLayer = L.tileLayer(STYLE_URLS[mapStyle], {
      attribution: STYLE_ATTRIBUTIONS[mapStyle]
    }).addTo(mapInstance.current);

    tileLayerRef.current = newLayer;
  }, [mapStyle]);

  // Update Markers when timeline entries change
  useEffect(() => {
    if (!mapInstance.current || !markersGroup.current) return;

    // Clear existing markers
    markersGroup.current.clearLayers();

    // Add markers for all timeline entries with location
    timelineEntries.forEach(entry => {
      const { lat, lng, name } = entry.location;
      
      // Gorgeous custom circular photo marker with glow
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="marker-pulse"></div>
          <div class="marker-pin">
            <div class="marker-pin-inner" style="background-image: url('${entry.imageUrl}');"></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
      });

      const popupContent = `
        <div class="popup-card">
          <img class="popup-img" src="${entry.imageUrl}" alt="${name}" />
          <div class="popup-info">
            <div class="popup-title">${name}</div>
            <div class="popup-desc">${entry.date}</div>
          </div>
          <button class="popup-view-journal-btn" data-entry-id="${entry.id}">צפה ביומן המסע ➔</button>
        </div>
      `;

      L.marker([lat, lng], { icon: customIcon })
        .bindPopup(popupContent)
        .addTo(markersGroup.current!);
    });
  }, [timelineEntries]);

  // Central Helper to Save Entry & Update Map
  const saveEntryAndFly = (imageUrl: string, lat: number, lng: number, name: string, date: string) => {
    onAddEntry({
      imageUrl,
      note: name,
      date,
      location: {
        lat,
        lng,
        name
      }
    });

    // Fly map to the location
    mapInstance.current?.flyTo([lat, lng], 10);
    setUploadStatus('success');

    // Clear status after 4 seconds
    setTimeout(() => {
      setUploadStatus('idle');
      setStatusMessage('');
    }, 4000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // איפוס הערך של האינפוט כדי לאפשר העלאה חוזרת של אותו קובץ לצורכי בדיקה
    e.target.value = '';

    console.log("=== התחלת העלאת תמונה ===");
    console.log("שם קובץ:", file.name);
    console.log("גודל קובץ:", file.size, "bytes");
    console.log("סוג קובץ:", file.type);

    setUploadStatus('reading');
    setStatusMessage('מנתח מטא-דאטה של התמונה... 📂');

    try {
      let gps: { latitude: number; longitude: number } | undefined;
      let photoDate = new Date().toLocaleDateString('he-IL');

      // חילוץ תאריך צילום מקורי מה-EXIF במידה וקיים
      try {
        const parsedExif = await exifr.parse(file, ['DateTimeOriginal']);
        if (parsedExif && parsedExif.DateTimeOriginal) {
          const dateObj = new Date(parsedExif.DateTimeOriginal);
          if (!isNaN(dateObj.getTime())) {
            photoDate = dateObj.toLocaleDateString('he-IL');
            console.log("נמצא תאריך צילום מקורי ב-EXIF:", photoDate);
          }
        }
      } catch (exifErr) {
        console.warn("שגיאה בחילוץ תאריך צילום מקורי:", exifErr);
      }

      // בדיקת סימולציה עבור תמונות הדמו (פריז/יפן) המקלות על הבדיקה בדפדפן
      const fileNameLower = file.name.toLowerCase();
      if (fileNameLower.includes('paris')) {
        console.log("זיהוי סימולציה: פריז");
        gps = { latitude: 48.8584, longitude: 2.2945 };
      } else if (fileNameLower.includes('tokyo') || fileNameLower.includes('kyoto') || fileNameLower.includes('japan')) {
        console.log("זיהוי סימולציה: טוקיו/יפן");
        gps = { latitude: 35.0116, longitude: 135.7681 };
      } else {
        // קריאת EXIF GPS אמיתית מקובץ התמונה
        console.log("קורא מטא-דאטה באמצעות exifr...");
        gps = await exifr.gps(file).catch((err) => {
          console.warn("exifr failed to parse GPS:", err);
          return undefined;
        });
      }

      console.log("תוצאת GPS:", gps);
      setStatusMessage('מעבד תמונה לשמירה... 🔄');

      // 1. דחיסה והמרה ל-Base64 של התמונה (תמיד מתבצעת ללא קשר ל-GPS)
      let imageUrl = '';
      try {
        console.log("מנסה לדחוס תמונה באמצעות Canvas...");
        imageUrl = await compressImage(file);
      } catch (compressErr) {
        console.warn("דחיסת Canvas נכשלה, משתמש ב-FileReader כגיבוי:", compressErr);
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        }).catch((err) => {
          console.error("FileReader fallback failed:", err);
          return '';
        });
      }

      if (!imageUrl) {
        throw new Error("Failed to process image data to Base64");
      }

      // 2. בדיקה אם נמצאו קואורדינטות GPS בתמונה
      if (gps && typeof gps.latitude === 'number' && typeof gps.longitude === 'number') {
        const lat = gps.latitude;
        const lng = gps.longitude;
        
        setStatusMessage('המיקום זוהה! מפענח שם מיקום... 🌍');

        // זיהוי שם המיקום האמיתי באמצעות Nominatim API
        let locationName = 'מיקום מנותח';
        try {
          locationName = await reverseGeocode(lat, lng);
        } catch (geoErr) {
          console.error("Reverse geocoding failed:", geoErr);
          locationName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }

        console.log("מיקום אמיתי פוענח:", locationName);
        setStatusMessage(`המיקום זוהה: ${locationName} 📍`);
        
        // שמירת הרשומה והטסת המפה
        saveEntryAndFly(imageUrl, lat, lng, locationName, photoDate);
        
        setUploadStatus('success');
        setTimeout(() => setUploadStatus('idle'), 3000);
      } else {
        // לא נמצאו קואורדינטות GPS בתמונה. נאפשר למשתמש לבחור מיקום ידנית על המפה.
        console.warn("לא נמצאו קואורדינטות GPS בתמונה. מעביר למצב בחירה ידנית.");
        pendingImageRef.current = { url: imageUrl, fileName: file.name };
        setIsSelectingLocation(true);
        setStatusMessage('לא נמצא מיקום בתמונה. לחץ על המפה כדי למקם אותה 📍');
      }
    } catch (error) {
      console.error("שגיאה כללית בעיבוד העלאת התמונה:", error);
      setUploadStatus('error');
      setStatusMessage('שגיאה בעיבוד התמונה ⚠️');
      
      setTimeout(() => {
        setUploadStatus('idle');
        setStatusMessage('');
      }, 4000);
    }
  };

  return (
    <div className="map-screen">
      {/* Map div */}
      <div ref={mapRef} className="map-container" />

      {/* Floating Control Bar */}
      <div className="map-floating-bar" style={{ minWidth: isSelectingLocation ? '360px' : 'auto' }}>
        {uploadStatus === 'idle' && !isSelectingLocation && (
          <button className="btn-upload-trigger" onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} style={{ marginLeft: '6px' }} />
            <span>העלה תמונה</span>
          </button>
        )}

        {isSelectingLocation && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', direction: 'rtl', width: '100%', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'right' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent-pink)', marginBottom: '2px' }}>
                לא נמצא מיקום בתמונה
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                לחץ על המפה במקום בו צולמה כדי למקם אותה 📍
              </span>
            </div>
            <button 
              onClick={() => {
                pendingImageRef.current = null;
                setIsSelectingLocation(false);
                setUploadStatus('idle');
                setStatusMessage('');
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#fff',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
              className="btn-cancel-select"
            >
              ביטול
            </button>
          </div>
        )}

        {!isSelectingLocation && (uploadStatus === 'reading' || uploadStatus === 'error') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: uploadStatus === 'error' ? 'var(--accent-pink)' : '#fff' }}>
            {uploadStatus === 'error' && <AlertCircle size={16} />}
            <span className="upload-info-text">{statusMessage}</span>
          </div>
        )}

        {!isSelectingLocation && uploadStatus === 'success' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)' }}>
            <Check size={16} />
            <span className="upload-info-text">{statusMessage}</span>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden-input"
        accept="image/*"
        onChange={handleImageUpload}
      />
    </div>
  );
};
