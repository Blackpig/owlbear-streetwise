import { useState, useEffect, useRef } from 'react';
import { useOBR } from './contexts/OBRContext';
import { useCharacter } from './hooks/useCharacter';
import { CharacterSheet } from './components/CharacterSheet/CharacterSheet';
import { DiceRollerOBR } from './components/DiceRoller/DiceRollerOBR';
import { Toolbar } from './components/Toolbar/Toolbar';
import { RollNotification } from './components/RollNotification/RollNotification';
import { getTalentEffects, canPushTwice } from './services/talentEffectsService';
import { SKILLS } from './types/character';
import type { DiceRollMessage, ScenePanicMessage, PlayerAssistanceMessage } from './types/broadcast';
import './App.css';

interface RollParams {
  attribute: number;
  skill: number;
  skillName: string;
  skillId: string;
}

function App() {
  const { ready, role, sceneStrain, updateSceneStrain, isViewingSelf, playerId, latestBroadcast } = useOBR();
  const { character, loading, updateCharacter, hasCharacter, canEdit } = useCharacter();
  const [rollParams, setRollParams] = useState<RollParams | null>(null);
  const [notifications, setNotifications] = useState<(DiceRollMessage | ScenePanicMessage | PlayerAssistanceMessage)[]>([]);
  const processedTimestampsRef = useRef<Set<number>>(new Set());

  // Listen for broadcast messages
  useEffect(() => {
    if (!latestBroadcast) return;

    const { message, timestamp } = latestBroadcast;

    // Skip if we've already processed this message
    if (processedTimestampsRef.current.has(timestamp)) {
      return;
    }

    // Don't show notifications for our own actions
    if (message.type === 'STREETWISE_ROLL' || message.type === 'SCENE_PANIC') {
      if (message.playerId === playerId) return;
    }

    // Don't show assistance notifications if we're the one giving help
    if (message.type === 'PLAYER_ASSISTANCE') {
      if (message.fromPlayerId === playerId) return;
    }

    // Skip strain change messages (these don't need notifications)
    if (message.type === 'STRAIN_CHANGE') {
      processedTimestampsRef.current.add(timestamp);
      return;
    }

    // Mark this timestamp as processed
    processedTimestampsRef.current.add(timestamp);

    // Add notification to the list
    setNotifications(prev => [...prev, message]);
  }, [latestBroadcast, playerId]);

  const dismissNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  if (!ready) {
    return (
      <div className="loading">
        <h2>Connecting to Owlbear Rodeo...</h2>
        <p>Please wait...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading character...</h2>
      </div>
    );
  }

  // Test character creation function (always available)
  const createTestCharacter = () => {
    const testCharacter = {
      id: playerId,
      name: `Character ${playerId.substring(0, 8)}`,
      archetype: 'artful-dodge' as const,
      attributes: {
        strength: 2,
        agility: 4,
        wits: 4,
        empathy: 3
      },
      skills: {
        burgle: 3,
        deduce: 2,
        hoodwink: 3,
        notice: 2,
        physick: 0,
        pinch: 3,
        scramble: 2,
        scrap: 1,
        sneak: 2,
        streetwise: 3,
        tinker: 1
      },
      conditions: [],
      talents: ['Light Fingered', 'Fast Talk'],
      quirks: ['Wears a tattered red scarf', 'Always keeps a bent spoon in pocket'],
      backstory: ['Grew up in workhouse', 'Escaped and learned to survive on the streets'],
      darkSecret: 'Witnessed a murder by a prominent gentleman',
      possessions: 'Bent spoon, tattered red scarf, lucky marble',
      notes: 'Known as "The Artful Dodger". Quick-witted pickpocket from the East End.',
      extendedNotes: 'Learned pickpocketing from an old fence in Whitechapel. Has a network of street urchins who trust them.'
    };
    updateCharacter(testCharacter);
  };

  return (
    <div className="app">
      {/* Toolbar - Game Title, Actions, Trackers */}
      <Toolbar
        character={character || null}
        onImport={(character) => updateCharacter(character)}
        onPortraitUpdate={(portrait) => updateCharacter({ portrait })}
        canEdit={canEdit}
        sceneStrain={sceneStrain}
        onStrainUpdate={updateSceneStrain}
        isGM={role === 'GM'}
        readMode={!canEdit}
      />

      {/* Character Sheet or No Character Message */}
      <div className="app__content">
        {!hasCharacter ? (
          <div className="no-character-message">
            <h2>No Character Data</h2>
            {isViewingSelf ? (
              <>
                <p>Create or Import a character using the icons above.</p>
                {/* Test character option (dev only) */}
                <button
                  onClick={createTestCharacter}
                  className="test-character-btn"
                  style={{ marginTop: '16px' }}
                >
                  Create Test Character (Dev)
                </button>
              </>
            ) : (
              <p>This player doesn't have a character yet.</p>
            )}
          </div>
        ) : (
          <CharacterSheet
            character={character!}
            onUpdate={canEdit ? updateCharacter : () => {}}
            onRollSkill={(attribute, skill, skillName, skillId) => {
              setRollParams({ attribute, skill, skillName, skillId });
            }}
            onRollAttribute={(attribute, attributeName, attributeKey) => {
              setRollParams({ attribute, skill: 0, skillName: attributeName, skillId: attributeKey });
            }}
            canEdit={canEdit}
            playerId={playerId}
            isGM={role === 'GM'}
          />
        )}
      </div>

      {/* Dice Roller Modal */}
      {rollParams && character && (() => {
        // Check if this is a skill roll (not just an attribute roll)
        const isSkillRoll = rollParams.skillId in SKILLS;
        const talentEffects = isSkillRoll ? getTalentEffects(character, rollParams.skillId) : null;

        return (
          <div className="dice-modal-overlay">
            <div className="dice-modal">
              <DiceRollerOBR
                attribute={rollParams.attribute}
                skill={rollParams.skill}
                skillName={rollParams.skillName}
                characterName={character.name}
                canPushTwice={isSkillRoll ? canPushTwice(character, rollParams.skillId) : false}
                activeTalents={talentEffects?.activeTalents || []}
                talentDescription={talentEffects?.description || ''}
                isAttributeRoll={!isSkillRoll}
                onClose={() => setRollParams(null)}
              />
            </div>
          </div>
        );
      })()}

      {/* Roll Notifications */}
      {notifications.map((notification, index) => (
        <RollNotification
          key={notification.timestamp}
          message={notification}
          onDismiss={() => dismissNotification(index)}
        />
      ))}
    </div>
  );
}

export default App;
