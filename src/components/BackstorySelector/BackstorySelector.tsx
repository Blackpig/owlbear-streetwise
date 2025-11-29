import React, { useState } from 'react';
import { getAllBackstoryEvents } from '../../data/backstoryDefinitions';
import { D66Roller } from '../D66Roller/D66Roller';
import './BackstorySelector.css';

interface BackstorySelectorProps {
  onSelect: (event: string) => void;
  onClose: () => void;
}

export const BackstorySelector: React.FC<BackstorySelectorProps> = ({
  onSelect,
  onClose
}) => {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [showRoller, setShowRoller] = useState(false);
  const [lastRoll, setLastRoll] = useState<string | null>(null);
  const events = getAllBackstoryEvents();

  const handleSelect = () => {
    if (useCustom && customText.trim()) {
      onSelect(customText.trim());
    } else if (selectedEvent) {
      onSelect(selectedEvent);
    }
  };

  const handleRollResult = (roll: string) => {
    setShowRoller(false);
    setLastRoll(roll);
    // Find the event with this roll ID
    const event = events.find(e => e.id === roll);
    if (event) {
      setSelectedEvent(event.text);
      setUseCustom(false);

      // Scroll to the selected item after a brief delay
      setTimeout(() => {
        const selectedElement = document.querySelector('.backstory-option--selected');
        if (selectedElement) {
          selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  return (
    <>
      <div className="backstory-selector-backdrop" onClick={onClose} />
      <div className="backstory-selector">
        <div className="backstory-selector__header">
          <h3>Select a Backstory Event</h3>
          <button className="backstory-selector__close" onClick={onClose}>×</button>
        </div>

        <div className="backstory-selector__content">
          <div className="backstory-selector__toggle">
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
            <div className="backstory-selector__custom">
              <textarea
                className="backstory-selector__textarea"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Enter your own backstory event..."
                rows={4}
                autoFocus
              />
            </div>
          ) : (
            <div className="backstory-selector__list">
              {events.map(({ id, text }) => {
                const isSelected = selectedEvent === text;

                return (
                  <div
                    key={id}
                    className={`backstory-option ${isSelected ? 'backstory-option--selected' : ''}`}
                    onClick={() => setSelectedEvent(text)}
                  >
                    <div className="backstory-option__id">{id}</div>
                    <div className="backstory-option__text">{text}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="backstory-selector__footer">
          <button
            className="backstory-selector__btn backstory-selector__btn--cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="backstory-selector__btn backstory-selector__btn--confirm"
            onClick={handleSelect}
            disabled={useCustom ? !customText.trim() : !selectedEvent}
          >
            Add Event
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
