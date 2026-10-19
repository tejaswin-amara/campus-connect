# External Assets & License Register (SimCollege)

All external assets, fonts, palettes, and reference materials utilized or consulted for SimCollege are recorded below in accordance with the Engineering Pipeline Standards and Reference Rules.

> **Policy**: Reference-only unless an explicit permissive license is recorded. Third-party CC0 assets are utilized as clearly marked placeholders only; final production art is original. GPL-licensed and proprietary EA/Maxis assets are strictly prohibited from embedding or derivative inclusion.

---

## 1. Typography

| Asset / Font | Upstream Source URL | Author / Creator | License | Access Date | Status & Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Pixelify Sans** | [github.com/eifetx/Pixelify-Sans](https://github.com/eifetx/Pixelify-Sans) / [fontsource.org/fonts/pixelify-sans/about](https://fontsource.org/fonts/pixelify-sans/about) | Stefie Justprince (`eifetx`) | OFL-1.1 (SIL Open Font License 1.1) | 2026-10-19 | Approved for UI display headers. Self-hosted via `@fontsource/pixelify-sans` and subset to Latin glyphs. |

---

## 2. Palettes & Color Specifications

| Asset / Specification | Source URL | Author / Institution | License / Status | Access Date | Usage Guidelines |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Okabe-Ito Colorblind Palette** | [siegal.bio.nyu.edu/?p=108](https://siegal.bio.nyu.edu/?p=108) | Masataka Okabe & Kei Ito | Public Domain / Scientific Standard | 2026-10-19 | Primary accessible palette: Black (`#000000`), Orange (`#E69F00`), Sky Blue (`#56B4E9`), Bluish Green (`#009E73`), Yellow (`#F0E442`), Blue (`#0072B2`), Vermilion (`#D55E00`), Reddish Purple (`#CC79A7`). Yellow and Sky Blue mandate >= 3:1 dark borders on light terrain. |

---

## 3. Graphic & Tile Placeholders (CC0 / Public Domain)

| Asset Name | Source URL | Author | License | Access Date | Permitted Scope |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sketch Town Tiles** | [kenney-assets.itch.io/sketch-town](https://kenney-assets.itch.io/sketch-town) | Kenney (`Kenney.nl`) | CC0 1.0 Universal | 2026-10-19 | Placeholder dimetric buildings and terrain tiles for initial wireframe rendering and tests. |
| **Isometric Buildings 1** | [opengameart.org/content/isometric-buildings-1](https://opengameart.org/content/isometric-buildings-1) | Kenney | CC0 1.0 Universal | 2026-10-19 | Geometric proportion and style study. |
| **Isometric City** | [opengameart.org/content/isometric-city](https://opengameart.org/content/isometric-city) | Kenney | CC0 1.0 Universal | 2026-10-19 | Tile sizing and depth layer study. |

---

## 4. Audio & Sound FX Placeholders

| Asset Category | Source URL | License | Access Date | Scope |
| :--- | :--- | :--- | :--- | :--- |
| **UI Audio Clicks & Alerts** | [opengameart.org](https://opengameart.org) | CC0 1.0 Universal | 2026-10-19 | Optional auditory cues for map pin selection and zoom actions (must honor `prefers-reduced-motion` and user mute preferences). |

---

## 5. Prohibited & Restricted Repositories (Study Only)

| Project / Entity | Source URL | License | Restriction Policy |
| :--- | :--- | :--- | :--- |
| **Micropolis & MicropolisCore** | [github.com/SimHacker/micropolis](https://github.com/SimHacker/micropolis) | GPL-3.0-or-later | **STUDY ONLY**: No code, sprites, or algorithms copied into this codebase. |
| **Trademarks: SimCity / Micropolis** | EA / Electronic Arts & Don Hopkins | Proprietary / Registered Trademarks | **PROHIBITED**: Do not use "SimCity" or "Micropolis" in any UI strings, filenames, package identifiers, or domain names. |
| **Kenney Isometric Assets** | [kenney.itch.io/kenney-isometric-assets](https://kenney.itch.io/kenney-isometric-assets) | CC0 1.0 Universal | **REFERENCE ONLY**: 35.264° true isometric assets do NOT align with our 2:1 dimetric grid (128x64px). |
