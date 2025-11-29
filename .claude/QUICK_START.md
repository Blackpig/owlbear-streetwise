# 🎯 Streetwise Extension - Quick Start for Claude Code CLI

## What You're Building

An Owlbear Rodeo extension for **Streetwise** (Victorian street urchin RPG) with:
- ✅ **Validated dice mechanics** (POC complete & tested)
- 🔨 **Character sheet** (build this)
- 🔨 **Multi-player Scene Strain tracking** (build this)
- 🔨 **OBR integration** (build this)

---

## Essential Files You Have

📦 **streetwise-dice-roller-poc.tar.gz**
- Working dice roller (COMPLETE - don't modify)
- Extract and copy core files:
  - `src/types/dice.ts` → game types
  - `src/utils/diceRoller.ts` → dice logic
  - `src/components/DiceDisplay.tsx` → dice UI
  - `src/components/DiceDisplay.css` → styling

📄 **streetwise-extension-spec.md**
- Complete game mechanics reference
- Data models
- UI/UX guidelines
- Testing scenarios

📄 **CLAUDE_CODE_BUILD_INSTRUCTIONS.md**
- Step-by-step build guide
- Owlbear integration code snippets
- Testing workflow
- Deployment instructions

---

## Start Command for Claude Code CLI

```bash
claude-code
```

Then paste this prompt:

```
I need to build an Owlbear Rodeo extension for the Streetwise RPG. 

I have three files:
1. CLAUDE_CODE_BUILD_INSTRUCTIONS.md (complete build guide with code)
2. streetwise-extension-spec.md (game mechanics reference)
3. streetwise-dice-roller-poc.tar.gz (validated dice mechanics - DO NOT MODIFY)

Please:
1. Read CLAUDE_CODE_BUILD_INSTRUCTIONS.md completely
2. Follow it step-by-step to build the extension
3. Extract and use the POC files as-is (they're tested and working)
4. Focus on Owlbear integration and character sheet
5. Test using the two-window workflow described

Start with Phase 1: Project Setup. Ask if anything is unclear before proceeding.
```

---

## Critical Points

### ✅ DO:
- Follow the build instructions step-by-step
- Use the validated POC dice logic as-is
- Test with two windows (dev server + Owlbear)
- Use OBR metadata for persistence
- Sync Scene Strain via room metadata

### ❌ DON'T:
- Modify the dice rolling logic from POC
- Use localStorage (use OBR metadata instead)
- Skip the OBR.onReady() check
- Forget to await async operations

---

## Testing Workflow

```bash
# Terminal 1: Dev server
npm run dev -- --host

# Terminal 2: (not needed with --host)

# Browser 1: Owlbear
- Add extension: http://localhost:3000/manifest.json
- Select token → open extension

# Browser 2: Owlbear (same room)
- Verify Scene Strain syncs
```

---

## Build Phases

1. **Setup** (10 min) - Vite project + OBR SDK
2. **OBR Integration** (20 min) - Context provider, metadata
3. **Character Data** (15 min) - Types, hooks, persistence
4. **Character Sheet** (30 min) - UI components
5. **Dice Integration** (20 min) - Connect POC to OBR
6. **Polish** (20 min) - Styling, error states
7. **Deploy** (15 min) - Build, test, publish

**Total: ~2 hours**

---

## Key OBR Patterns

```typescript
// Initialize
await OBR.onReady();

// Save character to token
await OBR.scene.items.updateItems([tokenId], (items) => {
  items[0].metadata['streetwise.character'] = character;
});

// Save Scene Strain (shared)
await OBR.room.setMetadata({
  'streetwise.strain': strainPoints
});

// Listen for changes
OBR.room.onMetadataChange((metadata) => {
  const strain = metadata['streetwise.strain'];
  // Update UI
});
```

---

## Success Criteria

Extension is done when:
- ✅ Loads in Owlbear popover
- ✅ Shows character sheet for selected token
- ✅ Clicking skill rolls dice
- ✅ Scene Strain syncs across players
- ✅ Push rolls work and update Strain
- ✅ Data persists on reload
- ✅ Works in production build

---

## Files to Download

1. [CLAUDE_CODE_BUILD_INSTRUCTIONS.md](computer:///mnt/user-data/outputs/CLAUDE_CODE_BUILD_INSTRUCTIONS.md) - **START HERE**
2. [streetwise-extension-spec.md](computer:///mnt/user-data/outputs/streetwise-extension-spec.md) - Reference
3. [streetwise-dice-roller-poc.tar.gz](computer:///mnt/user-data/outputs/streetwise-dice-roller-poc.tar.gz) - Validated code

---

## Quick Reference

**Owlbear Docs:** https://docs.owlbear.rodeo  
**OBR SDK:** https://docs.owlbear.rodeo/sdk/reference  
**Example Extension:** https://github.com/maxpaulus43/owlbear-shadowdark-character-sheet

---

🚀 **Ready to build!** The hard part (dice mechanics) is done. Now just wrap it in Owlbear integration following the step-by-step guide.
