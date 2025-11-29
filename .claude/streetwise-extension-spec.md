# Streetwise Owlbear Rodeo Extension - Development Specification

## Executive Summary

This document provides a complete specification for building an Owlbear Rodeo extension for **Streetwise**, a Year Zero Engine RPG about Victorian street urchins in 1890s London. The extension will provide character sheet management, specialized dice rolling mechanics, and shared scene tracking.

---

## Game Mechanics Overview

### Core System: Year Zero Engine (Modified)

**Dice Pool Resolution:**
- Roll d6s equal to: Attribute + Skill + Scene Strain Points
- **Success**: Each 6 rolled = 1 success
- **Bane**: Each 1 rolled = potential complication (adds Scene Strain)
- **Pass/Fail**: At least 1 success = pass, 0 successes = fail
- **Extra Successes**: Can be spent on maneuvers (in combat) or narrative advantages

**Pushing Rolls:**
- After initial roll, player may "Push" to reroll all non-6, non-1 dice
- Can only Push once per roll (some Talents allow pushing twice)
- **Consequence**: All Banes from both rolls count toward Scene Strain

**Scene Strain Points (Critical Mechanic):**
- Shared resource across the entire party (not per-character)
- Starts at 0 each scene
- Increases when players Push rolls (by number of total Banes)
- Adds dice to ALL rolls (this makes success easier but riskier)
- When you roll Banes on Strain dice, trigger Scene Panic table
- Resets to 0 at scene end

**Scene Panic Table:**
- Triggered when Banes appear on Strain dice
- Roll d6 + current Strain Points, consult table:
  - 1-6: Keep it together (no effect)
  - 7-8: Minor complication (+1 Strain)
  - 9-10: Major complication (+1 Strain)
  - 11-12: Escalation (+1 Strain)
  - 13+: Chaos

---

## Character Sheet Structure

### Attributes (4 core stats)
- **Strength** (physical power)
- **Agility** (speed, dexterity)
- **Wits** (intelligence, perception)
- **Empathy** (social, understanding)

**Character Creation Values:**
- Start all at 0
- Distribute: one +4, two +3, one +2
- Add +1 to Key Attribute (from Archetype)

### Archetypes (8 types)
Each provides:
- Key Attribute (gets +1)
- 2-3 starting Talents
- 3 Dark Secret options
- Suggested skills

**List:**
1. Artful Dodge (Wits) - thief, fast talker
2. Brickyard Pug (Strength) - fighter, protector
3. Bright Spark (Wits) - investigator, clever
4. Penny Physick (Empathy) - healer
5. Gutter Fixer (Empathy) - deal maker, networker
6. Street Nose (Agility) - spy, eavesdropper
7. Card Twister (Empathy) - gambler, trickster

### Skills (11 total)
Each linked to an attribute:

**Strength:**
- Scrap - fighting, brawling

**Agility:**
- Pinch - pickpocketing, sleight of hand
- Scramble - running, climbing, physical exertion
- Sneak - moving silently, hiding

**Wits:**
- Burgle - lockpicking, breaking & entering
- Deduce - solving puzzles, reasoning
- Notice - spotting clues, awareness
- Streetwise - navigating city, contacts
- Tinker - fixing/breaking machinery

**Empathy:**
- Hoodwink - deception, lying, charm
- Physick - healing, first aid

**Character Creation Values:**
- Two skills at 3
- Two skills at 2
- Two skills at 1
- All others at 0

### Talents
Special abilities that modify rules or add capabilities. Examples:
- **Fast Talk**: Use Wits instead of Empathy for persuasion
- **Light Fingered**: Can Push Pinch rolls twice
- **Stand Firm**: Ignore first Condition when braced
- **Bodyguard**: Intercept attacks on nearby allies
- **Vital Clue**: Ask GM a question about a clue on successful Deduce
- **Gone In A Blink**: Auto-escape in chosen urban setting
- **Up and at 'em**: Roll 2d6 for initiative, take highest

Start with 1 Talent from Archetype list.

### Conditions (Health/Damage)
Ladder system (NOT hit points):
1. **Bruised** (-1 to all rolls)
2. **Hurt** (-2 to all rolls)
3. **Injured** (-3 to all rolls)
4. **Broken** (-4 to all rolls, can barely act)
5. Death (if damaged while Broken)

**Stacking**: Each Condition adds -1 modifier (removes 1 die from pool)

**Healing:**
- Physick skill: 1 Condition per success
- Long Rest (sleep 1 shift): Remove 1 Condition
- Talent "Emergency Patch": 1 per success (once per scene)
- Talent "Poultice & Patience": Full heal over 1 hour (outside combat)

### Other Character Data
- Name (can roll on d66 table)
- Dark Secret (one from Archetype list)
- Appearance Quirks (1-2 rolled details)
- Backstory Events (2-3 rolled tragedies/triumphs)
- Age: 10-15 years old

---

## Extension Components

### 1. Character Sheet Extension

**Purpose**: Display and manage character data, initiate rolls

**Key Features:**
- **Attribute Display**: Large, clear numbers for Str/Agi/Wits/Emp
- **Skills List**: Grouped by attribute, showing skill value
- **Click-to-Roll**: Clicking skill initiates dice roll with Attribute+Skill
- **Conditions Tracker**: 
  - Visual indicator (4 boxes: □□□□)
  - Click to add/remove conditions
  - Shows current penalty
- **Archetype Badge**: Visual indicator of character type
- **Talents List**: Expandable panel showing active talents
- **Notes Section**: Dark Secret, quirks, backstory

**UI Layout Inspiration:**
- Follow Shadowdark's clean, readable design
- Use Victorian-era aesthetic (dark browns, aged paper texture)
- Clear typography for readability

**Technical Considerations:**
- Store character data in Owlbear metadata
- Persist across sessions
- Allow GM to view all character sheets
- Import/export character data (JSON format)

### 2. Dice Roller Extension

**Purpose**: Handle Year Zero dice mechanics with Scene Strain integration

**Critical Features:**

**A. Visual Dice Differentiation:**
- **Regular Dice** (Attribute + Skill): One color (e.g., ivory/cream)
- **Strain Dice** (Scene Strain Points): Different color (e.g., red/crimson)
- Clearly labeled in UI: "3 Regular + 2 Strain"

**B. Roll Resolution:**
- Display all dice results
- Count and highlight Successes (6s)
- Count and highlight Banes (1s)
- Separate Banes by die type:
  - "Regular Banes: 1"
  - "Strain Banes: 1" (triggers Scene Panic)
- Show total: "2 Successes, 2 Banes"

**C. Push Roll Functionality:**
- After initial roll, show "Push Roll?" button
- When pushed:
  - Keep all 6s and 1s
  - Reroll all other dice
  - Combine results from both rolls
  - Calculate total Banes (original + pushed)
  - Update Scene Strain by total Banes
- Disable after one push (unless Talent allows second)

**D. Modifiers:**
- Input field for situational modifiers (+1, +2, -1, -2, etc.)
- Positive modifiers ADD dice
- Negative modifiers REMOVE dice
- Show final pool: "Base 5 + Mod +2 + Strain 3 = 10 dice"

**E. Roll Types:**
- **Attribute + Skill**: Standard roll
- **Attribute Only**: For raw attribute checks
- **Opposed Roll**: Two characters roll, highest wins

**Technical Implementation:**
- Integrate with Owlbear's dice roller API
- Store roll history (last 5 rolls visible)
- Animate dice roll (use Owlbear's native animations)
- Support roll broadcasting to all players

### 3. Scene Strain Tracker

**Purpose**: Shared party resource that affects all rolls

**Key Features:**

**A. Display:**
- Large, prominent number showing current Strain
- Visual indicator of danger level:
  - 0-3: Green (low risk)
  - 4-6: Yellow (moderate)
  - 7-9: Orange (high)
  - 10+: Red (critical)

**B. Controls:**
- GM can manually adjust (+/- buttons)
- Auto-increments when players Push (by total Banes)
- "Reset Scene" button (sets to 0)

**C. Integration:**
- Dice roller automatically reads current Strain
- Adds Strain dice to all rolls
- Scene Panic check triggers on Strain Banes

**D. Scene Panic Integration:**
- When Strain Banes rolled, show "Scene Panic!" alert
- Display calculation: "d6 + Strain = Result"
- Show table result with description
- GM can override/adjust

**Technical Considerations:**
- Store in Owlbear room metadata (shared state)
- Real-time sync across all players
- Persist during session (clear on scene reset)
- Visible to all players at all times

### 4. Additional Tools (Optional/Future)

**A. Initiative Tracker:**
- d6 roll for each character
- Special handling for "Up and at 'em" Talent (roll 2, take highest)
- Drag-to-reorder functionality

**B. Scene Challenge Tracker:**
- Target number input (e.g., 9 successes needed)
- Success counter (clicks to increment)
- Opposition counter (Banes counter)
- Visual progress bars

**C. Reference Tables:**
- Scene Panic table
- Combat maneuvers list
- Talent quick reference
- Condition effects reminder

**D. Character Creator:**
- Guided character creation workflow
- Random name/quirk/backstory generators (using d66 tables)
- Archetype selection with descriptions
- Attribute/Skill point allocation validation

---

## Technical Architecture

### Technology Stack
- **Framework**: React + TypeScript
- **Build Tool**: Vite (as per Owlbear docs)
- **Styling**: CSS Modules or Tailwind CSS
- **OBR SDK**: @owlbear-rodeo/sdk

### Project Structure

```
streetwise-extension/
├── src/
│   ├── components/
│   │   ├── CharacterSheet/
│   │   │   ├── CharacterSheet.tsx
│   │   │   ├── AttributeDisplay.tsx
│   │   │   ├── SkillsList.tsx
│   │   │   ├── ConditionsTracker.tsx
│   │   │   ├── TalentsPanel.tsx
│   │   │   └── CharacterSheet.module.css
│   │   ├── DiceRoller/
│   │   │   ├── DiceRoller.tsx
│   │   │   ├── DicePool.tsx
│   │   │   ├── RollResult.tsx
│   │   │   ├── PushButton.tsx
│   │   │   └── DiceRoller.module.css
│   │   ├── SceneStrain/
│   │   │   ├── StrainTracker.tsx
│   │   │   ├── PanicAlert.tsx
│   │   │   └── StrainTracker.module.css
│   │   └── shared/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       └── Input.tsx
│   ├── types/
│   │   ├── character.ts
│   │   ├── dice.ts
│   │   └── scene.ts
│   ├── utils/
│   │   ├── diceRoller.ts
│   │   ├── strainCalculator.ts
│   │   └── characterHelpers.ts
│   ├── data/
│   │   ├── archetypes.ts
│   │   ├── talents.ts
│   │   ├── skills.ts
│   │   └── tables.ts (d66 name/backstory tables)
│   ├── App.tsx
│   └── main.tsx
├── public/
│   ├── manifest.json
│   └── icon.png
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Data Models

```typescript
// character.ts
interface Character {
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
  talents: Talent[];
  darkSecret: string;
  notes: string;
}

type Condition = 'bruised' | 'hurt' | 'injured' | 'broken';

interface Talent {
  name: string;
  description: string;
  archetype?: Archetype;
}

type Archetype = 
  | 'artful-dodge'
  | 'brickyard-pug'
  | 'bright-spark'
  | 'penny-physick'
  | 'gutter-fixer'
  | 'street-nose'
  | 'card-twister';

// dice.ts
interface DiceRoll {
  regularDice: number; // Attribute + Skill + Modifiers
  strainDice: number;  // Scene Strain Points
  results: {
    regular: number[];
    strain: number[];
  };
  successes: number;
  regularBanes: number;
  strainBanes: number;
  pushed: boolean;
}

// scene.ts
interface SceneState {
  strainPoints: number;
  panicTriggered: boolean;
  lastPanicRoll?: number;
}
```

### Owlbear Integration Points

**Metadata Storage:**
```typescript
// Character data stored per-token
await OBR.scene.items.updateItems(
  (item) => item.id === tokenId,
  (items) => {
    items.forEach(item => {
      item.metadata['streetwise.character'] = characterData;
    });
  }
);

// Scene Strain stored in room metadata
await OBR.room.setMetadata({
  'streetwise.strain': strainPoints
});
```

**Extension Registration:**
```typescript
// manifest.json
{
  "name": "Streetwise Character Sheet",
  "version": "1.0.0",
  "manifest_version": 1,
  "icon": "/icon.png"
}
```

**Action/Modal Pattern:**
```typescript
// Open character sheet when token selected
OBR.contextMenu.create({
  id: "streetwise.open-sheet",
  text: "Open Character Sheet",
  action: async (context) => {
    // Open modal with character sheet
  }
});
```

---

## Implementation Patterns from Shadowdark

### What to Learn From:

1. **Clean Modal UI**: 
   - Shadowdark uses a clean, focused modal for character sheets
   - Dark theme with good contrast
   - Clear section divisions

2. **Stat Block Layout**:
   - Large, readable numbers for primary stats
   - Grouped information (attributes together, skills together)
   - Click-to-roll functionality on stats

3. **Persistent Storage**:
   - Character data attached to tokens
   - Survives session reloads
   - GM can view any character

4. **Rolling Integration**:
   - Rolls appear in OBR chat
   - Shows calculation (e.g., "Strength 3 + Scrap 2 = 5 dice")
   - Highlights successes

### What to Adapt/Change:

1. **Dice Roller Complexity**:
   - Shadowdark is simpler (just d20 rolls)
   - Streetwise needs visual distinction between Regular/Strain dice
   - Need Push roll functionality

2. **Shared State**:
   - Shadowdark doesn't have party-wide resources
   - Streetwise needs Scene Strain tracking visible to all

3. **Condition System**:
   - Shadowdark uses HP
   - Streetwise uses ladder conditions (more narrative)

---

## UI/UX Design Guidelines

### Visual Theme
- **Period Appropriate**: Victorian London aesthetic
- **Colors**: 
  - Background: Aged parchment (#F4E8D0)
  - Text: Dark ink (#2B2520)
  - Accents: Deep crimson (#8B0000), Brass (#B5A642)
- **Typography**: Serif font for headers, sans-serif for body
- **Textures**: Subtle paper texture, ink splatter details

### Component Design Principles

**Character Sheet:**
- Compact but readable
- Most important info (attributes, conditions) at top
- Collapsible sections for talents, notes
- Visual hierarchy: bigger = more important

**Dice Roller:**
- Large, clear dice results
- Color-coded success/failure
- Animation on roll (brief, not distracting)
- Push button prominent when available

**Scene Strain Tracker:**
- Always visible (corner widget or top bar)
- Color changes with danger level
- Click to expand details
- GM-only controls clearly marked

### Accessibility
- High contrast text
- Large click targets (min 44x44px)
- Keyboard navigation support
- Screen reader labels
- Clear focus indicators

---

## Development Phases

### Phase 1: Core Dice Mechanics (MVP)
**Goal**: Get the unique dice rolling working correctly

**Tasks:**
1. Set up Vite + React + TypeScript project
2. Install OBR SDK
3. Create basic dice roller UI
4. Implement dice pool calculation (Attr + Skill + Strain)
5. Visual distinction between Regular/Strain dice
6. Success/Bane counting
7. Push roll functionality
8. Scene Strain integration

**Success Criteria:**
- Can roll dice pools with correct calculation
- Strain dice visually distinct
- Push works correctly and updates Strain
- Results display clearly

### Phase 2: Character Sheet
**Goal**: Store and display character data

**Tasks:**
1. Define Character data model
2. Create character sheet UI components
3. Attribute display (4 stats)
4. Skills list (11 skills, grouped by attribute)
5. Click-to-roll from attributes/skills
6. Conditions tracker
7. Save/load character from token metadata

**Success Criteria:**
- Character sheet displays all stats
- Can click skills to roll
- Conditions tracked accurately
- Data persists across sessions

### Phase 3: Scene Strain Tracker
**Goal**: Shared party resource management

**Tasks:**
1. Create Scene Strain UI widget
2. Store Strain in room metadata
3. Real-time sync across players
4. Auto-increment on Pushed rolls
5. Scene Panic alert system
6. GM controls (manual adjust, reset)

**Success Criteria:**
- Strain visible to all players
- Updates automatically on Push
- Scene Panic triggers correctly
- GM can manage Strain

### Phase 4: Polish & Features
**Goal**: Complete the experience

**Tasks:**
1. Archetypes & Talents data
2. Character creation wizard
3. Reference tables (Scene Panic, maneuvers)
4. Visual theming (Victorian aesthetic)
5. Import/export characters
6. Roll history
7. Sound effects (optional)
8. Animations

**Success Criteria:**
- Full character creation supported
- All game rules accessible
- Polished, thematic UI
- Export/import works

### Phase 5: Testing & Refinement
**Goal**: Ensure reliability and usability

**Tasks:**
1. Playtest with real group
2. Bug fixes
3. Performance optimization
4. Cross-browser testing
5. Documentation (README, user guide)
6. Publish to Owlbear store

---

## Testing Strategy

### Unit Tests
- Dice rolling logic (correct counts, bane detection)
- Scene Strain calculations
- Character data validation
- Push roll mechanics

### Integration Tests
- OBR SDK integration
- Metadata persistence
- Real-time sync (Scene Strain)
- Token selection → sheet opening

### Manual Testing Scenarios

**Scenario 1: Basic Roll**
1. Create character
2. Click skill to roll
3. Verify dice pool = Attribute + Skill + Strain
4. Verify successes/banes counted correctly

**Scenario 2: Pushed Roll**
1. Make a roll
2. Click "Push Roll"
3. Verify non-6/non-1 dice rerolled
4. Verify total Banes from both rolls counted
5. Verify Scene Strain increased correctly

**Scenario 3: Scene Strain Banes**
1. Set Scene Strain to 5
2. Make roll (should include 5 Strain dice)
3. If Strain dice show 1s, verify Scene Panic triggers
4. Verify panic roll = d6 + Strain

**Scenario 4: Conditions**
1. Add Bruised condition
2. Verify all rolls have -1 penalty (1 less die)
3. Add Hurt condition
4. Verify penalty is now -2 (2 fewer dice)

**Scenario 5: Multi-Player Strain**
1. Player 1 pushes roll (Strain increases)
2. Player 2 makes new roll
3. Verify Player 2's roll includes updated Strain dice

---

## Known Edge Cases & Solutions

### Edge Case 1: Negative Dice Pools
**Problem**: Character with Strength 2, Scrap 1, but 4 Conditions = -1 dice?
**Solution**: Minimum pool = 1 die (you can always roll at least 1)

### Edge Case 2: Pushing with Talents
**Problem**: Some talents allow pushing twice
**Solution**: Track push count per roll, check against talent limits

### Edge Case 3: Scene Strain > 10
**Problem**: Very high Strain could mean huge dice pools
**Solution**: Optional house rule: cap Strain at 10? (ask GM in config)

### Edge Case 4: Multiple GMs
**Problem**: Who controls Scene Strain?
**Solution**: Any GM can adjust, show which GM made change in log

### Edge Case 5: Character Import Validation
**Problem**: Imported JSON might be malformed or outdated
**Solution**: Schema validation on import, graceful degradation

---

## Configuration Options

### GM Settings
- **Strain Cap**: Max Scene Strain value (default: unlimited)
- **Auto-Reset Strain**: Reset to 0 at start of new scene (default: manual)
- **Show Strain to Players**: Players see exact number vs. just danger level
- **Scene Panic Auto-Roll**: GM manually rolls vs. automatic
- **Minimum Dice Pool**: Prevent negative pools (default: 1)

### Player Settings
- **Dice Animation**: On/off
- **Sound Effects**: On/off
- **Roll History Size**: Number of past rolls to display (3-10)
- **Compact Mode**: Smaller character sheet for limited screen space

---

## Documentation Requirements

### User Documentation
1. **Quick Start Guide**
   - Installing the extension
   - Creating your first character
   - Making your first roll
   - Understanding Scene Strain

2. **Character Creation Guide**
   - Choosing an Archetype
   - Distributing Attributes
   - Selecting Skills
   - Picking Talents

3. **Gameplay Guide**
   - How to roll checks
   - When to Push rolls
   - Managing Conditions
   - Scene Strain mechanics

4. **GM Guide**
   - Managing Scene Strain
   - Viewing player sheets
   - Running Scene Challenges
   - Handling Scene Panics

### Developer Documentation
1. **Setup Guide**
   - Project structure
   - Build commands
   - Development workflow

2. **Architecture Overview**
   - Data models
   - Component hierarchy
   - OBR integration points

3. **Contributing Guide**
   - Code style
   - Testing requirements
   - Pull request process

---

## Future Enhancements (Post-Launch)

### Nice-to-Have Features
1. **Adventure Generator Integration**
   - Use d66 tables from rulebook
   - Generate NPCs, inciting incidents, twists

2. **Party Dashboard**
   - All characters at a glance
   - Group conditions overview
   - Shared resources (money, supplies?)

3. **Campaign Tracker**
   - Session notes
   - Mystery/case tracking
   - NPC relationships

4. **Dice Statistics**
   - Success rate over time
   - Most rolled skills
   - Strain trend analysis

5. **Custom Talents**
   - Homebrew talent creator
   - Share custom content

6. **Mobile Optimization**
   - Touch-friendly controls
   - Responsive layouts
   - Offline support

7. **Integrations**
   - Discord dice bot
   - Foundry VTT import
   - Character Keeper export

---

## Resources & References

### Official Owlbear Docs
- Getting Started: https://docs.owlbear.rodeo/extensions/getting-started
- SDK Reference: https://docs.owlbear.rodeo/sdk/reference
- Metadata System: https://docs.owlbear.rodeo/extensions/metadata

### Year Zero Engine
- Official SRD: https://freeleaguepublishing.com/wp-content/uploads/2023/11/YZE-Standard-Reference-Document.pdf
- Core mechanics reference
- Dice pool resolution

### Shadowdark Extension Example
- GitHub: https://github.com/maxpaulus43/owlbear-shadowdark-character-sheet
- Study patterns for:
  - Character sheet UI
  - Token metadata storage
  - Context menu integration

### Streetwise Rules
- Core rulebook (provided PDF)
- Focus on:
  - Scene Strain mechanics
  - Push roll rules
  - Archetype/Talent details
  - d66 tables

---

## Prompt for Claude Code CLI

When you're ready to hand this off to Claude Code CLI, use this prompt:

```
I need you to build an Owlbear Rodeo extension for "Streetwise", a Year Zero Engine RPG. 

GAME SYSTEM OVERVIEW:
- Dice pool system: roll d6s = Attribute + Skill + Scene Strain Points
- Success on 6s, complications on 1s (Banes)
- Can "Push" rolls (reroll non-6/non-1), but adds Banes to shared Scene Strain
- Scene Strain is a party-wide resource that adds dice to all rolls but makes things more dangerous
- Characters have 4 Attributes, 11 Skills, Talents, and Conditions (not HP)

CRITICAL MECHANICS TO IMPLEMENT:
1. Dice Roller with visual distinction between Regular dice and Strain dice
2. Push roll functionality that updates Scene Strain
3. Scene Strain tracker (shared across party, stored in room metadata)
4. Character sheet with attributes, skills, conditions
5. Scene Panic system (triggers when Strain dice roll Banes)

I have a complete specification document that details:
- Full game mechanics
- Data models (TypeScript interfaces)
- Component architecture
- UI/UX requirements
- Testing scenarios
- Edge cases and solutions

Please review the attached specification document and then:
1. Set up the project structure (Vite + React + TypeScript + OBR SDK)
2. Start with Phase 1 (Core Dice Mechanics MVP)
3. Implement the dice roller with Regular/Strain dice distinction
4. Create the Scene Strain tracker
5. Build the character sheet
6. Add Polish and Victorian-era theming

Follow the patterns from the Shadowdark extension example where applicable, but adapt for Streetwise's unique mechanics (especially Scene Strain).

Ask questions if anything in the spec is unclear before starting implementation.
```

---

## Sign-Off Checklist

Before considering this extension "complete":

- [ ] All core mechanics work correctly (dice, push, strain)
- [ ] Character sheet displays and persists data
- [ ] Scene Strain syncs across all players
- [ ] Scene Panic triggers appropriately
- [ ] Conditions apply correct penalties
- [ ] Talents affect rolls as described
- [ ] Import/export characters works
- [ ] UI is readable and accessible
- [ ] Documentation complete (user + developer)
- [ ] Tested with real game session
- [ ] No major bugs in issue tracker
- [ ] Optimized for performance
- [ ] Published to Owlbear store

---

**End of Specification Document**

This document should be treated as a living specification that can be updated as development progresses and new requirements are discovered.
