import React, { useState } from 'react';
import { getDarkSecretsForArchetype } from '../../data/darkSecretDefinitions';
import type { Archetype } from '../../types/character';
import './DarkSecretSelector.css';

interface DarkSecretSelectorProps {
  archetype: Archetype;
  onSelect: (secret: string) => void;
  onClose: () => void;
}

export const DarkSecretSelector: React.FC<DarkSecretSelectorProps> = ({
  archetype,
  onSelect,
  onClose
}) => {
  const [selectedSecret, setSelectedSecret] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const secrets = getDarkSecretsForArchetype(archetype);

  const handleSelect = () => {
    if (useCustom && customText.trim()) {
      onSelect(customText.trim());
    } else if (selectedSecret) {
      onSelect(selectedSecret);
    }
  };

  return (
    <>
      <div className="dark-secret-selector-backdrop" onClick={onClose} />
      <div className="dark-secret-selector">
        <div className="dark-secret-selector__header">
          <h3>Select a Dark Secret</h3>
          <button className="dark-secret-selector__close" onClick={onClose}>×</button>
        </div>

        <div className="dark-secret-selector__content">
          <div className="dark-secret-selector__toggle">
            <button
              className={`toggle-btn ${!useCustom ? 'toggle-btn--active' : ''}`}
              onClick={() => setUseCustom(false)}
            >
              Select from List
            </button>
            <button
              className={`toggle-btn ${useCustom ? 'toggle-btn--active' : ''}`}
              onClick={() => setUseCustom(true)}
            >
              Enter Custom Text
            </button>
          </div>

          {useCustom ? (
            <div className="dark-secret-selector__custom">
              <textarea
                className="dark-secret-selector__textarea"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Enter your own dark secret..."
                rows={4}
                autoFocus
              />
            </div>
          ) : (
            <div className="dark-secret-selector__list">
              {secrets.map(({ id, text }) => {
                const isSelected = selectedSecret === text;

                return (
                  <div
                    key={id}
                    className={`dark-secret-option ${isSelected ? 'dark-secret-option--selected' : ''}`}
                    onClick={() => setSelectedSecret(text)}
                  >
                    <div className="dark-secret-option__id">{id}</div>
                    <div className="dark-secret-option__text">{text}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="dark-secret-selector__footer">
          <button
            className="dark-secret-selector__btn dark-secret-selector__btn--cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="dark-secret-selector__btn dark-secret-selector__btn--confirm"
            onClick={handleSelect}
            disabled={useCustom ? !customText.trim() : !selectedSecret}
          >
            Add Secret
          </button>
        </div>
      </div>
    </>
  );
};
