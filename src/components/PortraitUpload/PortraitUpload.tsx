import React, { useState, useRef } from 'react';
import { processImageFile, validateImageUrl, shouldWarnAboutSize } from '../../utils/imageUtils';
import type { ImageProcessResult } from '../../utils/imageUtils';
import { uploadPortrait } from '../../services/portraitUploadService';
import { CheckIcon, WarningIcon } from '../Icons/Icons';
import { PortraitGallery } from '../PortraitGallery/PortraitGallery';
import './PortraitUpload.css';

interface PortraitUploadProps {
  portrait?: string;
  onUpdate: (portrait?: string) => void;
  canEdit: boolean;
  characterId: string;
  characterName: string;
}

export const PortraitUpload: React.FC<PortraitUploadProps> = ({ portrait, onUpdate, canEdit, characterId, characterName }) => {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  const [urlPreviewError, setUrlPreviewError] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setProcessing(true);
    setError(null);
    setWarning(null);
    setSuccess(null);

    try {
      // Process image (resize, compress)
      const result: ImageProcessResult = await processImageFile(file);

      // Upload to Streetwise API
      setSuccess('Uploading portrait...');
      const url = await uploadPortrait(result.dataUrl, characterId, characterName);

      // Update character with the hosted URL
      onUpdate(url);

      setSuccess(`Portrait uploaded successfully (${Math.round(result.sizeKB)}KB)`);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
        setWarning(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload portrait');
    } finally {
      setProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlInputChange = (url: string) => {
    setUrlInput(url);
    setUrlPreviewError(false);
    setError(null);

    // Show preview if URL looks valid
    if (url.trim()) {
      const validation = validateImageUrl(url);
      if (validation.valid) {
        setUrlPreview(url);
      } else {
        setUrlPreview(null);
        setError(validation.error || 'Invalid URL');
      }
    } else {
      setUrlPreview(null);
    }
  };

  const handleUrlSubmit = () => {
    setError(null);
    setWarning(null);
    setSuccess(null);

    const validation = validateImageUrl(urlInput);

    if (!validation.valid) {
      setError(validation.error || 'Invalid URL');
      return;
    }

    if (validation.sizeKB && shouldWarnAboutSize(validation.sizeKB)) {
      setWarning(`Large image (${Math.round(validation.sizeKB)}KB) - may slow sync`);
    }

    onUpdate(urlInput || undefined);
    setShowUrlInput(false);
    setUrlInput('');
    setUrlPreview(null);
    setSuccess('Portrait URL updated');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleRemovePortrait = () => {
    onUpdate(undefined);
    setSuccess('Portrait removed');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleGallerySelect = (url: string) => {
    onUpdate(url);
    setShowGallery(false);
    setSuccess('Portrait selected from gallery');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="portrait-upload">
      <div className="portrait-upload__header">
        <h3>Character Portrait</h3>
      </div>

      {/* Portrait Preview */}
      <div className="portrait-upload__preview">
        {portrait ? (
          <img
            src={portrait}
            alt="Character portrait"
            className="portrait-upload__image"
            onError={() => setError('Failed to load portrait image')}
          />
        ) : (
          <div className="portrait-upload__placeholder">
            <span>No Portrait</span>
          </div>
        )}
      </div>

      {canEdit && (
        <>
          {/* Upload Options */}
          <div className="portrait-upload__actions">
            <button
              className="portrait-upload__button"
              onClick={handleFileClick}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Upload Image'}
            </button>

            <button
              className="portrait-upload__button"
              onClick={() => setShowGallery(true)}
              disabled={processing}
            >
              Choose from Gallery
            </button>

            <button
              className="portrait-upload__button"
              onClick={() => {
                const newState = !showUrlInput;
                setShowUrlInput(newState);
                if (!newState) {
                  // Clear URL input state when closing
                  setUrlInput('');
                  setUrlPreview(null);
                  setUrlPreviewError(false);
                  setError(null);
                }
              }}
              disabled={processing}
            >
              {showUrlInput ? 'Cancel' : 'Use URL'}
            </button>

            {portrait && (
              <button
                className="portrait-upload__button portrait-upload__button--remove"
                onClick={handleRemovePortrait}
                disabled={processing}
              >
                Remove
              </button>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {/* URL Input */}
          {showUrlInput && (
            <div className="portrait-upload__url-input">
              <div>
                <input
                  type="text"
                  placeholder="Enter image URL (https://example.com/image.jpg)..."
                  value={urlInput}
                  onChange={(e) => handleUrlInputChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !urlPreviewError && handleUrlSubmit()}
                />
                <button onClick={handleUrlSubmit} disabled={!urlInput.trim() || urlPreviewError}>
                  Set URL
                </button>
              </div>

              {/* URL Preview */}
              {urlPreview && !urlPreviewError && (
                <div className="portrait-upload__url-preview">
                  <img
                    src={urlPreview}
                    alt="URL preview"
                    onError={() => {
                      setUrlPreviewError(true);
                      setError('Failed to load image from URL');
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="portrait-upload__message portrait-upload__message--error">
              {error}
            </div>
          )}

          {warning && (
            <div className="portrait-upload__message portrait-upload__message--warning">
              <WarningIcon /> {warning}
            </div>
          )}

          {success && (
            <div className="portrait-upload__message portrait-upload__message--success">
              <CheckIcon /> {success}
            </div>
          )}

          {/* Info */}
          <div className="portrait-upload__info">
            Images are uploaded to Streetwise servers, resized to 512x512px and optimized for performance. All players will be able to see your portrait.
          </div>
        </>
      )}

      {!canEdit && portrait && (
        <div className="portrait-upload__info">
          Viewing character portrait
        </div>
      )}

      {showGallery && (
        <PortraitGallery
          onSelect={handleGallerySelect}
          onClose={() => setShowGallery(false)}
        />
      )}
    </div>
  );
};
