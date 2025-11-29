import React, { useState } from 'react';
import { TALENT_DEFINITIONS } from '../../data/talentDefinitions';
import './TalentSelector.css';

interface TalentSelectorProps {
  existingTalents: string[];
  onSelect: (talentName: string) => void;
  onClose: () => void;
}

export const TalentSelector: React.FC<TalentSelectorProps> = ({
  existingTalents,
  onSelect,
  onClose
}) => {
  const [selectedTalent, setSelectedTalent] = useState<string | null>(null);

  // Get available talents (not already selected)
  const availableTalents = Object.keys(TALENT_DEFINITIONS).filter(
    name => !existingTalents.includes(name)
  );

  const handleSelect = () => {
    if (selectedTalent) {
      onSelect(selectedTalent);
    }
  };

  return (
    <>
      <div className="talent-selector-backdrop" onClick={onClose} />
      <div className="talent-selector">
        <div className="talent-selector__header">
          <h3>Select a Talent</h3>
          <button className="talent-selector__close" onClick={onClose}>×</button>
        </div>

        <div className="talent-selector__content">
          {availableTalents.length === 0 ? (
            <div className="talent-selector__empty">
              You have all available talents!
            </div>
          ) : (
            <div className="talent-selector__list">
              {availableTalents.map(talentName => {
                const talent = TALENT_DEFINITIONS[talentName];
                const isSelected = selectedTalent === talentName;

                return (
                  <div
                    key={talentName}
                    className={`talent-option ${isSelected ? 'talent-option--selected' : ''}`}
                    onClick={() => setSelectedTalent(talentName)}
                  >
                    <div className="talent-option__name">{talent.name}</div>
                    <div className="talent-option__description">{talent.description}</div>
                    <div className="talent-option__effect">{talent.effect}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {availableTalents.length > 0 && (
          <div className="talent-selector__footer">
            <button
              className="talent-selector__btn talent-selector__btn--cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="talent-selector__btn talent-selector__btn--confirm"
              onClick={handleSelect}
              disabled={!selectedTalent}
            >
              Add Talent
            </button>
          </div>
        )}
      </div>
    </>
  );
};
