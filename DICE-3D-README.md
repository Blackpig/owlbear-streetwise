# CSS 3D Dice Implementation

## What I Built

A **pure CSS 3D dice roller** with Victorian steampunk aesthetic. Zero dependencies, no physics engines, just CSS transforms and animations.

## Features

✅ **True 3D cubes** with 6 faces using CSS transforms
✅ **Two color schemes**: Brass/gold (regular) and Crimson (strain)
✅ **Tumbling animations** with randomized rotations
✅ **Locked dice** for push rolls (pulsing visual effect)
✅ **Victorian styling** with metallic gradients and depth
✅ **Clear pip visibility** with contrasting colors
✅ **Dice tray** with shake animation

## Files Created

1. **`/src/components/Dice3D/DiceCube.css`**
   - All styling and animations
   - Brass and crimson color schemes
   - 3D cube face positioning
   - Tumbling keyframes
   - Pip layouts (1-6)

2. **`/src/components/Dice3D/DiceCube.tsx`**
   - Single die component
   - Renders 6 faces with pips
   - Handles rotation to show result
   - Props: `value` (1-6), `color` ('brass'|'crimson'), `isRolling`, `isLocked`

3. **`/src/components/Dice3D/DiceRoller3D.tsx`**
   - Container for multiple dice
   - Renders arrays of regular and strain dice
   - Manages rolling state
   - Props: `regularDice`, `strainDice`, `isRolling`, `lockedDice`

## How It Works

### The Die Structure
Each die is a CSS 3D cube with 6 faces positioned using `transform: rotateY/X() translateZ()`:
- Face 1: Front (rotateY 0°)
- Face 2: Right (rotateY 90°)
- Face 3: Back (rotateY 180°)
- Face 4: Left (rotateY -90°)
- Face 5: Top (rotateX -90°)
- Face 6: Bottom (rotateX 90°)

### Rolling Animation
1. When `isRolling` is true, apply randomized tumbling animation
2. When `isRolling` is false, rotate cube to show specific face
3. Slight variance added to final rotation for natural look

### Color Schemes
**Brass (Regular Dice):**
- Gradient: #D4AF37 → #B8941E (gold tones)
- Pips: Dark (#2B2520)
- Shadows: Warm highlights and deep shadows

**Crimson (Strain Dice):**
- Gradient: #8B0000 → #660000 (deep red)
- Pips: Gold (#FFD700)
- Shadows: Red glow effects

## Using the Dice

The component is already integrated into `DiceRollerOBR.tsx`:

```tsx
<DiceRoller3D
  regularDice={currentRoll.results.regular}  // [1,4,6]
  strainDice={currentRoll.results.strain}    // [2,5]
  isRolling={isRolling}
  lockedDice={currentRoll.lockedDice}        // For push rolls
/>
```

## Customization

### Change Colors
Edit gradients in `DiceCube.css`:
```css
.dice-face.brass {
  background: linear-gradient(135deg, ...);
}
```

### Adjust Animation Speed
Change duration in `DiceCube.css`:
```css
.dice-cube.rolling {
  animation: tumble-dice 0.8s ...;  /* Change 0.8s */
}
```

### Modify Dice Size
Update in `DiceCube.css`:
```css
.dice-scene {
  width: 80px;   /* Change size */
  height: 80px;
}
```

## What's Next

Current implementation supports:
- ✅ Initial rolls
- ✅ Push rolls with locked dice
- ✅ Multiple dice colors
- ✅ Visual feedback

Future enhancements could add:
- Sound effects on roll
- More color themes
- Custom pip shapes
- Particle effects
- Shadows beneath dice

## Performance

**Zero external dependencies** = tiny footprint
**Pure CSS** = hardware accelerated
**No physics calculations** = instant response

This approach trades "realistic physics" for **reliable, sexy-looking dice** that work every time.
