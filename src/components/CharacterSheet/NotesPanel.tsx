import type { Character } from '../../types/character';
import './NotesPanel.css';

interface NotesPanelProps {
  character: Character;
  canEdit: boolean;
  onUpdate: (updates: Partial<Character>) => void;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ character, canEdit, onUpdate }) => {
  return (
    <div className="notes-panel">
      <div className="notes-panel__content">
        {/* Dark Secret */}
        <div className="notes-section">
          <h3 className="notes-section__title">🔒 Dark Secret</h3>
          {canEdit ? (
            <textarea
              className="notes-section__textarea"
              value={character.darkSecret || ''}
              onChange={(e) => onUpdate({ darkSecret: e.target.value })}
              placeholder="What dark secret does your character hide?"
              rows={3}
            />
          ) : (
            <div className="notes-section__text">
              {character.darkSecret || <em>No dark secret</em>}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="notes-section">
          <h3 className="notes-section__title">📝 Notes</h3>
          {canEdit ? (
            <textarea
              className="notes-section__textarea"
              value={character.notes || ''}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Backstory, quirks, appearance, events..."
              rows={5}
            />
          ) : (
            <div className="notes-section__text">
              {character.notes || <em>No notes</em>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
