import { useState, useEffect } from 'react';
import { MapPin, Calendar, Edit2, Trash2 } from 'lucide-react';

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

interface TimelineScreenProps {
  entries: TimelineEntry[];
  onUpdateNote: (id: string, note: string) => void;
  onDeleteEntry: (id: string) => void;
  highlightedEntryId?: string | null;
}

export const TimelineScreen: React.FC<TimelineScreenProps> = ({ 
  entries, 
  onUpdateNote, 
  onDeleteEntry,
  highlightedEntryId
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');

  const handleStartEdit = (entry: TimelineEntry) => {
    setEditingId(entry.id);
    setEditVal(entry.note);
  };

  const handleSaveEdit = (id: string) => {
    onUpdateNote(id, editVal);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // Sort entries by date/id descending (newest first)
  const sortedEntries = [...entries].reverse();

  useEffect(() => {
    if (highlightedEntryId) {
      console.log("Scrolling to highlighted timeline card:", highlightedEntryId);
      const element = document.getElementById(`timeline-card-${highlightedEntryId}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    }
  }, [highlightedEntryId]);

  return (
    <div className="screen-content">
      {/* Header */}
      <div className="app-header">
        <h2 className="app-title">יומן מסע</h2>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{entries.length} חוויות נשמרו</span>
      </div>

      <div className="timeline-grid">
        {sortedEntries.map((entry) => {
          const isEditing = editingId === entry.id;

          return (
            <div 
              className={`timeline-card ${entry.id === highlightedEntryId ? 'highlighted-pulse' : ''}`} 
              key={entry.id}
              id={`timeline-card-${entry.id}`}
            >
              {/* Image Frame */}
              <div className="timeline-image-wrapper">
                <img src={entry.imageUrl} alt={entry.location.name} />
                <div className="timeline-meta-overlay">
                  <div className="timeline-location">
                    <MapPin size={12} style={{ color: 'var(--accent-pink)' }} />
                    <span>{entry.location.name}</span>
                  </div>
                  <div className="timeline-date">
                    <Calendar size={12} style={{ marginLeft: '4px', display: 'inline', verticalAlign: 'middle' }} />
                    <span>{entry.date}</span>
                  </div>
                </div>
              </div>

              {/* Notes content */}
              <div className="timeline-content-area">
                {isEditing ? (
                  <div>
                    <textarea
                      className="timeline-note-input"
                      value={editVal}
                      onChange={(e) => setEditVal(e.target.value)}
                      rows={3}
                      placeholder="הוסף כמה מילים על הרגע הזה..."
                      autoFocus
                    />
                    <div className="timeline-edit-row">
                      <button className="btn-timeline-save" onClick={() => handleSaveEdit(entry.id)}>
                        שמור
                      </button>
                      <button 
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} 
                        onClick={handleCancelEdit}
                      >
                        ביטול
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="timeline-note-text">{entry.note}</p>
                    <div className="timeline-edit-row" style={{ justifyContent: 'space-between', width: '100%', flexDirection: 'row-reverse' }}>
                      <button className="btn-timeline-edit" onClick={() => handleStartEdit(entry)}>
                        <Edit2 size={10} style={{ marginLeft: '4px' }} />
                        <span>ערוך הערה</span>
                      </button>
                      <button 
                        className="btn-delete-trans" 
                        onClick={() => {
                          if (window.confirm('האם אתה בטוח שברצונך למחוק תמונה זו מהיומן ומהמפה?')) {
                            onDeleteEntry(entry.id);
                          }
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                      >
                        <Trash2 size={12} />
                        <span>מחק</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {entries.length === 0 && (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              border: '1px dashed var(--border-color)',
              borderRadius: '24px',
              fontSize: '14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '28px' }}>📸</span>
            <div>אין חוויות ביומן עדיין.</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              עבור למסך המפה והעלה תמונה כדי להוסיף רגעים חדשים ליומן!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
