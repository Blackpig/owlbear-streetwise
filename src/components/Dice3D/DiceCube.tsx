import React, { useEffect, useState } from 'react';
import './DiceCube.css';

interface DiceCubeProps {
  value: number; // 1-6
  color: 'brass' | 'crimson';
  isRolling?: boolean;
  isLocked?: boolean;
}

/**
 * CSS 3D Dice Cube Component
 * Renders a realistic-looking die with proper 3D transforms
 */
export const DiceCube: React.FC<DiceCubeProps> = ({
  value,
  color,
  isRolling = false,
  isLocked = false
}) => {
  const [rotation, setRotation] = useState(() => {
    // Initialize with correct rotation for the value
    return getFaceRotation(value, false);
  });
  const [randomSpin, setRandomSpin] = useState({ x: 0, y: 0, z: 0 });

  // Generate random spin variation when rolling starts (but not for locked dice)
  useEffect(() => {
    if (isRolling && !isLocked) {
      setRandomSpin({
        x: Math.random() * 360,
        y: Math.random() * 360,
        z: Math.random() * 360
      });
    }
  }, [isRolling, isLocked]);

  // Calculate rotation to show the target face
  useEffect(() => {
    if (!isRolling) {
      // Locked dice get exact rotation without variance
      const rotations = isLocked ? getFaceRotation(value, false) : getFaceRotation(value, true);
      setRotation(rotations);
    } else if (isLocked) {
      // Even while rolling, locked dice should maintain correct rotation
      const rotations = getFaceRotation(value, false);
      setRotation(rotations);
    }
  }, [value, isRolling, isLocked]);

  // Render pips for a given face value
  const renderPips = (faceValue: number) => {
    const pips = [];
    for (let i = 0; i < faceValue; i++) {
      pips.push(<div key={i} className="pip" />);
    }
    return pips;
  };

  // Locked dice should not spin even when rolling
  const cubeStyle = (isRolling && !isLocked)
    ? {
        transform: `rotateX(${randomSpin.x}deg) rotateY(${randomSpin.y}deg) rotateZ(${randomSpin.z}deg)`
      }
    : {
        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`
      };

  return (
    <div className="dice-scene">
      <div
        className={`dice-cube ${isRolling && !isLocked ? 'rolling' : ''} ${isLocked ? 'locked' : ''}`}
        style={cubeStyle}
      >
        {/* Face 1 - Front */}
        <div className={`dice-face ${color}`} data-value="1">
          {renderPips(1)}
        </div>

        {/* Face 2 - Right */}
        <div className={`dice-face ${color}`} data-value="2">
          {renderPips(2)}
        </div>

        {/* Face 3 - Back */}
        <div className={`dice-face ${color}`} data-value="3">
          {renderPips(3)}
        </div>

        {/* Face 4 - Left */}
        <div className={`dice-face ${color}`} data-value="4">
          {renderPips(4)}
        </div>

        {/* Face 5 - Top */}
        <div className={`dice-face ${color}`} data-value="5">
          {renderPips(5)}
        </div>

        {/* Face 6 - Bottom */}
        <div className={`dice-face ${color}`} data-value="6">
          {renderPips(6)}
        </div>
      </div>
    </div>
  );
};

/**
 * Calculate rotation needed to show a specific face
 * Standard die configuration: opposite faces sum to 7
 */
function getFaceRotation(face: number, addVariance: boolean = true): { x: number; y: number; z: number } {
  // Add slight random variation to make each roll unique (but not for locked dice)
  const variance = () => addVariance ? (Math.random() - 0.5) * 5 : 0;

  switch (face) {
    case 1:
      return { x: 0 + variance(), y: 0 + variance(), z: 0 };
    case 2:
      return { x: 0 + variance(), y: -90 + variance(), z: 0 };
    case 3:
      return { x: 0 + variance(), y: 180 + variance(), z: 0 };
    case 4:
      return { x: 0 + variance(), y: 90 + variance(), z: 0 };
    case 5:
      return { x: -90 + variance(), y: 0 + variance(), z: 0 };
    case 6:
      return { x: 90 + variance(), y: 0 + variance(), z: 0 };
    default:
      return { x: 0, y: 0, z: 0 };
  }
}
