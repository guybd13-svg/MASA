import React, { useState, useRef } from 'react';
import { User, Map, Trash2, Camera, Check } from 'lucide-react';
import { compressImage } from '../utils/exifUtils';


interface UserProfile {
  name: string;
  email: string;
  photoURL: string;
}

interface SettingsScreenProps {
  user: UserProfile;
  mapStyle: 'dark' | 'light' | 'osm' | 'satellite';
  onUpdateUser: (updatedUser: UserProfile) => void;
  onUpdateMapStyle: (style: 'dark' | 'light' | 'osm' | 'satellite') => void;
  onClearAllData: () => void;
}

const MAP_STYLES = [
  { id: 'dark', name: 'מצב כהה', desc: 'מינימליסטי ורגוע', color: '#16171d' },
  { id: 'light', name: 'מצב בהיר', desc: 'נקי וקריא', color: '#f3f4f6' },
  { id: 'osm', name: 'מפת דרכים', desc: 'פירוט כבישים מלא', color: '#e5e7eb' },
  { id: 'satellite', name: 'מפת לוויין', desc: 'תמונות לוויין אמיתיות', color: '#1f2937' },
] as const;

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  user,
  mapStyle,
  onUpdateUser,
  onUpdateMapStyle,
  onClearAllData,
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [photoURL, setPhotoURL] = useState(user.photoURL);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await compressImage(file);
        setPhotoURL(url);
      } catch (err) {
        console.error("Avatar compression failed, fallback to Object URL:", err);
        const url = URL.createObjectURL(file);
        setPhotoURL(url);
      }
    }
  };

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name,
      email,
      photoURL,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את כל הנתונים (מפה, תקציב, יומן ורשימות ציוד)? פעולה זו אינה הפיכה.')) {
      onClearAllData();
      alert('הנתונים נמחקו בהצלחה. האתר יאותחל מחדש.');
      window.location.reload();
    }
  };

  return (
    <div className="screen-content">
      {/* Title */}
      <div className="app-header">
        <h2 className="app-title">הגדרות המערכת</h2>
      </div>

      <div className="settings-container" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Profile Settings Card */}
        <div className="checklist-column-card" style={{ padding: '32px' }}>
          <div className="checklist-column-title" style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: '10px' }}>
            <User size={18} />
            <span>פרופיל משתמש</span>
          </div>

          <form onSubmit={handleSubmitProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
            {/* Avatar Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', position: 'relative' }}>
              <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                <img
                  src={photoURL}
                  alt="Avatar"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '3px solid var(--accent-purple)',
                    objectFit: 'cover',
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    backgroundColor: 'var(--accent-purple)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  <Camera size={14} />
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleImageChange}
              />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>לחץ להחלפת תמונה</span>
            </div>

            {/* Profile Fields */}
            <div className="form-group">
              <label>שם מלא</label>
              <input
                type="text"
                required
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>אימייל</label>
              <input
                type="email"
                required
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexDirection: 'row-reverse' }}>
              <button type="submit" className="btn-form-save" style={{ flex: 'none', width: '150px' }}>
                שמור פרופיל
              </button>
              {saveSuccess && (
                <span style={{ color: 'var(--accent-green)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} /> נשמר בהצלחה!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Map Styles Selector */}
        <div className="checklist-column-card" style={{ padding: '32px' }}>
          <div className="checklist-column-title" style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: '10px' }}>
            <Map size={18} />
            <span>סגנון מפת העולם</span>
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginTop: '16px'
            }}
          >
            {MAP_STYLES.map((style) => (
              <div
                key={style.id}
                onClick={() => onUpdateMapStyle(style.id)}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `2px solid ${mapStyle === style.id ? 'var(--accent-purple)' : 'var(--border-color)'}`,
                  borderRadius: '16px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  boxShadow: mapStyle === style.id ? '0 0 12px rgba(157,78,221,0.2)' : 'none',
                }}
              >
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: style.color,
                    border: '1px solid var(--border-color)',
                    marginBottom: '12px'
                  }}
                />
                <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px', color: '#fff' }}>{style.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'right' }}>{style.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="checklist-column-card" style={{ padding: '32px', borderColor: 'rgba(255, 112, 166, 0.2)' }}>
          <div className="checklist-column-title" style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: '10px', color: 'var(--accent-pink)' }}>
            <Trash2 size={18} />
            <span>אזור מסוכן (Danger Zone)</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexDirection: 'row-reverse' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#fff', marginBottom: '4px' }}>איפוס מלא של האפליקציה</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>פעולה זו תמחוק את כל הנתונים, תמונות, הוצאות ורשימות ותנקה את האתר לחלוטין.</div>
            </div>
            <button
              onClick={handleResetData}
              style={{
                backgroundColor: 'rgba(255, 112, 166, 0.1)',
                border: '1px solid rgba(255, 112, 166, 0.3)',
                color: 'var(--accent-pink)',
                padding: '10px 20px',
                borderRadius: '12px',
                fontFamily: 'inherit',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-pink)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 112, 166, 0.1)';
                e.currentTarget.style.color = 'var(--accent-pink)';
              }}
            >
              מחק את כל הנתונים
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
