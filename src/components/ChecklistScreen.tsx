import React, { useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';

interface ChecklistItem {
  id: string;
  name: string;
  completed: boolean;
}

interface ChecklistScreenProps {
  packingItems: ChecklistItem[];
  placesItems: ChecklistItem[];
  onAddItem: (type: 'packing' | 'places', name: string) => void;
  onToggleItem: (type: 'packing' | 'places', id: string) => void;
  onDeleteItem: (type: 'packing' | 'places', id: string) => void;
}

export const ChecklistScreen: React.FC<ChecklistScreenProps> = ({
  packingItems,
  placesItems,
  onAddItem,
  onToggleItem,
  onDeleteItem,
}) => {
  const [packingInputValue, setPackingInputValue] = useState('');
  const [placesInputValue, setPlacesInputValue] = useState('');

  // Calculations for Packing
  const totalPacking = packingItems.length;
  const completedPacking = packingItems.filter((i) => i.completed).length;
  const packingPercent = totalPacking > 0 ? Math.round((completedPacking / totalPacking) * 100) : 0;

  // Calculations for Places
  const totalPlaces = placesItems.length;
  const completedPlaces = placesItems.filter((i) => i.completed).length;
  const placesPercent = totalPlaces > 0 ? Math.round((completedPlaces / totalPlaces) * 100) : 0;

  const handleAddPackingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packingInputValue.trim()) return;
    onAddItem('packing', packingInputValue.trim());
    setPackingInputValue('');
  };

  const handleAddPlacesItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placesInputValue.trim()) return;
    onAddItem('places', placesInputValue.trim());
    setPlacesInputValue('');
  };

  return (
    <div className="screen-content">
      {/* Title */}
      <div className="app-header">
        <h2 className="app-title">רשימות תכנון</h2>
      </div>

      {/* Grid Container */}
      <div className="checklist-grid">
        
        {/* Column 1: Packing List */}
        <div className="checklist-column-card">
          <div className="checklist-column-title">ציוד לטיול</div>
          
          {/* Progress bar */}
          <div className="checklist-progress-container">
            <div style={{ flex: 1, marginLeft: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', flexDirection: 'row-reverse' }}>
                <span>הושלם</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{packingPercent}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                <div className="checklist-progress-fill" style={{ width: `${packingPercent}%` }} />
              </div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {completedPacking}/{totalPacking} פריטים
            </div>
          </div>

          {/* Quick Add Form */}
          <form className="checklist-quick-add" onSubmit={handleAddPackingItem}>
            <input
              type="text"
              className="checklist-input-field"
              value={packingInputValue}
              onChange={(e) => setPackingInputValue(e.target.value)}
              placeholder="הוסף פריט ציוד... (למשל: מטען, בגדים)"
            />
            <button type="submit" className="btn-add-item">
              <Plus size={16} />
            </button>
          </form>

          {/* Items List */}
          <div className="checklist-items-container">
            {packingItems.map((item) => (
              <div className={`checklist-item-row ${item.completed ? 'completed' : ''}`} key={item.id}>
                <button className="btn-delete-item" onClick={() => onDeleteItem('packing', item.id)}>
                  <Trash2 size={13} />
                </button>

                <div className="checklist-item-left" onClick={() => onToggleItem('packing', item.id)}>
                  <span className="checklist-item-text">{item.name}</span>
                  <div className="checkbox-custom">
                    <Check className="checkmark-icon" />
                  </div>
                </div>
              </div>
            ))}

            {packingItems.length === 0 && (
              <div
                style={{
                  padding: '30px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  border: '1px dashed var(--border-color)',
                  borderRadius: '16px',
                  fontSize: '13px',
                }}
              >
                הרשימה ריקה. הוסף פריטים כדי להתחיל לתכנן! 📝
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Places to Visit */}
        <div className="checklist-column-card">
          <div className="checklist-column-title">מקומות לביקור</div>
          
          {/* Progress bar */}
          <div className="checklist-progress-container">
            <div style={{ flex: 1, marginLeft: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', flexDirection: 'row-reverse' }}>
                <span>הושלם</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{placesPercent}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                <div className="checklist-progress-fill" style={{ width: `${placesPercent}%` }} />
              </div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {completedPlaces}/{totalPlaces} יעדים
            </div>
          </div>

          {/* Quick Add Form */}
          <form className="checklist-quick-add" onSubmit={handleAddPlacesItem}>
            <input
              type="text"
              className="checklist-input-field"
              value={placesInputValue}
              onChange={(e) => setPlacesInputValue(e.target.value)}
              placeholder="הוסף יעד לביקור... (למשל: מוזיאון הלובר)"
            />
            <button type="submit" className="btn-add-item">
              <Plus size={16} />
            </button>
          </form>

          {/* Items List */}
          <div className="checklist-items-container">
            {placesItems.map((item) => (
              <div className={`checklist-item-row ${item.completed ? 'completed' : ''}`} key={item.id}>
                <button className="btn-delete-item" onClick={() => onDeleteItem('places', item.id)}>
                  <Trash2 size={13} />
                </button>

                <div className="checklist-item-left" onClick={() => onToggleItem('places', item.id)}>
                  <span className="checklist-item-text">{item.name}</span>
                  <div className="checkbox-custom">
                    <Check className="checkmark-icon" />
                  </div>
                </div>
              </div>
            ))}

            {placesItems.length === 0 && (
              <div
                style={{
                  padding: '30px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  border: '1px dashed var(--border-color)',
                  borderRadius: '16px',
                  fontSize: '13px',
                }}
              >
                הרשימה ריקה. הוסף פריטים כדי להתחיל לתכנן! 📝
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
