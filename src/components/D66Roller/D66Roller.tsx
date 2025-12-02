import React, { useState, useEffect } from 'react';
import { DiceCube } from '../Dice3D/DiceCube';
import '../Dice3D/DiceCube.css';
import './D66Roller.css';

interface D66RollerProps {
  onResult: (roll: string) => void;
  onClose: () => void;
}

export const D66Roller: React.FC<D66RollerProps> = ({ onResult, onClose }) => {
  const [die1, setDie1] = useState<number>(1);
  const [die2, setDie2] = useState<number>(1);
  const [isRolling, setIsRolling] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Wait for scale-in animation to finish before rolling dice
    const timer = setTimeout(() => {
      rollDice();
    }, 300); // Match the scaleIn animation duration

    return () => clearTimeout(timer);
  }, []);

  const rollDice = () => {
    setIsRolling(true);
    setShowResult(false);

    // Animate the dice rolling
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setDie1(Math.floor(Math.random() * 6) + 1);
      setDie2(Math.floor(Math.random() * 6) + 1);
      rollCount++;

      if (rollCount > 10) {
        clearInterval(rollInterval);
        // Final roll
        const finalDie1 = Math.floor(Math.random() * 6) + 1;
        const finalDie2 = Math.floor(Math.random() * 6) + 1;
        setDie1(finalDie1);
        setDie2(finalDie2);
        setIsRolling(false);
        setShowResult(true);

        // Auto-select after showing result briefly, with closing animation
        const result = `${finalDie1}${finalDie2}`;
        setTimeout(() => {
          setIsClosing(true);
          // Wait for close animation before calling onResult
          setTimeout(() => {
            onResult(result);
          }, 300); // Match the scaleOut animation duration
        }, 800);
      }
    }, 100);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match the scaleOut animation duration
  };

  const d66Result = `${die1}${die2}`;

  return (
    <>
      <div
        className={`d66-roller-backdrop ${isClosing ? 'd66-roller-backdrop--closing' : ''}`}
        onClick={handleClose}
      />
      <div className={`d66-roller ${isClosing ? 'd66-roller--closing' : ''}`}>
        <div className="d66-roller__header">
          <h3>Rolling d66...</h3>
          <button className="d66-roller__close" onClick={handleClose}>×</button>
        </div>

        <div className="d66-roller__content">
          <div className="d66-roller__dice">
            <DiceCube
              value={die1}
              color="crimson"
              isRolling={isRolling}
            />
            <DiceCube
              value={die2}
              color="brass"
              isRolling={isRolling}
            />
          </div>

          {showResult && (
            <div className="d66-roller__result">
              <div className="d66-roller__result-label">Result:</div>
              <div className="d66-roller__result-value">{d66Result}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
