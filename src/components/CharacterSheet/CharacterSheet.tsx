import React, { useState } from 'react';
import type { Character } from '../../types/character';
import { CharacterHeader } from './CharacterHeader';
import { AttributesPanel } from './AttributesPanel';
import { SkillsPanel } from './SkillsPanel';
import { ConditionsAndTalentsPanel } from './ConditionsAndTalentsPanel';
import { DetailsPanel } from './DetailsPanel';
import './CharacterSheet.css';

interface CharacterSheetProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  onRollSkill: (attribute: number, skill: number, skillName: string, skillId: string) => void;
  onRollAttribute: (attribute: number, attributeName: string, attributeKey: string) => void;
  canEdit?: boolean;
  playerId: string;
  isGM: boolean;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({
  character,
  onUpdate,
  onRollSkill,
  onRollAttribute,
  canEdit = true,
  playerId,
  isGM
}) => {
  const [activeTab, setActiveTab] = useState<'combat' | 'details'>('combat');

  return (
    <div className="character-sheet-grid">
      {/* Header Row - spans full width */}
      <div className="character-sheet-grid__header">
        <CharacterHeader
          character={character}
          canEdit={canEdit}
          onUpdate={onUpdate}
          playerId={playerId}
          isGM={isGM}
        />
      </div>

      {/* Tabs */}
      <div className="character-sheet-tabs">
        <button
          className={`character-sheet-tab ${activeTab === 'combat' ? 'character-sheet-tab--active' : ''}`}
          onClick={() => setActiveTab('combat')}
        >
          Attributes & Skills
        </button>
        <button
          className={`character-sheet-tab ${activeTab === 'details' ? 'character-sheet-tab--active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details & Background
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'combat' ? (
        <div className="character-sheet-grid__content">
          {/* Left Column */}
          <div className="character-sheet-grid__column">
            <AttributesPanel
              character={character}
              canEdit={canEdit}
              onUpdate={onUpdate}
              onRollAttribute={onRollAttribute}
            />
            <ConditionsAndTalentsPanel
              character={character}
              canEdit={canEdit}
              onUpdate={onUpdate}
            />
          </div>

          {/* Skills Column - Spans 2 columns */}
          <div className="character-sheet-grid__column character-sheet-grid__column--span-2">
            <SkillsPanel
              character={character}
              canEdit={canEdit}
              onUpdate={onUpdate}
              onRollSkill={onRollSkill}
            />
          </div>
        </div>
      ) : (
        <div className="character-sheet-grid__content character-sheet-grid__content--single">
          <DetailsPanel
            character={character}
            canEdit={canEdit}
            onUpdate={onUpdate}
          />
        </div>
      )}
    </div>
  );
};
