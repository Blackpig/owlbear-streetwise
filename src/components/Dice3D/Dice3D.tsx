import React, { useEffect, useState, useRef } from 'react';
import './Dice3D.css';

interface Dice3DProps {
  regularDice: number[];
  strainDice: number[];
  isRolling?: boolean;
  lockedDice?: {
    regular: boolean[];
    strain: boolean[];
  };
}

export const Dice3D: React.FC<Dice3DProps> = ({
  regularDice,
  strainDice,
  isRolling = false,
  lockedDice
}) => {
  const [rolling, setRolling] = useState(false);
  const [rollKey, setRollKey] = useState(0);

  useEffect(() => {
    if (isRolling) {
      setRolling(true);
      setRollKey(prev => prev + 1); // Force new random delays
      const timer = setTimeout(() => setRolling(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setRolling(false);
    }
  }, [isRolling]);

  const renderDie = (value: number, index: number, isStrain: boolean) => {
    // Check if this die was locked (1 or 6 from previous roll)
    const isLocked = lockedDice
      ? isStrain
        ? lockedDice.strain[index]
        : lockedDice.regular[index]
      : false;

    // Generate a random delay between 0-300ms for natural, staggered animation
    const animationDelay = Math.random() * 0.3;

    // Only animate dice that weren't locked
    const shouldAnimate = rolling && !isLocked;

    // Use stable keys based on index only - don't remount dice components
    const dieKey = `${isStrain ? 'strain' : 'regular'}-${index}`;

    const classNames = `die ${isStrain ? 'strain' : 'regular'} ${shouldAnimate ? 'rolling' : ''} ${isLocked ? 'locked' : ''}`;

    // For locked dice, force the transform inline to prevent any CSS transition issues
    const getLockedTransform = (val: number): string => {
      switch(val) {
        case 1: return 'rotateY(0deg) rotateX(0deg)';
        case 2: return 'rotateY(-90deg) rotateX(0deg)';
        case 3: return 'rotateY(180deg) rotateX(0deg)';
        case 4: return 'rotateY(90deg) rotateX(0deg)';
        case 5: return 'rotateY(0deg) rotateX(-90deg)';
        case 6: return 'rotateY(0deg) rotateX(90deg)';
        default: return 'rotateY(0deg) rotateX(0deg)';
      }
    };

    // For locked dice, we need to ensure the transform overrides everything
    // Use transform with transformStyle to ensure 3D rendering works
    const inlineStyle: React.CSSProperties = isLocked
      ? {
          transform: getLockedTransform(value),
          transformStyle: 'preserve-3d' as const
        }
      : shouldAnimate
        ? { animationDelay: `${animationDelay}s` }
        : undefined;

    return (
      <div key={dieKey} className="die-wrapper">
        <div
          className={classNames}
          data-rolled={value}
          style={inlineStyle}
        >
          {/* Face 1 */}
          <div className="face face-1">
            <div className="dot"></div>
          </div>

          {/* Face 2 */}
          <div className="face face-2">
            <div className="dot"></div>
            <div className="dot"></div>
          </div>

          {/* Face 3 */}
          <div className="face face-3">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>

          {/* Face 4 */}
          <div className="face face-4">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>

          {/* Face 5 */}
          <div className="face face-5">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>

          {/* Face 6 */}
          <div className="face face-6">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dice-container">
      {regularDice.length > 0 && (
        <>
          <div className="dice-group">
            <div className="dice-group__label">Regular Dice</div>
          </div>
          {regularDice.map((value, index) => renderDie(value, index, false))}
        </>
      )}

      {strainDice.length > 0 && (
        <>
          <div className="dice-group">
            <div className="dice-group__label">Strain Dice</div>
          </div>
          {strainDice.map((value, index) => renderDie(value, index, true))}
        </>
      )}
    </div>
  );
};