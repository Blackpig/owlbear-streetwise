# Streetwise Owlbear Rodeo Extension - Claude Code CLI Build Instructions

## Project Overview

Build a complete Owlbear Rodeo extension for **Streetwise**, a Year Zero Engine RPG about Victorian street urchins in 1890s London. A working proof-of-concept dice roller has been completed and validated - now integrate it into Owlbear Rodeo with full character sheet support and multi-player features.

---

## Quick Start

You are building an Owlbear Rodeo extension with these key features:
1. **Dice Roller** - Year Zero Engine mechanics with Scene Strain (COMPLETE POC)
2. **Character Sheet** - Attributes, Skills, Conditions, Talents
3. **Scene Strain Tracker** - Shared party resource using OBR room metadata
4. **Multi-player Support** - Synced state across all players

### Critical Owlbear Integration Points

**Extension Type:** Action/Popover (modal character sheet)  
**Metadata Storage:**
- Character data → Token metadata (`item.metadata['streetwise.character']`)
- Scene Strain → Room metadata (`room.metadata['streetwise.strain']`)

**Key OBR SDK Patterns:**
```typescript
import OBR from "@owlbear-rodeo/sdk";

// Initialize
await OBR.onReady();

// Get selected tokens
const selection = await OBR.player.getSelection();

// Update token metadata (character data)
await OBR.scene.items.updateItems(
  (item) => item.id === tokenId,
  (items) => {
    items.forEach(item => {
      item.metadata['streetwise.character'] = characterData;
    });
  }
);

// Update room metadata (Scene Strain)
await OBR.room.setMetadata({
  'streetwise.strain': strainPoints
});

// Listen for metadata changes
OBR.room.onMetadataChange((metadata) => {
  const strain = metadata['streetwise.strain'] || 0;
  // Update UI
});
```

---

## Phase 1: Project Setup

### 1.1 Initialize Owlbear Extension Project

```bash
# Create new directory
mkdir streetwise-extension
cd streetwise-extension

# Initialize with Vite + React + TypeScript
npm create vite@latest . -- --template react-ts

# Install Owlbear SDK
npm install @owlbear-rodeo/sdk

# Install dependencies
npm install
```

### 1.2 Copy POC Files

Transfer these files from the validated POC:
- `src/types/dice.ts` → Core game types
- `src/utils/diceRoller.ts` → Dice mechanics (battle-tested)
- `src/components/DiceDisplay.tsx` → Dice visualization
- `src/components/DiceDisplay.css` → Dice styling

**These files are COMPLETE and VALIDATED - do not modify the game logic!**

### 1.3 Create manifest.json

```json
{
  "name": "Streetwise Character Sheet",
  "version": "1.0.0",
  "manifest_version": 1,
  "description": "Character sheets and dice roller for Streetwise RPG",
  "author": "Your Name",
  "icon": "/icon.svg",
  "action": {
    "title": "Open Character Sheet",
    "icon": "/icon.svg",
    "popover": "/index.html",
    "height": 600,
    "width": 400
  }
}
```

Place in `/public/manifest.json`

### 1.4 Update vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    port: 3000,
    open: false
  }
});
```

---

## Phase 2: Owlbear Integration Setup

### 2.1 Testing During Development

**Two-window workflow:**

1. **Terminal 1: Run dev server**
   ```bash
   npm run dev
   # Opens at http://localhost:3000
   ```

2. **Terminal 2: Expose to Owlbear**
   ```bash
   # Install ngrok or use Vite's network option
   # Option A: Use Vite's --host flag
   npm run dev -- --host
   
   # Option B: Use ngrok
   ngrok http 3000
   ```

3. **In Owlbear Rodeo:**
   - Open a room
   - Click Extensions → Add Custom Extension
   - Enter your localhost URL (or ngrok URL): `http://localhost:3000/manifest.json`
   - Extension appears in toolbar

**Hot Reload:** Changes auto-reload in Owlbear!

### 2.2 Create OBR Context Provider

Create `src/contexts/OBRContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import OBR, { Metadata } from '@owlbear-rodeo/sdk';

interface OBRContextType {
  ready: boolean;
  role: 'GM' | 'PLAYER';
  selectedTokenId: string | null;
  sceneStrain: number;
  updateSceneStrain: (newStrain: number) => Promise<void>;
}

const OBRContext = createContext<OBRContextType | null>(null);

export const OBRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<'GM' | 'PLAYER'>('PLAYER');
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [sceneStrain, setSceneStrain] = useState(0);

  useEffect(() => {
    OBR.onReady(() => {
      setReady(true);
      
      // Get player role
      OBR.player.getRole().then(setRole);
      
      // Subscribe to selection changes
      OBR.player.onChange((player) => {
        setRole(player.role);
      });
      
      // Get initial selection
      OBR.player.getSelection().then((selection) => {
        setSelectedTokenId(selection[0] || null);
      });
      
      // Subscribe to selection changes
      const unsubscribe = OBR.player.onChange((player) => {
        if (player.selection && player.selection[0]) {
          setSelectedTokenId(player.selection[0]);
        }
      });
      
      // Subscribe to room metadata (Scene Strain)
      OBR.room.getMetadata().then((metadata) => {
        setSceneStrain((metadata['streetwise.strain'] as number) || 0);
      });
      
      OBR.room.onMetadataChange((metadata) => {
        setSceneStrain((metadata['streetwise.strain'] as number) || 0);
      });
      
      return () => {
        unsubscribe();
      };
    });
  }, []);

  const updateSceneStrain = async (newStrain: number) => {
    await OBR.room.setMetadata({
      'streetwise.strain': newStrain
    });
  };

  return (
    <OBRContext.Provider value={{
      ready,
      role,
      selectedTokenId,
      sceneStrain,
      updateSceneStrain
    }}>
      {children}
    </OBRContext.Provider>
  );
};

export const useOBR = () => {
  const context = useContext(OBRContext);
  if (!context) {
    throw new Error('useOBR must be used within OBRProvider');
  }
  return context;
};
```

### 2.3 Wrap App with OBR Provider

Update `src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { OBRProvider } from './contexts/OBRContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OBRProvider>
      <App />
    </OBRProvider>
  </React.StrictMode>,
);
```

---

## Phase 3: Character Data Model & Storage

### 3.1 Create Character Type

`src/types/character.ts`:

```typescript
export interface Character {
  id: string;
  name: string;
  archetype: Archetype;
  attributes: {
    strength: number;
    agility: number;
    wits: number;
    empathy: number;
  };
  skills: {
    burgle: number;
    deduce: number;
    hoodwink: number;
    notice: number;
    physick: number;
    pinch: number;
    scramble: number;
    scrap: number;
    sneak: number;
    streetwise: number;
    tinker: number;
  };
  conditions: Condition[];
  talents: string[]; // Talent IDs
  darkSecret: string;
  notes: string;
}

export type Condition = 'bruised' | 'hurt' | 'injured' | 'broken';

export type Archetype = 
  | 'artful-dodge'
  | 'brickyard-pug'
  | 'bright-spark'
  | 'penny-physick'
  | 'gutter-fixer'
  | 'street-nose'
  | 'card-twister';

export interface Skill {
  id: string;
  name: string;
  attribute: 'strength' | 'agility' | 'wits' | 'empathy';
  description: string;
}

export const SKILLS: Record<string, Skill> = {
  burgle: { id: 'burgle', name: 'Burgle', attribute: 'wits', description: 'Lockpicking, sneaking into buildings, petty theft' },
  deduce: { id: 'deduce', name: 'Deduce', attribute: 'wits', description: 'Solving puzzles, reasoning, connecting dots' },
  hoodwink: { id: 'hoodwink', name: 'Hoodwink', attribute: 'empathy', description: 'Deception, distraction, and lying' },
  notice: { id: 'notice', name: 'Notice', attribute: 'wits', description: 'Spotting clues, details, or hidden threats' },
  physick: { id: 'physick', name: 'Physick', attribute: 'empathy', description: 'Physical healing and first aid' },
  pinch: { id: 'pinch', name: 'Pinch', attribute: 'agility', description: 'Pickpocketing, sleight of hand, swiping things' },
  scramble: { id: 'scramble', name: 'Scramble', attribute: 'agility', description: 'Running, climbing, physical exertion' },
  scrap: { id: 'scrap', name: 'Scrap', attribute: 'strength', description: 'Fighting and brawling' },
  sneak: { id: 'sneak', name: 'Sneak', attribute: 'agility', description: 'Moving silently and hiding' },
  streetwise: { id: 'streetwise', name: 'Streetwise', attribute: 'wits', description: 'Navigating the streets, knowing the right contacts' },
  tinker: { id: 'tinker', name: 'Tinker', attribute: 'wits', description: 'Fixing, breaking, understanding machinery' }
};
```

### 3.2 Create Character Hook

`src/hooks/useCharacter.ts`:

```typescript
import { useState, useEffect } from 'react';
import OBR from '@owlbear-rodeo/sdk';
import { Character } from '../types/character';
import { useOBR } from '../contexts/OBRContext';

export function useCharacter() {
  const { selectedTokenId, ready } = useOBR();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !selectedTokenId) {
      setCharacter(null);
      setLoading(false);
      return;
    }

    // Load character from token metadata
    const loadCharacter = async () => {
      setLoading(true);
      const items = await OBR.scene.items.getItems([selectedTokenId]);
      if (items.length > 0) {
        const charData = items[0].metadata['streetwise.character'] as Character | undefined;
        setCharacter(charData || null);
      }
      setLoading(false);
    };

    loadCharacter();

    // Subscribe to changes
    const unsubscribe = OBR.scene.items.onChange(async (items) => {
      const token = items.find(item => item.id === selectedTokenId);
      if (token) {
        const charData = token.metadata['streetwise.character'] as Character | undefined;
        setCharacter(charData || null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [ready, selectedTokenId]);

  const updateCharacter = async (updates: Partial<Character>) => {
    if (!selectedTokenId || !character) return;

    const updatedCharacter = { ...character, ...updates };
    
    await OBR.scene.items.updateItems(
      [selectedTokenId],
      (items) => {
        items.forEach(item => {
          item.metadata['streetwise.character'] = updatedCharacter;
        });
      }
    );
    
    setCharacter(updatedCharacter);
  };

  return {
    character,
    loading,
    updateCharacter,
    hasCharacter: character !== null
  };
}
```

---

## Phase 4: Build Character Sheet Component

### 4.1 Character Sheet Layout

`src/components/CharacterSheet/CharacterSheet.tsx`:

```typescript
import React from 'react';
import { Character } from '../../types/character';
import { AttributeDisplay } from './AttributeDisplay';
import { SkillsList } from './SkillsList';
import { ConditionsTracker } from './ConditionsTracker';
import './CharacterSheet.css';

interface CharacterSheetProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  onRollSkill: (attribute: number, skill: number, skillName: string) => void;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({
  character,
  onUpdate,
  onRollSkill
}) => {
  const conditionPenalty = character.conditions.length;

  return (
    <div className="character-sheet">
      {/* Header */}
      <div className="character-sheet__header">
        <h1 className="character-name">{character.name}</h1>
        <div className="character-archetype">{character.archetype}</div>
      </div>

      {/* Conditions - Always visible at top */}
      <ConditionsTracker
        conditions={character.conditions}
        onChange={(conditions) => onUpdate({ conditions })}
      />

      {/* Attributes */}
      <div className="attributes-section">
        <h2>Attributes</h2>
        <div className="attributes-grid">
          <AttributeDisplay 
            name="Strength" 
            value={character.attributes.strength}
            penalty={conditionPenalty}
          />
          <AttributeDisplay 
            name="Agility" 
            value={character.attributes.agility}
            penalty={conditionPenalty}
          />
          <AttributeDisplay 
            name="Wits" 
            value={character.attributes.wits}
            penalty={conditionPenalty}
          />
          <AttributeDisplay 
            name="Empathy" 
            value={character.attributes.empathy}
            penalty={conditionPenalty}
          />
        </div>
      </div>

      {/* Skills - Click to roll */}
      <SkillsList
        character={character}
        conditionPenalty={conditionPenalty}
        onRollSkill={onRollSkill}
      />

      {/* Talents */}
      <div className="talents-section">
        <h2>Talents</h2>
        <div className="talents-list">
          {character.talents.map(talentId => (
            <div key={talentId} className="talent-item">
              {talentId}
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="notes-section">
        <h2>Notes</h2>
        <textarea
          value={character.notes}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          placeholder="Dark secret, backstory, etc..."
        />
      </div>
    </div>
  );
};
```

### 4.2 Conditions Tracker

`src/components/CharacterSheet/ConditionsTracker.tsx`:

```typescript
import React from 'react';
import { Condition } from '../../types/character';

const CONDITION_LADDER: Condition[] = ['bruised', 'hurt', 'injured', 'broken'];

interface ConditionsTrackerProps {
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
}

export const ConditionsTracker: React.FC<ConditionsTrackerProps> = ({
  conditions,
  onChange
}) => {
  const toggleCondition = (condition: Condition) => {
    const index = CONDITION_LADDER.indexOf(condition);
    
    if (conditions.includes(condition)) {
      // Remove this and all higher conditions
      onChange(CONDITION_LADDER.slice(0, index));
    } else {
      // Add this and all lower conditions
      onChange(CONDITION_LADDER.slice(0, index + 1));
    }
  };

  const penalty = conditions.length;

  return (
    <div className="conditions-tracker">
      <div className="conditions-label">
        Conditions {penalty > 0 && <span className="penalty">(-{penalty} dice)</span>}
      </div>
      <div className="conditions-boxes">
        {CONDITION_LADDER.map((condition) => (
          <button
            key={condition}
            className={`condition-box ${conditions.includes(condition) ? 'active' : ''}`}
            onClick={() => toggleCondition(condition)}
            title={condition}
          >
            {condition[0].toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};
```

### 4.3 Skills List with Click-to-Roll

`src/components/CharacterSheet/SkillsList.tsx`:

```typescript
import React from 'react';
import { Character, SKILLS } from '../../types/character';

interface SkillsListProps {
  character: Character;
  conditionPenalty: number;
  onRollSkill: (attribute: number, skill: number, skillName: string) => void;
}

export const SkillsList: React.FC<SkillsListProps> = ({
  character,
  conditionPenalty,
  onRollSkill
}) => {
  const groupedSkills = {
    strength: ['scrap'],
    agility: ['pinch', 'scramble', 'sneak'],
    wits: ['burgle', 'deduce', 'notice', 'streetwise', 'tinker'],
    empathy: ['hoodwink', 'physick']
  };

  const handleSkillClick = (skillId: string) => {
    const skill = SKILLS[skillId];
    const attributeValue = character.attributes[skill.attribute];
    const skillValue = character.skills[skillId as keyof typeof character.skills];
    
    onRollSkill(attributeValue, skillValue, skill.name);
  };

  return (
    <div className="skills-section">
      <h2>Skills</h2>
      
      {Object.entries(groupedSkills).map(([attribute, skillIds]) => (
        <div key={attribute} className="skill-group">
          <h3>{attribute.charAt(0).toUpperCase() + attribute.slice(1)}</h3>
          
          {skillIds.map(skillId => {
            const skill = SKILLS[skillId];
            const skillValue = character.skills[skillId as keyof typeof character.skills];
            const attributeValue = character.attributes[attribute as keyof typeof character.attributes];
            const totalDice = Math.max(1, attributeValue + skillValue - conditionPenalty);
            
            return (
              <button
                key={skillId}
                className="skill-item"
                onClick={() => handleSkillClick(skillId)}
                title={skill.description}
              >
                <span className="skill-name">{skill.name}</span>
                <span className="skill-value">{skillValue}</span>
                <span className="skill-pool">({totalDice}d)</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
```

---

## Phase 5: Integrate Dice Roller with OBR

### 5.1 Update Dice Roller for OBR

Modify the existing `DiceRoller` component to:
1. Use Scene Strain from OBR room metadata
2. Broadcast rolls to chat
3. Update Scene Strain automatically on push

`src/components/DiceRoller/DiceRollerOBR.tsx`:

```typescript
import React, { useState } from 'react';
import OBR from '@owlbear-rodeo/sdk';
import { useOBR } from '../../contexts/OBRContext';
import { performRoll, pushRoll, checkScenePanic, calculateNewStrain } from '../../utils/diceRoller';
import { DiceDisplayFull } from '../DiceDisplay';
import { DiceRoll } from '../../types/dice';

interface DiceRollerOBRProps {
  attribute: number;
  skill: number;
  skillName: string;
  modifier?: number;
  canPushTwice?: boolean;
}

export const DiceRollerOBR: React.FC<DiceRollerOBRProps> = ({
  attribute,
  skill,
  skillName,
  modifier = 0,
  canPushTwice = false
}) => {
  const { sceneStrain, updateSceneStrain } = useOBR();
  const [currentRoll, setCurrentRoll] = useState<DiceRoll | null>(null);

  const handleRoll = async () => {
    const roll = performRoll({
      attribute,
      skill,
      modifier,
      strainPoints: sceneStrain,
      canPushTwice
    });
    
    setCurrentRoll(roll);
    
    // Broadcast to chat
    await OBR.chat.sendMessage({
      text: `${skillName}: ${roll.successes} success${roll.successes !== 1 ? 'es' : ''}`,
      metadata: { roll }
    });
  };

  const handlePush = async () => {
    if (!currentRoll || !currentRoll.canPush) return;
    
    const pushedRoll = pushRoll(currentRoll, canPushTwice);
    setCurrentRoll(pushedRoll);
    
    // Update scene strain
    const newStrain = calculateNewStrain(sceneStrain, pushedRoll);
    await updateSceneStrain(newStrain);
    
    // Check for panic
    const panic = checkScenePanic(pushedRoll, sceneStrain);
    if (panic.triggered && panic.strainIncrease) {
      await updateSceneStrain(newStrain + panic.strainIncrease);
    }
    
    // Broadcast
    await OBR.chat.sendMessage({
      text: `PUSHED ${skillName}: ${pushedRoll.successes} success${pushedRoll.successes !== 1 ? 'es' : ''}, +${pushedRoll.totalBanes} Strain`,
      metadata: { roll: pushedRoll }
    });
  };

  return (
    <div className="dice-roller-obr">
      <button onClick={handleRoll}>Roll {skillName}</button>
      
      {currentRoll && (
        <>
          <DiceDisplayFull
            regularDice={currentRoll.results.regular}
            strainDice={currentRoll.results.strain}
            successes={currentRoll.successes}
            regularBanes={currentRoll.regularBanes}
            strainBanes={currentRoll.strainBanes}
            pushed={currentRoll.pushed}
          />
          
          {currentRoll.canPush && (
            <button onClick={handlePush}>Push Roll</button>
          )}
        </>
      )}
    </div>
  );
};
```

---

## Phase 6: Main App Integration

### 6.1 App.tsx - Put It All Together

```typescript
import React, { useState } from 'react';
import { useOBR } from './contexts/OBRContext';
import { useCharacter } from './hooks/useCharacter';
import { CharacterSheet } from './components/CharacterSheet/CharacterSheet';
import { DiceRollerOBR } from './components/DiceRoller/DiceRollerOBR';
import './App.css';

function App() {
  const { ready, selectedTokenId, sceneStrain, updateSceneStrain } = useOBR();
  const { character, loading, updateCharacter, hasCharacter } = useCharacter();
  const [rollParams, setRollParams] = useState<{
    attribute: number;
    skill: number;
    skillName: string;
  } | null>(null);

  if (!ready) {
    return <div className="loading">Connecting to Owlbear Rodeo...</div>;
  }

  if (!selectedTokenId) {
    return <div className="no-selection">Select a token to view character sheet</div>;
  }

  if (loading) {
    return <div className="loading">Loading character...</div>;
  }

  if (!hasCharacter) {
    return (
      <div className="no-character">
        <p>No character data found for this token.</p>
        <button onClick={() => {/* Create character wizard */}}>
          Create Character
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Scene Strain Tracker - Always visible */}
      <div className="scene-strain-banner">
        <span>Scene Strain: {sceneStrain}</span>
        <button onClick={() => updateSceneStrain(0)}>Reset</button>
      </div>

      {/* Character Sheet */}
      <CharacterSheet
        character={character!}
        onUpdate={updateCharacter}
        onRollSkill={(attribute, skill, skillName) => {
          setRollParams({ attribute, skill, skillName });
        }}
      />

      {/* Dice Roller Modal */}
      {rollParams && (
        <div className="dice-modal">
          <DiceRollerOBR {...rollParams} />
          <button onClick={() => setRollParams(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default App;
```

---

## Phase 7: Build & Deploy

### 7.1 Build for Production

```bash
npm run build
```

Creates `dist/` folder with:
- `index.html`
- `manifest.json`
- `assets/` (bundled JS/CSS)

### 7.2 Test Production Build

```bash
npm run preview
```

### 7.3 Deploy Options

**Option A: GitHub Pages**
```bash
# In package.json, add:
"homepage": "https://yourusername.github.io/streetwise-extension"

# Build and deploy
npm run build
# Push dist/ to gh-pages branch
```

**Option B: Netlify/Vercel**
- Connect repo
- Build command: `npm run build`
- Publish directory: `dist`

**Option C: Self-host**
- Upload `dist/` folder to web server
- Serve at `https://yourdomain.com/streetwise/`

### 7.4 Add to Owlbear

In Owlbear Rodeo:
1. Extensions → Add Custom Extension
2. Enter: `https://your-url.com/manifest.json`
3. Extension appears in toolbar

---

## Implementation Checklist

### ✅ Phase 1: Setup
- [ ] Initialize Vite project
- [ ] Install OBR SDK
- [ ] Copy POC files (dice logic, components, styles)
- [ ] Create manifest.json
- [ ] Configure vite.config.ts

### ✅ Phase 2: OBR Integration
- [ ] Create OBRContext provider
- [ ] Test two-window workflow (dev server + Owlbear)
- [ ] Verify extension loads in Owlbear
- [ ] Verify Scene Strain syncs across players

### ✅ Phase 3: Character Data
- [ ] Create character types
- [ ] Create useCharacter hook
- [ ] Test saving/loading from token metadata
- [ ] Verify persistence across sessions

### ✅ Phase 4: Character Sheet
- [ ] Build CharacterSheet component
- [ ] Build AttributeDisplay component
- [ ] Build SkillsList with click-to-roll
- [ ] Build ConditionsTracker
- [ ] Test all updates save to token

### ✅ Phase 5: Dice Integration
- [ ] Integrate validated dice roller
- [ ] Connect to Scene Strain from room metadata
- [ ] Broadcast rolls to OBR chat
- [ ] Test push rolls update strain
- [ ] Test Scene Panic triggers

### ✅ Phase 6: Polish
- [ ] Victorian aesthetic styling
- [ ] Responsive layout for popover size
- [ ] Loading states
- [ ] Error handling
- [ ] GM-only controls

### ✅ Phase 7: Deploy
- [ ] Build production version
- [ ] Test in production mode
- [ ] Deploy to hosting
- [ ] Test in real Owlbear room
- [ ] Test multi-player sync

---

## Critical Implementation Notes

### DO NOT MODIFY
These files from the POC are **validated and complete**:
- `src/types/dice.ts`
- `src/utils/diceRoller.ts`
- `src/components/DiceDisplay.tsx`
- `src/components/DiceDisplay.css`

The dice mechanics are PROVEN correct. Use them as-is.

### OBR Best Practices

1. **Always await OBR.onReady()** before any OBR calls
2. **Use metadata for persistence**, not localStorage
3. **Room metadata** for shared state (Scene Strain)
4. **Item metadata** for per-token data (characters)
5. **Subscribe to changes** with `onChange` listeners
6. **Broadcast important actions** to chat

### Testing Workflow

1. Start dev server: `npm run dev -- --host`
2. Add extension in Owlbear: `http://localhost:3000/manifest.json`
3. Create/select a token
4. Open extension from toolbar
5. Make changes → verify they save
6. Reload Owlbear → verify persistence
7. Open in second browser → verify sync

### Common Issues

**Extension won't load:**
- Check manifest.json is accessible
- Check CORS headers (Vite dev server should be fine)
- Check console for errors

**Metadata not saving:**
- Verify token is selected
- Check token ID is valid
- Await all async operations

**Scene Strain not syncing:**
- Verify using room.setMetadata (not scene)
- Check onChange listener is registered
- Test with two browser windows

---

## Success Criteria

Extension is complete when:

✅ Character sheet displays for selected token  
✅ Attributes, skills, conditions editable and persist  
✅ Click skill to roll dice with correct pool  
✅ Scene Strain syncs across all players in real-time  
✅ Push rolls update Scene Strain automatically  
✅ Scene Panic triggers and displays correctly  
✅ Rolls broadcast to OBR chat  
✅ Victorian aesthetic looks good in Owlbear popover  
✅ Works in production build  
✅ Multiple players can use simultaneously  

---

## Resources

**Owlbear Rodeo Docs:**
- Getting Started: https://docs.owlbear.rodeo/extensions/getting-started
- SDK Reference: https://docs.owlbear.rodeo/sdk/reference
- Metadata Guide: https://docs.owlbear.rodeo/extensions/metadata
- Examples: https://github.com/owlbear-rodeo/extensions

**Streetwise Resources:**
- Game rules PDF (attached)
- Validated POC (dice-roller-poc.tar.gz)
- Specification document (streetwise-extension-spec.md)

**Reference Extension:**
- Shadowdark: https://github.com/maxpaulus43/owlbear-shadowdark-character-sheet

---

## Next Steps After This Build

Future enhancements (post-MVP):
- Character creation wizard
- Talent descriptions with tooltips
- Combat maneuvers reference
- Scene Challenge tracker
- Initiative tracker
- Import/export characters
- Dice animation
- Sound effects

---

## Questions?

If you encounter issues:

1. **Check OBR SDK docs** - Metadata and onChange patterns
2. **Test in isolation** - Does the component work standalone?
3. **Check console** - OBR errors are usually descriptive
4. **Verify manifest** - Is it serving correctly?
5. **Test persistence** - Save, reload, check metadata

The POC dice mechanics are solid. The challenge is the OBR integration, which is well-documented and straightforward. Follow the patterns above and you'll have a working extension quickly!

**Build this step-by-step, test each phase, and you'll have a complete Streetwise extension for Owlbear Rodeo!**
