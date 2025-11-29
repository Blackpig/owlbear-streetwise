import React from 'react';
import type { Character } from '../../types/character';
import { TriangleUpIcon, TriangleDownIcon } from '../Icons/Icons';
import './AttributesPanel.css';

interface AttributesPanelProps {
  character: Character;
  canEdit: boolean;
  onUpdate: (updates: Partial<Character>) => void;
  onRollAttribute: (attribute: number, attributeName: string, attributeKey: string) => void;
}

const ATTRIBUTES: Array<{ key: keyof Character['attributes']; name: string }> = [
  { key: 'strength', name: 'Strength' },
  { key: 'agility', name: 'Agility' },
  { key: 'wits', name: 'Wits' },
  { key: 'empathy', name: 'Empathy' }
];

export const AttributesPanel: React.FC<AttributesPanelProps> = ({ character, canEdit, onUpdate, onRollAttribute }) => {
  const handleAttributeChange = (attr: keyof Character['attributes'], delta: number) => {
    const newValue = Math.max(0, Math.min(10, character.attributes[attr] + delta));
    onUpdate({
      attributes: {
        ...character.attributes,
        [attr]: newValue
      }
    });
  };

  const handleRoll = (key: keyof Character['attributes'], name: string) => {
    const attributeValue = character.attributes[key];
    onRollAttribute(attributeValue, name, key);
  };

  return (
    <div className="attributes-panel">
      <h2 className="attributes-panel__title">Attributes</h2>
      <div className="attributes-list">
        {ATTRIBUTES.map(({ key, name }) => {
          const value = character.attributes[key];

          return (
            <div key={key} className="attribute-row">
              <div className="attribute-row__name">{name}</div>
              <button
                className="attribute-row__value"
                onClick={() => handleRoll(key, name)}
                title={`Roll ${name}`}
              >
                {value}
              </button>

              {canEdit && (
                <div className="attribute-row__controls">
                  <button
                    className="attribute-row__btn attribute-row__btn--up"
                    onClick={() => handleAttributeChange(key, 1)}
                    disabled={value >= 10}
                  >
                    <TriangleUpIcon />
                  </button>
                  <button
                    className="attribute-row__btn attribute-row__btn--down"
                    onClick={() => handleAttributeChange(key, -1)}
                    disabled={value <= 0}
                  >
                    <TriangleDownIcon />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
