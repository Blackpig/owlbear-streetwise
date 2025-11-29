import type { Character, Condition } from '../../types/character';
import { RestIcon, PhysickIcon } from '../Icons/Icons';
import './ConditionsTracker.css';

interface ConditionsTrackerProps {
  character: Character;
  canEdit: boolean;
  onUpdate: (updates: Partial<Character>) => void;
}

const CONDITION_LABELS: Record<number, string> = {
  0: 'Healthy',
  1: 'Bruised',
  2: 'Hurt',
  3: 'Injured',
  4: 'Broken'
};

const CONDITIONS: Condition[] = ['bruised', 'hurt', 'injured', 'broken'];

export const ConditionsTracker: React.FC<ConditionsTrackerProps> = ({
  character,
  canEdit,
  onUpdate
}) => {
  const conditionLevel = character.conditions.length;
  const isSleepDeprived = character.sleepDeprived || false;

  // Get status text
  const getStatusText = (): string => {
    const baseCondition = CONDITION_LABELS[conditionLevel];

    if (isSleepDeprived) {
      return `${baseCondition} + Sleep Deprived`;
    }

    return baseCondition;
  };

  // Get CSS modifier class
  const getStatusClass = (): string => {
    if (conditionLevel === 0) return 'healthy';
    if (conditionLevel === 1) return 'bruised';
    if (conditionLevel === 2) return 'hurt';
    if (conditionLevel === 3) return 'injured';
    return 'broken';
  };

  // Handle condition checkbox toggle
  const handleConditionToggle = (condition: Condition, index: number) => {
    if (!canEdit) return;

    const isChecked = character.conditions.includes(condition);
    let newConditions: Condition[];

    if (isChecked) {
      // Unchecking - remove this and all higher conditions
      newConditions = character.conditions.filter((_, i) => i < index);
    } else {
      // Checking - add all conditions up to and including this one
      newConditions = CONDITIONS.slice(0, index + 1);
    }

    onUpdate({ conditions: newConditions });
  };

  // Handle sleep deprivation toggle
  const handleSleepToggle = () => {
    if (!canEdit) return;
    onUpdate({ sleepDeprived: !isSleepDeprived });
  };

  // Handle Long Rest
  // If sleep deprived: only clear sleep deprivation (no condition healing)
  // If NOT sleep deprived: heal 1 condition level
  const handleLongRest = () => {
    if (!canEdit) return;

    if (isSleepDeprived) {
      // Sleep deprived: only remove sleep deprivation, no condition healing
      onUpdate({ sleepDeprived: false });
    } else {
      // Not sleep deprived: heal 1 condition level
      const newConditions = character.conditions.length > 0
        ? character.conditions.slice(0, -1)
        : [];
      onUpdate({ conditions: newConditions });
    }
  };

  // Handle Apply Physick - heals 1 condition level only
  const handleApplyPhysick = () => {
    if (!canEdit || conditionLevel === 0) return;

    const newConditions = character.conditions.slice(0, -1);
    onUpdate({ conditions: newConditions });
  };

  return (
    <div className="conditions-tracker">
      {/* Status Display */}
      <div className={`conditions-tracker__status conditions-tracker__status--${getStatusClass()}`}>
        <span className="conditions-tracker__label">Condition:</span> {getStatusText()}
      </div>

      {canEdit && (
        <>
          {/* Condition Checkboxes - Row of 4 */}
          <div className="conditions-tracker__checkboxes">
            {CONDITIONS.map((condition, index) => {
              const isChecked = character.conditions.includes(condition);
              return (
                <label
                  key={condition}
                  className={`condition-checkbox condition-checkbox--${condition} ${isChecked ? 'checked' : ''}`}
                  title={condition.charAt(0).toUpperCase() + condition.slice(1)}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleConditionToggle(condition, index)}
                  />
                  <div className="condition-checkbox__mark" />
                </label>
              );
            })}
          </div>

          {/* Sleep Deprived Toggle & Penalty */}
          <div className="conditions-tracker__bottom-row">
            <label className={`sleep-toggle ${isSleepDeprived ? 'checked' : ''}`}>
              <input
                type="checkbox"
                checked={isSleepDeprived}
                onChange={handleSleepToggle}
              />
              <div className="sleep-toggle__mark" />
              <span className="sleep-toggle__label">Sleep Deprived</span>
            </label>

            {conditionLevel > 0 && (
              <div className="conditions-tracker__penalty">
                −{conditionLevel} {conditionLevel === 1 ? 'die' : 'dice'}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="conditions-tracker__actions">
            <button
              className="condition-action condition-action--rest"
              onClick={handleLongRest}
              disabled={conditionLevel === 0 && !isSleepDeprived}
              title={isSleepDeprived ? "Long Rest (clears sleep deprivation)" : "Long Rest (heals 1 condition)"}
            >
              <RestIcon />
              <span>Rest</span>
            </button>

            <button
              className="condition-action condition-action--physick"
              onClick={handleApplyPhysick}
              disabled={conditionLevel === 0}
              title="Apply Physick (heals 1 condition)"
            >
              <PhysickIcon />
              <span>Physick</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
