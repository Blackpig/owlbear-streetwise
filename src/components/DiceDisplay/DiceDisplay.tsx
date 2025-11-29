import React from 'react';
import './DiceDisplay.css';

interface DiceDisplayProps {
  value: number;
  type: 'regular' | 'strain';
  highlight?: 'success' | 'bane' | 'none';
}

/**
 * Single die display component
 */
export const Die: React.FC<DiceDisplayProps> = ({ value, type, highlight = 'none' }) => {
  const className = [
    'die',
    `die--${type}`,
    highlight !== 'none' ? `die--${highlight}` : ''
  ].filter(Boolean).join(' ');
  
  return (
    <div className={className}>
      <span className="die__value">{value}</span>
    </div>
  );
};

interface DiceGroupProps {
  dice: number[];
  type: 'regular' | 'strain';
  label: string;
}

/**
 * Group of dice (all regular or all strain)
 */
export const DiceGroup: React.FC<DiceGroupProps> = ({ dice, type, label }) => {
  if (dice.length === 0) return null;
  
  return (
    <div className="dice-group">
      <div className="dice-group__label">{label}</div>
      <div className="dice-group__dice">
        {dice.map((value, index) => {
          let highlight: 'success' | 'bane' | 'none' = 'none';
          if (value === 6) highlight = 'success';
          if (value === 1) highlight = 'bane';
          
          return (
            <Die 
              key={`${type}-${index}`}
              value={value}
              type={type}
              highlight={highlight}
            />
          );
        })}
      </div>
    </div>
  );
};

interface DiceDisplayFullProps {
  regularDice: number[];
  strainDice: number[];
  successes: number;
  regularBanes: number;
  strainBanes: number;
  pushed?: boolean;
}

/**
 * Full dice display showing both regular and strain dice with summary
 */
export const DiceDisplayFull: React.FC<DiceDisplayFullProps> = ({
  regularDice,
  strainDice,
  successes,
  regularBanes,
  strainBanes,
  pushed = false
}) => {
  const totalBanes = regularBanes + strainBanes;
  const hasSuccess = successes > 0;
  
  return (
    <div className="dice-display">
      {pushed && (
        <div className="dice-display__pushed-badge">
          PUSHED ROLL
        </div>
      )}
      
      <div className="dice-display__groups">
        <DiceGroup 
          dice={regularDice}
          type="regular"
          label={`Regular Dice (${regularDice.length})`}
        />
        
        {strainDice.length > 0 && (
          <DiceGroup 
            dice={strainDice}
            type="strain"
            label={`Strain Dice (${strainDice.length})`}
          />
        )}
      </div>
      
      <div className="dice-display__summary">
        <div className={`summary-item summary-item--${hasSuccess ? 'success' : 'failure'}`}>
          <span className="summary-item__label">Result:</span>
          <span className="summary-item__value">
            {hasSuccess ? `${successes} Success${successes > 1 ? 'es' : ''}` : 'FAILED'}
          </span>
        </div>
        
        {totalBanes > 0 && (
          <div className="summary-item summary-item--banes">
            <span className="summary-item__label">Banes:</span>
            <span className="summary-item__value">
              {totalBanes} total
              {strainBanes > 0 && (
                <span className="summary-item__warning">
                  {' '}({strainBanes} on Strain dice!)
                </span>
              )}
            </span>
          </div>
        )}
        
        {regularBanes > 0 && pushed && (
          <div className="summary-item summary-item--strain-increase">
            <span className="summary-item__label">Scene Strain:</span>
            <span className="summary-item__value">
              +{totalBanes} Strain Points
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
