import React from 'react';
import './DefinitionModal.css';

interface DefinitionModalProps {
  title: string;
  description: string;
  mechanics: string;
  attribute?: string;
  onClose: () => void;
}

export const DefinitionModal: React.FC<DefinitionModalProps> = ({
  title,
  description,
  mechanics,
  attribute,
  onClose
}) => {
  return (
    <>
      <div className="definition-modal-backdrop" onClick={onClose} />
      <div className="definition-modal">
        <div className="definition-modal__header">
          <h3 className="definition-modal__title">{title}</h3>
          <button
            className="definition-modal__close"
            onClick={onClose}
            title="Close"
          >
            ×
          </button>
        </div>

        <div className="definition-modal__content">
          {attribute && (
            <div className="definition-modal__section">
              <h4 className="definition-modal__section-title">Attribute</h4>
              <p className="definition-modal__text">{attribute.charAt(0).toUpperCase() + attribute.slice(1)}</p>
            </div>
          )}

          <div className="definition-modal__section">
            <h4 className="definition-modal__section-title">Description</h4>
            <p className="definition-modal__text">{description}</p>
          </div>

          <div className="definition-modal__section">
            <h4 className="definition-modal__section-title">Mechanics</h4>
            <p className="definition-modal__text">{mechanics}</p>
          </div>
        </div>
      </div>
    </>
  );
};
