import React, { useState } from 'react';
import { X, Edit2, Trash2, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="btn-icon btn-text" onClick={onClose}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Flashcard = ({ data, onEdit, onDelete, onSelect, isSelected, selectionMode, readOnly = false }) => {
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
      className={`flash-card ${flipped ? 'flipped' : ''} ${isSelected ? 'selected' : ''}`} 
      onClick={handleCardClick}
    >
      <div className="flash-card-inner">
        {/* FRONT */}
        <div className="flash-card-front">
          {/* Hide actions if in ReadOnly (Quiz) or Selection Mode */}
          {!readOnly && (
            <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: '4px', zIndex: 10 }}>
              {selectionMode ? (
                <div style={{
                  width: 24, height: 24, borderRadius: '6px',
                  border: isSelected ? 'none' : '2px solid var(--border)',
                  background: isSelected ? 'var(--primary)' : 'var(--bg-panel)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {isSelected && <Check size={16} color="white" strokeWidth={3} />}
                </div>
              ) : (
                <>
                  <button className="btn-icon btn-text" onClick={(e) => { e.stopPropagation(); onEdit(data); }}><Edit2 size={16} /></button>
                  <button className="btn-icon btn-text hover-danger" onClick={(e) => { e.stopPropagation(); onDelete(data.id); }}><Trash2 size={16} /></button>
                </>
              )}
            </div>
          )}
          <h3>{data.question}</h3>
        </div>

        {/* BACK */}
        <div className="flash-card-back">
          {/* Prevent click propagation on links so users don't flip card when clicking a link */}
          <div className="markdown-content" onClick={e => e.stopPropagation()}>
            <ReactMarkdown 
              components={{
                // Custom renderers to ensure styles fit the card
                p: ({node, ...props}) => <p style={{margin: '0.5rem 0'}} {...props} />,
                code: ({node, inline, ...props}) => (
                  <code style={{
                    background: 'rgba(0,0,0,0.1)', 
                    padding: '2px 4px', 
                    borderRadius: '4px', 
                    fontFamily: 'monospace',
                    fontSize: '0.9em'
                  }} {...props} />
                )
              }}
            >
              {data.answer}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};