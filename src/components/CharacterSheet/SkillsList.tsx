import React from 'react';
import type { Character } from '../../types/character';
import { SKILLS } from '../../types/character';

interface SkillsListProps {
  character: Character;
  conditionPenalty: number;
  onRollSkill: (attribute: number, skill: number, skillName: string) => void;
}

export const SkillsList: React.FC<SkillsListProps> = ({
  character,
  conditionPenalty,
  onRollSkill
}) => {
  const groupedSkills = {
    strength: ['scrap'],
    agility: ['pinch', 'scramble', 'sneak'],
    wits: ['burgle', 'deduce', 'notice', 'streetwise', 'tinker'],
    empathy: ['hoodwink', 'physick']
  };

  const handleSkillClick = (skillId: string) => {
    const skill = SKILLS[skillId];
    const attributeValue = character.attributes[skill.attribute];
    const skillValue = character.skills[skillId as keyof typeof character.skills];

    onRollSkill(attributeValue, skillValue, skill.name);
  };

  return (
    <div className="skills-section">
      <h2>Skills</h2>

      {Object.entries(groupedSkills).map(([attribute, skillIds]) => (
        <div key={attribute} className="skill-group">
          <h3>{attribute.charAt(0).toUpperCase() + attribute.slice(1)}</h3>

          {skillIds.map(skillId => {
            const skill = SKILLS[skillId];
            const skillValue = character.skills[skillId as keyof typeof character.skills];
            const attributeValue = character.attributes[attribute as keyof typeof character.attributes];
            const totalDice = Math.max(1, attributeValue + skillValue - conditionPenalty);

            return (
              <button
                key={skillId}
                className="skill-item"
                onClick={() => handleSkillClick(skillId)}
                title={skill.description}
              >
                <span className="skill-name">{skill.name}</span>
                <span className="skill-value">{skillValue}</span>
                <span className="skill-pool">({totalDice}d)</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
