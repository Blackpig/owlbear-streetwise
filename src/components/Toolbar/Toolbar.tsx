import { useState } from 'react';
import { useOBR } from '../../contexts/OBRContext';
import { ImportExport } from '../ImportExport/ImportExport';
import { PortraitUpload } from '../PortraitUpload/PortraitUpload';
import { PlayerSelector } from '../PlayerSelector/PlayerSelector';
import { ImportIcon, PortraitIcon, UsersIcon, CreateCharacterIcon, InitiativeTrackerIcon, SceneChallengeIcon, WarningIcon } from '../Icons/Icons';
import { startSceneChallenge, endSceneChallenge } from '../../services/sceneChallengeService';
import type { Character } from '../../types/character';
import './Toolbar.css';

interface ToolbarProps {
  character: Character | null;
  onImport: (character: Character) => void;
  onPortraitUpdate: (portrait?: string) => void;
  canEdit: boolean;
  sceneStrain: number;
  onStrainUpdate: (value: number) => void;
  isGM: boolean;
  readMode: boolean;
  showingInitiativeTracker?: boolean;
  onToggleInitiativeTracker?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  character,
  onImport,
  onPortraitUpdate,
  canEdit,
  sceneStrain,
  onStrainUpdate,
  isGM,
  readMode,
  showingInitiativeTracker = false,
  onToggleInitiativeTracker
}) => {
  const { assistanceDice, helpingInfo, sceneChallenge } = useOBR();
  const [showImportExport, setShowImportExport] = useState(false);
  const [showPortraitUpload, setShowPortraitUpload] = useState(false);
  const [showPlayerSelector, setShowPlayerSelector] = useState(false);
  const [showSceneChallengeSetup, setShowSceneChallengeSetup] = useState(false);
  const [showEndChallengeConfirm, setShowEndChallengeConfirm] = useState(false);
  const [challengeTarget, setChallengeTarget] = useState(6);
  const [challengeDescription, setChallengeDescription] = useState('');
  const [startingChallenge, setStartingChallenge] = useState(false);

  const handleStartChallenge = async () => {
    if (startingChallenge) return;

    setStartingChallenge(true);
    try {
      await startSceneChallenge(challengeTarget, challengeDescription.trim() || undefined);
      setShowSceneChallengeSetup(false);
      setChallengeDescription('');
    } catch (error) {
      console.error('Failed to start scene challenge:', error);
    } finally {
      setStartingChallenge(false);
    }
  };

  const handleEndChallenge = async () => {
    try {
      await endSceneChallenge();
    } catch (error) {
      console.error('Failed to end scene challenge:', error);
    }
  };

  const strainColor =
    sceneStrain >= 10 ? 'critical' :
    sceneStrain >= 7 ? 'high' :
    sceneStrain >= 4 ? 'moderate' :
    'low';

  const getDifficultyLabel = (target: number) => {
    if (target <= 3) return 'Easy';
    if (target <= 6) return 'Normal';
    if (target <= 9) return 'Tricky';
    return 'Hard';
  };

  return (
    <div className="toolbar">
      {/* Left: Game Icon + Title */}
      <div className="toolbar__brand">
        <img src="/icon.svg" alt="Streetwise" className="toolbar__brand-icon" />
        <h1>Streetwise</h1>
      </div>

      {/* Center: Action Icons */}
      <div className="toolbar__actions">
        {/* Create New Character */}
        <button
          className="toolbar__icon-button"
          onClick={() => window.open('https://urchinator.notoriety.co.uk/', '_blank')}
          title="Create New Character"
        >
          <CreateCharacterIcon />
        </button>

        {/* GM: Character Selector */}
        {isGM && (
          <button
            className="toolbar__icon-button"
            onClick={() => setShowPlayerSelector(!showPlayerSelector)}
            title="Select Character"
          >
            <UsersIcon />
          </button>
        )}

        <button
          className="toolbar__icon-button"
          onClick={() => setShowImportExport(!showImportExport)}
          title="Import/Export Character"
        >
          <ImportIcon />
        </button>

        {/* GM: Scene Challenge */}
        {isGM && (
          <button
            className={`toolbar__icon-button ${sceneChallenge.active ? 'active' : ''}`}
            onClick={() => sceneChallenge.active ? setShowEndChallengeConfirm(true) : setShowSceneChallengeSetup(true)}
            title={sceneChallenge.active ? 'End Scene Challenge' : 'Start Scene Challenge'}
          >
            <SceneChallengeIcon />
          </button>
        )}

        {/* GM: Initiative Tracker Toggle */}
        {isGM && onToggleInitiativeTracker && (
          <button
            className={`toolbar__icon-button ${showingInitiativeTracker ? 'active' : ''}`}
            onClick={onToggleInitiativeTracker}
            title={showingInitiativeTracker ? 'View Character' : 'View Initiative Tracker'}
          >
            <InitiativeTrackerIcon />
          </button>
        )}

        {/* Player: Portrait Upload */}
        {!isGM && (
          <button
            className="toolbar__icon-button"
            onClick={() => setShowPortraitUpload(!showPortraitUpload)}
            title="Upload Portrait"
          >
            <PortraitIcon />
          </button>
        )}
      </div>

      {/* Read Mode Indicator */}
      {readMode && (
        <div className="toolbar__read-mode">
          Read Mode
        </div>
      )}

      {/* Right: Trackers */}
      <div className="toolbar__trackers">
        {/* Helping Badge - Show when helping another player */}
        {helpingInfo && (
          <div className="assistance-badge assistance-badge--helping">
            <span className="assistance-badge__label">Helping:</span>
            <span className="assistance-badge__value">{helpingInfo.targetPlayerName}</span>
          </div>
        )}

        {/* Assistance Badge - Show when receiving help */}
        {assistanceDice > 0 && (
          <div className="assistance-badge assistance-badge--receiving">
            <span className="assistance-badge__label">Assisted by:</span>
            <span className="assistance-badge__value">{assistanceDice}</span>
          </div>
        )}

        {/* Scene Challenge Counter - Show when active */}
        {sceneChallenge.active && (
          <div className="scene-challenge-tracker">
            <div className="scene-challenge-tracker__header">
              {sceneChallenge.description && (
                <div className="scene-challenge-tracker__description">{sceneChallenge.description}</div>
              )}
              <div className="scene-challenge-tracker__difficulty-badge">
                {getDifficultyLabel(sceneChallenge.target)}
              </div>
            </div>
            <div className="scene-challenge-tracker__content">
              <div className="scene-challenge-tracker__counters">
                <div className="scene-challenge-tracker__counter">
                  <span className="scene-challenge-tracker__label">Success</span>
                  <div className="scene-challenge-tracker__pills">
                    {Array.from({ length: sceneChallenge.successes }).map((_, i) => (
                      <span key={i} className="scene-challenge-tracker__pill scene-challenge-tracker__pill--success" />
                    ))}
                  </div>
                </div>
                <div className="scene-challenge-tracker__counter">
                  <span className="scene-challenge-tracker__label">Banes</span>
                  <div className="scene-challenge-tracker__pills">
                    {Array.from({ length: sceneChallenge.banes }).map((_, i) => (
                      <span key={i} className="scene-challenge-tracker__pill scene-challenge-tracker__pill--bane" />
                    ))}
                  </div>
                </div>
              </div>
              <div className={`scene-challenge-tracker__strain scene-challenge-tracker__strain--${strainColor}`}>
                <div className="scene-challenge-tracker__strain-label">STRAIN</div>
                <div className="scene-challenge-tracker__strain-value">{sceneStrain}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Import/Export Popover */}
      {showImportExport && (
        <>
          <div className="toolbar__backdrop" onClick={() => setShowImportExport(false)} />
          <div className="toolbar__popover">
            <div className="toolbar__popover-header">
              <h3>Import / Export</h3>
              <button onClick={() => setShowImportExport(false)}>✕</button>
            </div>
            <ImportExport
              character={character}
              onImport={(char) => {
                onImport(char);
                setShowImportExport(false);
              }}
              canEdit={canEdit}
            />
          </div>
        </>
      )}

      {/* Portrait Upload Popover */}
      {showPortraitUpload && (
        <>
          <div className="toolbar__backdrop" onClick={() => setShowPortraitUpload(false)} />
          <div className="toolbar__popover">
            <div className="toolbar__popover-header">
              <h3>Portrait</h3>
              <button onClick={() => setShowPortraitUpload(false)}>✕</button>
            </div>
            <PortraitUpload
              portrait={character?.portrait}
              onUpdate={onPortraitUpdate}
              canEdit={canEdit}
              characterId={character?.id || ''}
              characterName={character?.name || 'Character'}
            />
          </div>
        </>
      )}

      {/* Player Selector Popover (GM Only) */}
      {showPlayerSelector && (
        <>
          <div className="toolbar__backdrop" onClick={() => setShowPlayerSelector(false)} />
          <div className="toolbar__popover">
            <div className="toolbar__popover-header">
              <h3>Select Character</h3>
              <button onClick={() => setShowPlayerSelector(false)}>✕</button>
            </div>
            <PlayerSelector />
          </div>
        </>
      )}

      {/* Scene Challenge Setup Modal (GM Only) */}
      {showSceneChallengeSetup && (
        <>
          <div className="toolbar__backdrop" onClick={() => setShowSceneChallengeSetup(false)} />
          <div className="toolbar__popover">
            <div className="toolbar__popover-header">
              <h3>Start Scene Challenge</h3>
              <button onClick={() => setShowSceneChallengeSetup(false)}>✕</button>
            </div>
            <div className="scene-challenge-setup">
              {sceneChallenge.active && (
                <div className="scene-challenge-setup__warning">
                  <WarningIcon />
                  <span>Warning: Starting a new scene will end the current scene challenge and reset all initiative, turn actions, NPCs, and strain to 0.</span>
                </div>
              )}
              <p className="scene-challenge-setup__description">
                Set a target number for the party to reach through collective skill checks.
              </p>

              <div className="scene-challenge-setup__field">
                <label className="scene-challenge-setup__label">Difficulty:</label>
                <div className="scene-challenge-setup__buttons">
                  <button
                    className={`scene-challenge-setup__button ${challengeTarget === 3 ? 'active' : ''}`}
                    onClick={() => setChallengeTarget(3)}
                  >
                    Easy (3)
                  </button>
                  <button
                    className={`scene-challenge-setup__button ${challengeTarget === 6 ? 'active' : ''}`}
                    onClick={() => setChallengeTarget(6)}
                  >
                    Normal (6)
                  </button>
                  <button
                    className={`scene-challenge-setup__button ${challengeTarget === 9 ? 'active' : ''}`}
                    onClick={() => setChallengeTarget(9)}
                  >
                    Tricky (9)
                  </button>
                  <button
                    className={`scene-challenge-setup__button ${challengeTarget === 12 ? 'active' : ''}`}
                    onClick={() => setChallengeTarget(12)}
                  >
                    Hard (12)
                  </button>
                </div>
              </div>

              <div className="scene-challenge-setup__field">
                <label className="scene-challenge-setup__label">Description (optional):</label>
                <input
                  type="text"
                  className="scene-challenge-setup__input"
                  placeholder="e.g., Find the informant"
                  value={challengeDescription}
                  onChange={(e) => setChallengeDescription(e.target.value)}
                  maxLength={50}
                />
              </div>

              <button
                className="scene-challenge-setup__start"
                onClick={handleStartChallenge}
                disabled={startingChallenge}
              >
                {startingChallenge ? 'Starting...' : (sceneChallenge.active ? 'Start New Scene' : 'Start Challenge')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* End Scene Challenge Confirmation Modal (GM Only) */}
      {showEndChallengeConfirm && (
        <>
          <div className="toolbar__backdrop" onClick={() => setShowEndChallengeConfirm(false)} />
          <div className="toolbar__popover toolbar__popover--confirm">
            <div className="toolbar__popover-header">
              <h3>End Scene Challenge</h3>
              <button onClick={() => setShowEndChallengeConfirm(false)}>✕</button>
            </div>
            <div className="confirm-dialog">
              <p className="confirm-dialog__message">
                Are you sure you want to end the current scene challenge?
              </p>
              <div className="confirm-dialog__buttons">
                <button
                  className="confirm-dialog__button confirm-dialog__button--cancel"
                  onClick={() => setShowEndChallengeConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="confirm-dialog__button confirm-dialog__button--confirm"
                  onClick={() => {
                    handleEndChallenge();
                    setShowEndChallengeConfirm(false);
                  }}
                >
                  End Challenge
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
