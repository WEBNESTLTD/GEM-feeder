# Gem Feeder — Asset Inventory

## 1. Character Sprites

Directory: `assets/characters/`
Format: PNG (32-bit RGBA with transparency)
Dimensions: 740 × 860 px
Art Style: Portrait illustration of a woman wearing a black hijab and teal clothing with expressive mouth states.

| File | Frame Index | State | Intended Role |
|------|-------------|-------|---------------|
| `mouth_0.png` | 0 | Mouth closed / gentle smile | Idle state |
| `mouth_1.png` | 1 | Mouth barely open | Anticipation / slight reaction |
| `mouth_2.png` | 2 | Mouth quarter open | Opening phase |
| `mouth_3.png` | 3 | Mouth third open | Opening phase |
| `mouth_4.png` | 4 | Mouth half open | Catch ready |
| `mouth_5.png` | 5 | Mouth wide open (small) | Catch ready |
| `mouth_6.png` | 6 | Mouth wide open (medium) | Catch ready |
| `mouth_7.png` | 7 | Mouth wide open (large) | Maximum anticipation |
| `mouth_8.png` | 8 | Mouth fully open | Maximum mouth opening for candy entry |

---

## 2. Candy Vector Assets

Directory: `assets/candies/`
Format: SVG (Vector with drop shadow / gloss highlight)
Dimensions: ViewBox `0 0 100 100` (rendered at 200x200 for 2x high-DPI rasterization)

| File | Candy Type | Hex Fill | Hex Stroke |
|------|------------|----------|------------|
| `candy_red.svg` | Red | `#F0364B` | `#A5142A` |
| `candy_yellow.svg` | Yellow | `#FFD93D` | `#B8900A` |
| `candy_green.svg` | Green | `#38C964` | `#17803A` |
| `candy_blue.svg` | Blue | `#3D8BFF` | `#1B4FB0` |
| `candy_purple.svg` | Purple | `#9B5DE5` | `#5B2BA0` |
| `candy_orange.svg` | Orange | `#FF8A2B` | `#B84E00` |
| `candy_pink.svg` | Pink | `#FF5CAA` | `#B8266E` |
| `candy_rainbow.svg` | Rainbow | Linear Gradient Multi-Color | Multi-Color |

---

## 3. UI Vector Assets

Directory: `assets/ui/`
Format: SVG

| File | Visual Element | Purpose |
|------|----------------|---------|
| `packet.svg` | Candy packet pouch with branding | Bottom candy dispenser anchor |
| `heart_full.svg` | Solid crimson heart (`#E8325F`) | Active player life indicator |
| `heart_empty.svg` | Lavender muted heart outline (`#E6D9F3`) | Depleted player life indicator |
| `play.svg` | White triangular play symbol | Play button icon |
| `pause.svg` | Dual purple pill bars | Gameplay pause button |
| `sound_on.svg` | Speaker cone with sound wave arcs | Sound enabled toggle |
| `sound_off.svg` | Speaker cone muted | Sound muted toggle |

---

## 4. Typography & Design Tokens

Directory: `design/`
Tokens: `design/design-tokens.json`

- **Font Family**: 'Fredoka', system-ui, sans-serif
- **Logical Canvas**: 390 × 844
- **Color Palette**:
  - Ink (`#4B1F86`), Ink Soft (`#6B5A86`)
  - Pink (`#D81B7A`), Pink Dark (`#9C0F56`)
  - Yellow (`#FFD93D`), Yellow Dark (`#D9AE00`)
  - Background Gradient: `#F3E6FF` (0%) -> `#FFE9F3` (55%) -> `#FFF3D6` (100%)
  - Packet Purple: `#6B2FB3`, Packet Dark: `#3E1675`
  - Heart Crimson: `#E8325F`
