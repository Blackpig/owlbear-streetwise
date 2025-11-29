import React from 'react';
import type { Character } from '../../types/character';
import './CharacterSheetHeader.css';

interface CharacterSheetHeaderProps {
  character: Character;
  canEdit: boolean;
}

const ARCHETYPE_DISPLAY_NAMES: Record<string, string> = {
  'artful-dodge': 'Artful Dodge',
  'brickyard-pug': 'Brickyard Pug',
  'bright-spark': 'Bright Spark',
  'penny-physick': 'Penny Physick',
  'gutter-fixer': 'Gutter Fixer',
  'street-nose': 'Street Nose',
  'card-twister': 'Card Twister'
};

export const CharacterSheetHeader: React.FC<CharacterSheetHeaderProps> = ({ character, canEdit }) => {
  return (
    <div className="character-header">
      {/* Portrait */}
      {character.portrait && (
        <div className="character-header__portrait">
          <img src={character.portrait} alt={character.name} />
        </div>
      )}

      {/* Name and Info */}
      <div className="character-header__info">
        <h1 className="character-header__name">{character.name}</h1>
        <div className="character-header__archetype">
          {ARCHETYPE_DISPLAY_NAMES[character.archetype] || character.archetype}
        </div>
      </div>
    </div>
  );
};
