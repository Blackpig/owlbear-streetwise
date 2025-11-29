import React, { useState, useRef } from 'react';
import type { Character } from '../../types/character';
import { importCharacter, downloadCharacterJSON } from '../../utils/characterImportExport';
import { ImportIcon, ExportIcon } from '../Icons/Icons';
import './ImportExport.css';

interface ImportExportProps {
  character: Character | null;
  onImport: (character: Character) => void;
  canEdit: boolean;
}

export const ImportExport: React.FC<ImportExportProps> = ({ character, onImport, canEdit }) => {
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (!character) return;
    downloadCharacterJSON(character);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = importCharacter(content);

      if (result.success && result.character) {
        onImport(result.character);
        setImportSuccess(true);
        setImportError(null);
        setTimeout(() => setImportSuccess(false), 3000);
      } else {
        setImportError(result.errors?.join(', ') || 'Unknown error');
        setImportSuccess(false);
      }
    };

    reader.onerror = () => {
      setImportError('Failed to read file');
      setImportSuccess(false);
    };

    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="import-export">
      <div className="import-export__header">
        <h3>Character Data</h3>
      </div>

      <div className="import-export__actions">
        {canEdit && (
          <button
            className="import-export__button import-export__button--import"
            onClick={handleImportClick}
            title="Import character from JSON file"
          >
            <span className="import-export__icon">
              <ImportIcon />
            </span>
            Import Character
          </button>
        )}

        {character && (
          <button
            className="import-export__button import-export__button--export"
            onClick={handleExport}
            title="Export character to JSON file"
          >
            <span className="import-export__icon">
              <ExportIcon />
            </span>
            Export Character
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Success message */}
      {importSuccess && (
        <div className="import-export__message import-export__message--success">
          Character imported successfully!
        </div>
      )}

      {/* Error message */}
      {importError && (
        <div className="import-export__message import-export__message--error">
          <strong>Import failed:</strong> {importError}
        </div>
      )}

      {!canEdit && (
        <div className="import-export__info">
          Import is only available when viewing your own character
        </div>
      )}
    </div>
  );
};
