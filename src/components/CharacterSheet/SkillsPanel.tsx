import React, { useState } from 'react';
import type { Character } from '../../types/character';
import { SKILLS } from '../../types/character';
import { TriangleUpIcon, TriangleDownIcon } from '../Icons/Icons';
import { DefinitionModal } from '../DefinitionModal/DefinitionModal';
import { SKILL_DEFINITIONS } from '../../data/skillDefinitions';
import { calculateDicePool, getTalentEffects } from '../../services/talentEffectsService';
import './SkillsPanel.css';

interface SkillsPanelProps {
  character: Character;
  canEdit: boolean;
  onUpdate: (updates: Partial<Character>) => void;
  onRollSkill: (attribute: number, skill: number, skillName: string, skillId: string) => void;
}

export const SkillsPanel: React.FC<SkillsPanelProps> = ({
  character,
  canEdit,
  onUpdate,
  onRollSkill
}) => {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const handleSkillChange = (skillId: string, delta: number) => {
    const currentValue = character.skills[skillId as keyof Character['skills']];
    const newValue = Math.max(0, Math.min(10, currentValue + delta));

    onUpdate({
      skills: {
        ...character.skills,
        [skillId]: newValue
      }
    });
  };

  const handleRoll = (skillId: string) => {
    const skill = SKILLS[skillId];
    const dicePool = calculateDicePool(character, skillId);

    onRollSkill(dicePool.attribute, dicePool.skill, skill.name, skillId);
  };

  return (
    <div className="skills-panel">
      <h2 className="skills-panel__title">Skills</h2>
      <div className="skills-list">
        {Object.entries(SKILLS).map(([skillId, skill]) => {
          const skillValue = character.skills[skillId as keyof Character['skills']];
          const dicePool = calculateDicePool(character, skillId);
          const talentEffects = getTalentEffects(character, skillId);
          const hasActiveTalents = talentEffects.activeTalents.length > 0;

          return (
            <div key={skillId} className={`skill-row ${hasActiveTalents ? 'skill-row--has-talents' : ''}`}>
              <div className="skill-row__info">
                <div className="skill-row__header">
                  <button
                    className="skill-row__name"
                    onClick={() => setSelectedSkill(skillId)}
                    title={`Learn about ${skill.name}`}
                  >
                    {skill.name}
                  </button>
                  {hasActiveTalents && (
                    <div className="skill-row__talent-badges">
                      {talentEffects.activeTalents.map((talent) => (
                        <span key={talent} className="talent-badge" title={talent}>
                          ✨
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="skill-row__dice">
                  {dicePool.total}d6
                  {talentEffects.attributeSwapped && (
                    <span className="skill-row__attribute-swap" title={`Using ${talentEffects.effectiveAttribute} instead of ${skill.attribute}`}>
                      {' '}({talentEffects.effectiveAttribute.charAt(0).toUpperCase()})
                    </span>
                  )}
                  {talentEffects.description && (
                    <span className="skill-row__talent-desc"> • {talentEffects.description}</span>
                  )}
                </div>
              </div>

              <button
                className="skill-row__value"
                onClick={() => handleRoll(skillId)}
                title={`Roll ${skill.name}${hasActiveTalents ? `\nActive talents: ${talentEffects.activeTalents.join(', ')}` : ''}`}
              >
                {skillValue}
              </button>

              {canEdit && (
                <div className="skill-row__controls">
                  <button
                    className="skill-row__btn skill-row__btn--up"
                    onClick={() => handleSkillChange(skillId, 1)}
                    disabled={skillValue >= 10}
                  >
                    <TriangleUpIcon />
                  </button>
                  <button
                    className="skill-row__btn skill-row__btn--down"
                    onClick={() => handleSkillChange(skillId, -1)}
                    disabled={skillValue <= 0}
                  >
                    <TriangleDownIcon />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedSkill && SKILL_DEFINITIONS[selectedSkill] && (
        <DefinitionModal
          title={SKILL_DEFINITIONS[selectedSkill].name}
          description={SKILL_DEFINITIONS[selectedSkill].description}
          mechanics={SKILL_DEFINITIONS[selectedSkill].mechanics}
          attribute={SKILLS[selectedSkill].attribute}
          onClose={() => setSelectedSkill(null)}
        />
      )}
    </div>
  );
};
