import React, { useState } from 'react';
import { X, Edit2, Trash2 } from 'lucide-react'; // Added icons

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1rem'}}>
          <h3>{title}</h3>
          <button className="btn-text" onClick={onClose}><X size={20}/></button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Flashcard = ({ data, onEdit, onDelete, onSelect, isSelected, selectionMode }) => {
  const [flipped, setFlipped] = useState(false);

  const handleCardClick = () => {
    if (selectionMode) {
      onSelect(data.id);
    } else {
      setFlipped(!flipped);
    }
  };

  return (
    <div 
      className={`flash-card ${flipped ? 'flipped' : ''}`} 
      onClick={handleCardClick}
      style={{ 
        border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
        position: 'relative'
      }}
    >
      <div className="flash-card-inner">
        {/* FRONT */}
        <div className="flash-card-front" style={{position:'relative'}}>
          
          {/* Action Buttons (Top Right) */}
          <div style={{
            position: 'absolute', top: 10, right: 10, 
            display: 'flex', gap: '8px', zIndex: 10
          }}>
            {selectionMode ? (
              // Checkbox for Bulk Mode
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                border: '2px solid var(--text-secondary)',
                background: isSelected ? 'var(--accent)' : 'transparent'
              }}/>
            ) : (
              // Edit & Delete Icons
              <>
                <button 
                  className="btn-text" 
                  style={{padding: '4px', minWidth: 'auto'}}
                  onClick={(e) => { e.stopPropagation(); onEdit(data); }}
                >
                  <Edit2 size={16}/>
                </button>
                <button 
                  className="btn-text" 
                  style={{padding: '4px', minWidth: 'auto', color: 'var(--danger)'}}
                  onClick={(e) => { e.stopPropagation(); onDelete(data.id); }}
                >
                  <Trash2 size={16}/>
                </button>
              </>
            )}
          </div>

          <h3>{data.question}</h3>
        </div>

        {/* BACK */}
        <div className="flash-card-back">
          <p>{data.answer}</p>
        </div>
      </div>
    </div>
  );
};