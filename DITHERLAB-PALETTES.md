# DitherLab — Presets de Palettes + Color Picker Custom

> Ajouter des palettes thematiques predefinies et un color picker pour construire sa propre palette. C'est la feature qui transforme DitherY2K d'un simple outil de dithering en un vrai outil artistique.

---

## Contexte

Actuellement le seul mode de palette est "Auto (Median Cut)" qui genere une palette adaptee a l'image. Ca marche pour du dithering generique, mais pour obtenir un rendu artistique precis (style PC-98, Game Boy, horreur, etc.) il faut pouvoir choisir une palette specifique.

---

## Feature 1 : Presets de palettes

### Remplacer le dropdown "Palette" actuel

Le dropdown actuel a juste "Auto (Median Cut)". Le remplacer par un dropdown plus riche :

```
>> Palette:
[Auto (Median Cut)          v]
  ─────────────────────────
  Auto (Median Cut)
  ─── RETRO SYSTEMS ───
  Game Boy (4 colors)
  CGA Mode 1 (4 colors)
  CGA Mode 2 (4 colors)
  EGA (16 colors)
  Commodore 64 (16 colors)
  NES (55 colors)
  PICO-8 (16 colors)
  ─── MONOCHROME ───
  Black & White (2 colors)
  Amber Terminal (4 colors)
  Green Phosphor (4 colors)
  Blue Terminal (4 colors)
  ─── ARTISTIC ───
  Crimson Desert (8 colors)
  Vapourwave (8 colors)
  Cyber Night (8 colors)
  Sepia Vintage (6 colors)
  ─── CUSTOM ───
  Custom Palette...
```

### Definition des palettes

```javascript
const PALETTE_PRESETS = {

  // ─── RETRO SYSTEMS ───

  "gameboy": {
    name: "Game Boy",
    colors: ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"]
  },

  "cga1": {
    name: "CGA Mode 1",
    colors: ["#000000", "#55FFFF", "#FF55FF", "#FFFFFF"]
  },

  "cga2": {
    name: "CGA Mode 2",
    colors: ["#000000", "#55FF55", "#FF5555", "#FFFF55"]
  },

  "ega": {
    name: "EGA",
    colors: [
      "#000000", "#0000AA", "#00AA00", "#00AAAA",
      "#AA0000", "#AA00AA", "#AA5500", "#AAAAAA",
      "#555555", "#5555FF", "#55FF55", "#55FFFF",
      "#FF5555", "#FF55FF", "#FFFF55", "#FFFFFF"
    ]
  },

  "c64": {
    name: "Commodore 64",
    colors: [
      "#000000", "#FFFFFF", "#880000", "#AAFFEE",
      "#CC44CC", "#00CC55", "#0000AA", "#EEEE77",
      "#DD8855", "#664400", "#FF7777", "#333333",
      "#777777", "#AAFF66", "#0088FF", "#BBBBBB"
    ]
  },

  "nes": {
    name: "NES",
    colors: [
      "#000000", "#FCFCFC", "#F8F8F8", "#BCBCBC",
      "#7C7C7C", "#A4E4FC", "#3CBCFC", "#0078F8",
      "#0000FC", "#B8B8F8", "#6888FC", "#0058F8",
      "#0000BC", "#D8B8F8", "#9878F8", "#6844FC",
      "#4428BC", "#F8B8F8", "#F878F8", "#D800CC",
      "#940084", "#F8A4C0", "#F85898", "#E40058",
      "#A80020", "#F0D0B0", "#F87858", "#F83800",
      "#A81000", "#FCE0A8", "#FCA044", "#E45C10",
      "#881400", "#F8D878", "#F8B800", "#AC7C00",
      "#503000", "#D8F878", "#B8F818", "#00B800",
      "#007800", "#B8F8B8", "#58D854", "#00A800",
      "#006800", "#B8F8D8", "#58F898", "#00A844",
      "#005800", "#00FCFC", "#00E8D8", "#008888",
      "#004058", "#F8D8F8", "#787878"
    ]
  },

  "pico8": {
    name: "PICO-8",
    colors: [
      "#000000", "#1D2B53", "#7E2553", "#008751",
      "#AB5236", "#5F574F", "#C2C3C7", "#FFF1E8",
      "#FF004D", "#FFA300", "#FFEC27", "#00E436",
      "#29ADFF", "#83769C", "#FF77A8", "#FFCCAA"
    ]
  },

  // ─── MONOCHROME ───

  "bw": {
    name: "Black & White",
    colors: ["#000000", "#FFFFFF"]
  },

  "amber": {
    name: "Amber Terminal",
    colors: ["#000000", "#3D1F00", "#7A3F00", "#FF8800"]
  },

  "green": {
    name: "Green Phosphor",
    colors: ["#000000", "#003300", "#00AA00", "#00FF00"]
  },

  "blue": {
    name: "Blue Terminal",
    colors: ["#000000", "#000044", "#0044AA", "#44AAFF"]
  },

  // ─── ARTISTIC ───

  "crimson": {
    name: "Crimson Desert",
    colors: [
      "#0a0008", "#1a0015", "#3d0a2a", "#6b1040",
      "#a02050", "#cc3366", "#e06088", "#f0a0b0"
    ]
  },

  "vaporwave": {
    name: "Vapourwave",
    colors: [
      "#0D0221", "#150050", "#3500D3", "#8338ec",
      "#FF2975", "#FF6B6B", "#F8B500", "#00F5D4"
    ]
  },

  "cybernight": {
    name: "Cyber Night",
    colors: [
      "#0a0a0a", "#0d1117", "#1a1a2e", "#16213e",
      "#0f3460", "#e94560", "#533483", "#00fff5"
    ]
  },

  "sepia": {
    name: "Sepia Vintage",
    colors: [
      "#1a1008", "#3d2b1f", "#6b4c30", "#a67c52",
      "#d4a76a", "#f0deb4"
    ]
  }
};
```

### Integration avec le pipeline de dithering

Quand l'utilisateur selectionne un preset :
- **Auto (Median Cut)** : comportement actuel, generer la palette depuis l'image avec le nombre de couleurs du slider
- **Preset fixe** : utiliser les couleurs du preset tel quel, le slider "Colors" est desactive/grise (le nombre de couleurs est fixe par le preset)
- **Custom** : ouvrir le color picker (voir Feature 2)

```javascript
function getPalette(imageData, presetKey, numColors) {
  if (presetKey === 'auto') {
    // Median Cut avec numColors
    return medianCut(imageData, numColors);
  } else if (presetKey === 'custom') {
    // Retourner la palette custom de l'utilisateur
    return customPalette;
  } else {
    // Retourner les couleurs du preset
    return PALETTE_PRESETS[presetKey].colors.map(hexToRgb);
  }
}
```

### Affichage de la palette active

Sous le dropdown de palette, afficher un apercu visuel des couleurs actives :

```
>> Palette: [Crimson Desert     v]

  [██][██][██][██][██][██][██][██]   8 colors
```

Chaque carre de couleur fait ~16x16px ou ~20x20px, affiche en ligne. Ca permet de voir immediatement les couleurs de la palette selectionnee.

```css
.palette-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-top: 6px;
}

.palette-swatch {
  width: 18px;
  height: 18px;
  border: 1px solid #808080;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #000;
  border-right-color: #000;
}
```

---

## Feature 2 : Color Picker Custom

Quand l'utilisateur selectionne "Custom Palette..." dans le dropdown, afficher un editeur de palette inline.

### Interface du color picker

```
>> Palette: [Custom Palette...  v]

  Palette custom (6 couleurs) :
  [██][██][██][██][██][██] [+]

  Cliquer une couleur pour la modifier
  [+] pour ajouter, clic droit pour supprimer
```

### Fonctionnement

- Afficher les swatches de la palette custom actuelle
- **Cliquer sur un swatch** : ouvre un `<input type="color">` natif pour modifier cette couleur
- **Bouton [+]** : ajoute une couleur noire a la fin (max 64 couleurs)
- **Clic droit sur un swatch** (ou bouton [-] au hover) : supprime cette couleur (min 2 couleurs)
- La palette custom est stockee en state React, pas en localStorage
- Le dithering se recalcule a chaque modification de la palette

### Implementation

```javascript
// State
const [customColors, setCustomColors] = useState([
  '#000000', '#FFFFFF', '#FF0000', '#0000FF'
]);

// Ajouter une couleur
const addColor = () => {
  if (customColors.length < 64) {
    setCustomColors([...customColors, '#000000']);
  }
};

// Supprimer une couleur
const removeColor = (index) => {
  if (customColors.length > 2) {
    setCustomColors(customColors.filter((_, i) => i !== index));
  }
};

// Modifier une couleur
const updateColor = (index, newColor) => {
  const updated = [...customColors];
  updated[index] = newColor;
  setCustomColors(updated);
};
```

### Composant swatch

```jsx
{customColors.map((color, i) => (
  <div
    key={i}
    className="palette-swatch"
    style={{ backgroundColor: color }}
    onClick={() => colorInputRefs[i].current.click()}
    onContextMenu={(e) => {
      e.preventDefault();
      removeColor(i);
    }}
  >
    <input
      ref={colorInputRefs[i]}
      type="color"
      value={color}
      onChange={(e) => updateColor(i, e.target.value)}
      style={{ 
        position: 'absolute', 
        opacity: 0, 
        pointerEvents: 'none' 
      }}
    />
  </div>
))}
<button className="btn-retro" onClick={addColor}>+</button>
```

### Style des swatches editables

```css
.palette-swatch-editable {
  width: 24px;
  height: 24px;
  cursor: pointer;
  border: 2px solid #808080;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #000;
  border-right-color: #000;
  position: relative;
}

.palette-swatch-editable:hover {
  border-top-color: #000;
  border-left-color: #000;
  border-bottom-color: #fff;
  border-right-color: #fff;
  /* Effet enfonce au hover */
}

.palette-add-btn {
  width: 24px;
  height: 24px;
  font-family: 'VT323', monospace;
  font-size: 1.2rem;
  background: #C0C0C0;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-bottom: 2px solid #000;
  border-right: 2px solid #000;
  cursor: pointer;
  color: #000;
}
```

---

## Feature 3 (bonus) : Presets combines

Ajouter des "quick presets" qui configurent tout d'un coup (algo + palette + resolution) :

```
>> Quick Presets:
[Aucun                        v]
  ─────────────────────────
  Aucun
  PC-98 Visual Novel
  Game Boy Camera
  Mac Classic
  Commodore Loading Screen
  Sand Rite Horror
```

Chaque preset applique :

```javascript
const QUICK_PRESETS = {
  "pc98vn": {
    name: "PC-98 Visual Novel",
    algorithm: "bayer",
    palette: "ega",
    resolution: "640x400",
    colors: 16,
    upscale: false
  },
  "gameboycam": {
    name: "Game Boy Camera",
    algorithm: "bayer",
    palette: "gameboy",
    resolution: "160x144",
    colors: 4,
    upscale: true,
    upscaleFactor: 3
  },
  "macclassic": {
    name: "Mac Classic",
    algorithm: "atkinson",
    palette: "bw",
    resolution: "512x342",
    colors: 2,
    upscale: true,
    upscaleFactor: 2
  },
  "c64": {
    name: "Commodore Loading Screen",
    algorithm: "floyd-steinberg",
    palette: "c64",
    resolution: "320x200",
    colors: 16,
    upscale: true,
    upscaleFactor: 2
  },
  "sandrite": {
    name: "Sand Rite Horror",
    algorithm: "bayer",
    palette: "crimson",
    resolution: "320x200",
    colors: 8,
    upscale: true,
    upscaleFactor: 2
  }
};
```

Quand un quick preset est selectionne, tous les controles se mettent a jour d'un coup. L'utilisateur peut ensuite modifier individuellement chaque parametre. Si un parametre est change manuellement, le quick preset repasse a "Aucun".

---

## Placement dans l'UI

### Desktop

Dans le panel "Algorithm" (colonne de droite des controles) :

```
┌─── Algorithm ─────────────────┐
│ >> Quick Preset:              │
│ [Aucun                     v] │
│                               │
│ >> Algorithm:                 │
│ [Bayer (Ordered)           v] │
│                               │
│ >> Palette:                   │
│ [Crimson Desert            v] │
│ [██][██][██][██][██][██][██]  │
│                               │
│ >> Colors: 8                  │
│ ━━━━━━━●━━━━━ (grise si preset)│
└───────────────────────────────┘
```

### Mobile

Meme ordre, en pleine largeur, dans le panel de controles.

---

## Ce qu'il ne faut PAS faire

- Ne pas toucher aux algorithmes de dithering (Floyd-Steinberg, Bayer, Atkinson, Threshold)
- Ne pas toucher a Median Cut (il reste l'option "Auto")
- Ne pas toucher au header / sidebar / footer
- Ne pas stocker la palette custom en localStorage (state React seulement)
- Ne pas ajouter de librairie externe pour le color picker (utiliser `<input type="color">` natif)
