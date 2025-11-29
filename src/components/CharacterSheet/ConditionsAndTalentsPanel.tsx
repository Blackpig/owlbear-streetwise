import React, { useState } from 'react';
import type { Character } from '../../types/character';
import { DefinitionModal } from '../DefinitionModal/DefinitionModal';
import { TalentSelector } from '../TalentSelector/TalentSelector';
import { TALENT_DEFINITIONS } from '../../data/talentDefinitions';
import './ConditionsAndTalentsPanel.css';

interface ConditionsAndTalentsPanelProps {
  character: Character;
  canEdit: boolean;
  onUpdate: (updates: Partial<Character>) => void;
}

export const ConditionsAndTalentsPanel: React.FC<ConditionsAndTalentsPanelProps> = ({
  character,
  canEdit,
  onUpdate
}) => {
  const [selectedTalent, setSelectedTalent] = useState<string | null>(null);
  const [showTalentSelector, setShowTalentSelector] = useState(false);

  const handleAddTalent = (talentName: string) => {
    onUpdate({
      talents: [...character.talents, talentName]
    });
    setShowTalentSelector(false);
  };

  const removeTalent = (index: number) => {
    onUpdate({
      talents: character.talents.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="conditions-talents-panel">
      {/* Talents */}
      <div className="talents-section">
        <div className="talents-header">
          <h2 className="section-title">Talents</h2>
          {canEdit && (
            <button className="talents-add" onClick={() => setShowTalentSelector(true)} title="Add talent">
              +
            </button>
          )}
        </div>

        {character.talents.length === 0 ? (
          <div className="talents-empty">No talents yet</div>
        ) : (
          <div className="talents-list">
            {character.talents.map((talent, index) => (
              <div key={index} className="talent-item">
                <button
                  className="talent-item__name"
                  onClick={() => setSelectedTalent(talent)}
                  title={`Learn about ${talent}`}
                >
                  {talent}
                </button>
                {canEdit && (
                  <button
                    className="talent-item__remove"
                    onClick={() => removeTalent(index)}
                    title="Remove talent"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTalent && TALENT_DEFINITIONS[selectedTalent] && (
        <DefinitionModal
          title={TALENT_DEFINITIONS[selectedTalent].name}
          description={TALENT_DEFINITIONS[selectedTalent].description}
          mechanics={TALENT_DEFINITIONS[selectedTalent].effect}
          onClose={() => setSelectedTalent(null)}
        />
      )}

      {showTalentSelector && (
        <TalentSelector
          existingTalents={character.talents}
          onSelect={handleAddTalent}
          onClose={() => setShowTalentSelector(false)}
        />
      )}
    </div>
  );
};
