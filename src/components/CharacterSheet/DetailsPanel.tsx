import React, { useState } from 'react';
import type { Character } from '../../types/character';
import { QuirkSelector } from '../QuirkSelector/QuirkSelector';
import { BackstorySelector } from '../BackstorySelector/BackstorySelector';
import { DarkSecretSelector } from '../DarkSecretSelector/DarkSecretSelector';
import './DetailsPanel.css';

interface DetailsPanelProps {
  character: Character;
  canEdit: boolean;
  onUpdate: (updates: Partial<Character>) => void;
}

export const DetailsPanel: React.FC<DetailsPanelProps> = ({
  character,
  canEdit,
  onUpdate
}) => {
  const [showQuirkSelector, setShowQuirkSelector] = useState(false);
  const [showBackstorySelector, setShowBackstorySelector] = useState(false);
  const [showDarkSecretSelector, setShowDarkSecretSelector] = useState(false);

  const handleAddQuirk = (quirk: string) => {
    onUpdate({ quirks: [...(character.quirks || []), quirk] });
    setShowQuirkSelector(false);
  };

  const removeQuirk = (index: number) => {
    onUpdate({ quirks: (character.quirks || []).filter((_, i) => i !== index) });
  };

  const handleAddBackstoryEvent = (event: string) => {
    onUpdate({ backstory: [...(character.backstory || []), event] });
    setShowBackstorySelector(false);
  };

  const removeBackstoryEvent = (index: number) => {
    onUpdate({ backstory: (character.backstory || []).filter((_, i) => i !== index) });
  };

  const handleSetDarkSecret = (secret: string) => {
    onUpdate({ darkSecret: secret });
    setShowDarkSecretSelector(false);
  };

  return (
    <div className="details-panel">
      {/* Quirks Section */}
      <div className="details-section">
        <div className="details-section__header">
          <h2 className="details-section__title">Appearance Quirks</h2>
          {canEdit && (
            <button className="details-section__add" onClick={() => setShowQuirkSelector(true)} title="Add quirk">
              +
            </button>
          )}
        </div>

        {(!character.quirks || character.quirks.length === 0) ? (
          <div className="details-empty">No quirks yet</div>
        ) : (
          <div className="details-list">
            {character.quirks.map((quirk, index) => (
              <div key={index} className="details-item">
                <span className="details-item__text">{quirk}</span>
                {canEdit && (
                  <button
                    className="details-item__remove"
                    onClick={() => removeQuirk(index)}
                    title="Remove quirk"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backstory Section */}
      <div className="details-section">
        <div className="details-section__header">
          <h2 className="details-section__title">Backstory Events</h2>
          {canEdit && (
            <button className="details-section__add" onClick={() => setShowBackstorySelector(true)} title="Add event">
              +
            </button>
          )}
        </div>

        {(!character.backstory || character.backstory.length === 0) ? (
          <div className="details-empty">No backstory events yet</div>
        ) : (
          <div className="details-list">
            {character.backstory.map((event, index) => (
              <div key={index} className="details-item">
                <span className="details-item__text">{event}</span>
                {canEdit && (
                  <button
                    className="details-item__remove"
                    onClick={() => removeBackstoryEvent(index)}
                    title="Remove event"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dark Secret Section */}
      <div className="details-section">
        <div className="details-section__header">
          <h2 className="details-section__title">Dark Secret</h2>
          {canEdit && (
            <button
              className="details-section__add"
              onClick={() => setShowDarkSecretSelector(true)}
              title={character.darkSecret ? "Change dark secret" : "Add dark secret"}
            >
              +
            </button>
          )}
        </div>

        {!character.darkSecret ? (
          <div className="details-empty">No dark secret yet</div>
        ) : (
          <div className="details-item details-item--secret">
            <span className="details-item__text">{character.darkSecret}</span>
            {canEdit && (
              <button
                className="details-item__remove"
                onClick={() => onUpdate({ darkSecret: '' })}
                title="Remove dark secret"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {/* Possessions Section */}
      <div className="details-section">
        <h2 className="details-section__title">Possessions</h2>
        {canEdit ? (
          <textarea
            className="details-textarea"
            value={character.possessions || ''}
            onChange={(e) => onUpdate({ possessions: e.target.value })}
            placeholder="Items you carry with you..."
            rows={4}
          />
        ) : (
          <div className="details-readonly">{character.possessions || 'None'}</div>
        )}
      </div>

      {/* Extended Notes Section - Spans both columns */}
      <div className="details-section details-section--full">
        <h2 className="details-section__title">Character History & Notes</h2>
        {canEdit ? (
          <textarea
            className="details-textarea details-textarea--large"
            value={character.extendedNotes || ''}
            onChange={(e) => onUpdate({ extendedNotes: e.target.value })}
            placeholder="Extended character background, relationships, goals, etc..."
            rows={8}
          />
        ) : (
          <div className="details-readonly">{character.extendedNotes || 'None'}</div>
        )}
      </div>

      {showQuirkSelector && (
        <QuirkSelector
          onSelect={handleAddQuirk}
          onClose={() => setShowQuirkSelector(false)}
        />
      )}

      {showBackstorySelector && (
        <BackstorySelector
          onSelect={handleAddBackstoryEvent}
          onClose={() => setShowBackstorySelector(false)}
        />
      )}

      {showDarkSecretSelector && (
        <DarkSecretSelector
          archetype={character.archetype}
          onSelect={handleSetDarkSecret}
          onClose={() => setShowDarkSecretSelector(false)}
        />
      )}
    </div>
  );
};
