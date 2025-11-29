import React, { useState } from 'react';
import { getAllQuirks } from '../../data/quirkDefinitions';
import { D66Roller } from '../D66Roller/D66Roller';
import './QuirkSelector.css';

interface QuirkSelectorProps {
  onSelect: (quirk: string) => void;
  onClose: () => void;
}

export const QuirkSelector: React.FC<QuirkSelectorProps> = ({
  onSelect,
  onClose
}) => {
  const [selectedQuirk, setSelectedQuirk] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [showRoller, setShowRoller] = useState(false);
  const [lastRoll, setLastRoll] = useState<string | null>(null);
  const quirks = getAllQuirks();

  const handleSelect = () => {
    if (useCustom && customText.trim()) {
      onSelect(customText.trim());
    } else if (selectedQuirk) {
      onSelect(selectedQuirk);
    }
  };

  const handleRollResult = (roll: string) => {
    setShowRoller(false);
    setLastRoll(roll);
    // Find the quirk with this roll ID
    const quirk = quirks.find(q => q.id === roll);
    if (quirk) {
      setSelectedQuirk(quirk.text);
      setUseCustom(false);

      // Scroll to the selected item after a brief delay
      setTimeout(() => {
        const selectedElement = document.querySelector('.quirk-option--selected');
        if (selectedElement) {
          selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  return (
    <>
      <div className="quirk-selector-backdrop" onClick={onClose} />
      <div className="quirk-selector">
        <div className="quirk-selector__header">
          <h3>Select an Appearance Quirk</h3>
          <button className="quirk-selector__close" onClick={onClose}>×</button>
        </div>

        <div className="quirk-selector__content">
          <div className="quirk-selector__toggle">
            <button
              className={`toggle-btn ${!useCustom ? 'toggle-btn--active' : ''}`}
              onClick={() => setUseCustom(false)}
            >
              Select from List
            </button>
            <button
              className="toggle-btn toggle-btn--roll"
              onClick={() => setShowRoller(true)}
            >
              {lastRoll ? `Result: ${lastRoll}` : 'Roll d66'}
            </button>
            <button
              className={`toggle-btn ${useCustom ? 'toggle-btn--active' : ''}`}
              onClick={() => setUseCustom(true)}
            >
              Enter Custom Text
            </button>
          </div>

          {useCustom ? (
            <div className="quirk-selector__custom">
              <textarea
                className="quirk-selector__textarea"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Enter your own appearance quirk..."
                rows={4}
                autoFocus
              />
            </div>
          ) : (
            <div className="quirk-selector__list">
              {quirks.map(({ id, text }) => {
                const isSelected = selectedQuirk === text;

                return (
                  <div
                    key={id}
                    className={`quirk-option ${isSelected ? 'quirk-option--selected' : ''}`}
                    onClick={() => setSelectedQuirk(text)}
                  >
                    <div className="quirk-option__id">{id}</div>
                    <div className="quirk-option__text">{text}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="quirk-selector__footer">
          <button
            className="quirk-selector__btn quirk-selector__btn--cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="quirk-selector__btn quirk-selector__btn--confirm"
            onClick={handleSelect}
            disabled={useCustom ? !customText.trim() : !selectedQuirk}
          >
            Add Quirk
          </button>
        </div>
      </div>

      {showRoller && (
        <D66Roller
          onResult={handleRollResult}
          onClose={() => setShowRoller(false)}
        />
      )}
    </>
  );
};
