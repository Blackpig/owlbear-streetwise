import { useState } from 'react';
import type { Character } from '../../types/character';
import { PortraitUpload } from '../PortraitUpload/PortraitUpload';
import { CharacterSilhouetteIcon } from '../Icons/SilhouetteIcons';
import { LinkTokenIcon, UnlinkTokenIcon, UploadToAssetsIcon } from '../Icons/Icons';
import { ConditionsTracker } from './ConditionsTracker';
import { linkCharacterToToken, unlinkCharacterFromToken } from '../../services/tokenLinkingService';
import { uploadCharacterTokenToAssets } from '../../services/assetUploadService';
import './CharacterHeader.css';

interface CharacterHeaderProps {
  character: Character;
  canEdit: boolean;
  onUpdate: (updates: Partial<Character>) => void;
  playerId: string;
  isGM: boolean;
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

export const CharacterHeader: React.FC<CharacterHeaderProps> = ({
  character,
  canEdit,
  onUpdate,
  playerId,
  isGM
}) => {
  const [showPortraitModal, setShowPortraitModal] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const [assetUploadMessage, setAssetUploadMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handlePortraitClick = () => {
    if (canEdit) {
      setShowPortraitModal(true);
    }
  };

  const handleLinkToken = async () => {
    if (!canEdit) return;

    try {
      setLinkError(null);
      const tokenId = await linkCharacterToToken(character);

      if (tokenId) {
        onUpdate({ linkedTokenId: tokenId });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to link token';
      setLinkError(errorMessage);
      setTimeout(() => setLinkError(null), 5000);
    }
  };

  const handleUnlinkToken = async () => {
    if (!canEdit) return;

    if (!character.linkedTokenId) {
      setLinkError('No linked token to unlink');
      setTimeout(() => setLinkError(null), 3000);
      return;
    }

    try {
      await unlinkCharacterFromToken(character.linkedTokenId);
      onUpdate({ linkedTokenId: undefined });
    } catch (error) {
      setLinkError(error instanceof Error ? error.message : 'Failed to unlink token');
      setTimeout(() => setLinkError(null), 3000);
    }
  };

  const handleUploadToAssets = async () => {
    if (!isGM || !character.portrait) return;

    setUploadingAsset(true);
    setAssetUploadMessage(null);

    try {
      const result = await uploadCharacterTokenToAssets(character);

      if (result.success) {
        setAssetUploadMessage({ text: 'Token uploaded to assets!', type: 'success' });
      } else {
        setAssetUploadMessage({ text: result.error || 'Upload failed', type: 'error' });
      }
    } catch (error) {
      setAssetUploadMessage({
        text: error instanceof Error ? error.message : 'Failed to upload token',
        type: 'error'
      });
    } finally {
      setUploadingAsset(false);
      setTimeout(() => setAssetUploadMessage(null), 5000);
    }
  };

  return (
    <>
      <div className="character-header-grid">
        {/* Character Info - Portrait + Name (spans 2 columns) */}
        <div className="character-header-grid__character-info">
          {/* Portrait */}
          <div className="character-header-grid__portrait-container">
            <div
              className={`character-header-grid__portrait ${!character.portrait && canEdit ? 'clickable' : ''}`}
              onClick={handlePortraitClick}
              title={!character.portrait && canEdit ? 'Click to upload portrait' : undefined}
            >
              {character.portrait ? (
                <img src={character.portrait} alt={character.name} />
              ) : (
                <div className="character-header-grid__silhouette">
                  <CharacterSilhouetteIcon />
                </div>
              )}
            </div>

            {/* Link/Unlink Token Button - Players only */}
            {canEdit && (
              <button
                className={`character-header-grid__token-link-btn ${character.linkedTokenId ? 'linked' : ''}`}
                onClick={character.linkedTokenId ? handleUnlinkToken : handleLinkToken}
                title={character.linkedTokenId ? 'Unlink from map token' : 'Link to selected map token'}
              >
                {character.linkedTokenId ? <UnlinkTokenIcon /> : <LinkTokenIcon />}
              </button>
            )}

            {/* GM Only: Upload to Assets Button */}
            {isGM && character.portrait && (
              <button
                className="character-header-grid__upload-asset-btn"
                onClick={handleUploadToAssets}
                disabled={uploadingAsset}
                title="Upload character portrait as token to asset library"
              >
                <UploadToAssetsIcon />
              </button>
            )}
          </div>

          {/* Name and Archetype */}
          <div className="character-header-grid__info">
            <h1 className="character-header-grid__name">{character.name}</h1>
            <div className="character-header-grid__archetype">
              {ARCHETYPE_DISPLAY_NAMES[character.archetype] || character.archetype}
            </div>
            {linkError && (
              <div className="character-header-grid__link-error">{linkError}</div>
            )}
            {assetUploadMessage && (
              <div className={`character-header-grid__upload-message character-header-grid__upload-message--${assetUploadMessage.type}`}>
                {assetUploadMessage.text}
              </div>
            )}
          </div>
        </div>

        {/* Conditions Tracker (3rd column) */}
        <div className="character-header-grid__conditions">
          <ConditionsTracker
            character={character}
            canEdit={canEdit}
            onUpdate={onUpdate}
          />
        </div>
      </div>

      {/* Portrait Upload Modal */}
      {showPortraitModal && (
        <>
          <div className="portrait-modal-backdrop" onClick={() => setShowPortraitModal(false)} />
          <div className="portrait-modal">
            <div className="portrait-modal__header">
              <h3>Character Portrait</h3>
              <button onClick={() => setShowPortraitModal(false)}>✕</button>
            </div>
            <PortraitUpload
              portrait={character.portrait}
              onUpdate={(portrait) => {
                onUpdate({ portrait });
                if (portrait) {
                  setShowPortraitModal(false);
                }
              }}
              canEdit={canEdit}
              characterId={playerId}
              characterName={character.name}
            />
          </div>
        </>
      )}
    </>
  );
};
