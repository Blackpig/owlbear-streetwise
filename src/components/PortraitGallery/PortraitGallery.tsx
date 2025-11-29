import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import './PortraitGallery.css';

interface PortraitGalleryProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

type Gender = 'boys' | 'girls';

const BASE_URL = 'https://raw.githubusercontent.com/Blackpig/Streetwise/main/public/images/portraits';

// Generate portrait URLs for boys (01-50) and girls (01-50)
const generatePortraits = (gender: Gender): string[] => {
  return Array.from({ length: 50 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return `${BASE_URL}/${gender}/${num}.jpeg`;
  });
};

export const PortraitGallery: React.FC<PortraitGalleryProps> = ({ onSelect, onClose }) => {
  const [selectedGender, setSelectedGender] = useState<Gender>('boys');
  const [selectedPortrait, setSelectedPortrait] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const portraits = generatePortraits(selectedGender);

  const handleThumbnailClick = (url: string) => {
    setSelectedPortrait(url);
  };

  const handleAddPortrait = () => {
    if (selectedPortrait) {
      onSelect(selectedPortrait);
    }
  };

  const handleImageError = (url: string) => {
    setImageErrors(prev => new Set(prev).add(url));
  };

  return createPortal(
    <>
      <div className="portrait-gallery-backdrop" onClick={onClose} />
      <div className="portrait-gallery">
        <div className="portrait-gallery__header">
          <h3>Choose a Portrait</h3>
          <button className="portrait-gallery__close" onClick={onClose}>×</button>
        </div>

        <div className="portrait-gallery__content">
          {/* Gender Toggle */}
          <div className="portrait-gallery__toggle">
            <button
              className={`portrait-gallery__toggle-btn ${selectedGender === 'boys' ? 'portrait-gallery__toggle-btn--active' : ''}`}
              onClick={() => {
                setSelectedGender('boys');
                setSelectedPortrait(null);
              }}
            >
              Boys
            </button>
            <button
              className={`portrait-gallery__toggle-btn ${selectedGender === 'girls' ? 'portrait-gallery__toggle-btn--active' : ''}`}
              onClick={() => {
                setSelectedGender('girls');
                setSelectedPortrait(null);
              }}
            >
              Girls
            </button>
          </div>

          {/* Large Preview */}
          {selectedPortrait && !imageErrors.has(selectedPortrait) && (
            <div className="portrait-gallery__preview">
              <img
                src={selectedPortrait}
                alt="Selected portrait"
                onError={() => handleImageError(selectedPortrait)}
              />
            </div>
          )}

          {/* Thumbnail Grid */}
          <div className="portrait-gallery__grid">
            {portraits.map((url) => (
              <div
                key={url}
                className={`portrait-gallery__thumbnail ${selectedPortrait === url ? 'portrait-gallery__thumbnail--selected' : ''} ${imageErrors.has(url) ? 'portrait-gallery__thumbnail--error' : ''}`}
                onClick={() => handleThumbnailClick(url)}
              >
                {!imageErrors.has(url) ? (
                  <img
                    src={url}
                    alt={`Portrait ${url.split('/').pop()}`}
                    onError={() => handleImageError(url)}
                  />
                ) : (
                  <div className="portrait-gallery__thumbnail-error">✕</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="portrait-gallery__footer">
          <button
            className="portrait-gallery__btn portrait-gallery__btn--cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="portrait-gallery__btn portrait-gallery__btn--confirm"
            onClick={handleAddPortrait}
            disabled={!selectedPortrait || imageErrors.has(selectedPortrait)}
          >
            Add Portrait
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};
