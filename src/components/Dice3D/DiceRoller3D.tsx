import React from 'react';
import { DiceCube } from './DiceCube';
import './DiceCube.css';

interface DiceRoller3DProps {
  regularDice: number[]; // Array of values 1-6
  strainDice: number[];  // Array of values 1-6
  isRolling?: boolean;
  lockedDice?: {
    regular: boolean[]; // Boolean array indicating which dice are locked by position
    strain: boolean[];  // Boolean array indicating which dice are locked by position
  };
}

/**
 * Container for 3D CSS dice
 * Renders brass (regular) and crimson (strain) dice with rolling animations
 */
export const DiceRoller3D: React.FC<DiceRoller3DProps> = ({
  regularDice,
  strainDice,
  isRolling = false,
  lockedDice
}) => {
  return (
    <div className={`dice-tray ${isRolling ? 'rolling' : ''}`}>
      {/* Regular brass dice */}
      {regularDice.map((value, index) => {
        const isLocked = lockedDice?.regular[index] ?? false;
        return (
          <DiceCube
            key={`regular-${index}`}
            value={value}
            color="brass"
            isRolling={isRolling}
            isLocked={isLocked}
          />
        );
      })}

      {/* Strain crimson dice */}
      {strainDice.map((value, index) => {
        const isLocked = lockedDice?.strain[index] ?? false;
        return (
          <DiceCube
            key={`strain-${index}`}
            value={value}
            color="crimson"
            isRolling={isRolling}
            isLocked={isLocked}
          />
        );
      })}

      {/* Show placeholder when no dice */}
      {regularDice.length === 0 && strainDice.length === 0 && (
        <div style={{
          fontFamily: 'Georgia, serif',
          color: 'var(--color-ink, #2B2520)',
          opacity: 0.5,
          padding: '20px'
        }}>
          Roll dice to see results
        </div>
      )}
    </div>
  );
};
