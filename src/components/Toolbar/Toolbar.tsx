import { useState } from 'react';
import { useOBR } from '../../contexts/OBRContext';
import { ImportExport } from '../ImportExport/ImportExport';
import { PortraitUpload } from '../PortraitUpload/PortraitUpload';
import { PlayerSelector } from '../PlayerSelector/PlayerSelector';
import { ImportIcon, PortraitIcon, ResetIcon, UsersIcon, CreateCharacterIcon, InitiativeTrackerIcon } from '../Icons/Icons';
import { startInitiativeRound } from '../../services/initiativePoolService';
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
  const { assistanceDice, helpingInfo, initiativeRoundActive } = useOBR();
  const [showImportExport, setShowImportExport] = useState(false);
  const [showPortraitUpload, setShowPortraitUpload] = useState(false);
  const [showPlayerSelector, setShowPlayerSelector] = useState(false);
  const [startingInitiative, setStartingInitiative] = useState(false);

  const handleStartInitiativeRound = async () => {
    if (!isGM || startingInitiative) return;

    setStartingInitiative(true);
    try {
      await startInitiativeRound();
    } catch (error) {
      console.error('Failed to start initiative round:', error);
    } finally {
      setStartingInitiative(false);
    }
  };

  const strainColor =
    sceneStrain >= 10 ? 'critical' :
    sceneStrain >= 7 ? 'high' :
    sceneStrain >= 4 ? 'moderate' :
    'low';

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

        {/* GM: Initiative Control */}
        {isGM && (
          <button
            className={`initiative-control ${initiativeRoundActive ? 'active' : ''}`}
            onClick={handleStartInitiativeRound}
            disabled={startingInitiative}
            title={initiativeRoundActive ? 'Initiative round active' : 'Start initiative round'}
          >
            <span className="initiative-control__label">Initiative</span>
            <span className="initiative-control__status">
              {initiativeRoundActive ? 'Active' : 'Start'}
            </span>
          </button>
        )}

        {/* Strain Tracker - Always rightmost */}
        <div className={`strain-tracker strain-tracker--${strainColor}`}>
          <span className="strain-tracker__label">Strain</span>
          <span className="strain-tracker__value">{sceneStrain}</span>
          {isGM && (
            <button
              className="strain-tracker__reset"
              onClick={() => onStrainUpdate(0)}
              title="Reset Strain"
            >
              <ResetIcon />
            </button>
          )}
        </div>
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
    </div>
  );
};
