# Prompts de los assets

Generados con la herramienta integrada `image_gen`. Se conservan los PNG originales sin reducir en `assets/slice/`. Aunque se solicitaron 1024 × 1024, la salida real de ambos atlas es 1254 × 1254; el cargador usa sus dimensiones reales. Las imágenes generadas no son una cuadrícula pixel-perfect garantizada: el cargador recorta, alinea los pies y rasteriza a la resolución de juego con nearest-neighbor. El máster permanece intacto.

## Personaje

```text
Use case: stylized-concept
Asset type: production pixel-art character sprite sheet for SPROUT, a top-down Game Boy Color inspired adventure.
Create a square 1024x1024 PNG sprite sheet, EXACTLY 4 columns x 4 rows, each cell 256x256, no gutters. TRUE transparent background (alpha), no grid, text, labels, scenery, shadows or guides.
Character: an original tiny cheerful plant child, two bright green leaves growing from the head, light warm cream face, large dark eyes, terracotta overalls, tiny brown boots. Readable silhouette, dark forest-green single pixel outline. Chibi 1990s handheld game pixel art.
CRITICAL grid design: draw every frame as if designed on a 32x32 native pixel grid and enlarge exactly 8x with nearest-neighbor to 256x256. Every visible pixel is a crisp aligned 8x8 block. No subpixel detail, antialiasing, gradients or painted texture. About 12 colors: darkest #203b32, mid green #4f8346, lime #a7c957, cream #f4dfa2, ochre #c5a05a, terracotta #b86946, shadow brown #754b36.
Within EACH 32x32 native cell the character fits x=6..25, y=3..29. Feet baseline y=29. Consistent head scale, body, and leaf shapes across frames.
Row 1: four WALK CYCLE frames facing DOWN toward viewer: neutral, left foot forward/right arm forward, neutral, right foot forward/left arm forward.
Row 2: four WALK CYCLE frames facing LEFT (nose to image left), same timing.
Row 3: four WALK CYCLE frames facing RIGHT (nose to image right), same timing.
Row 4: four WALK CYCLE frames facing UP, back of head visible, NO face, same timing.
Frames are centered in exact cell, no overlap. Actual sprite sheet for cropping and animation, not a mockup.
```

## Bosque

```text
Use case: stylized-concept
Asset type: production environment and object pixel-art atlas for SPROUT, a top-down Game Boy Color inspired woodland adventure.
Square 1024x1024 PNG. EXACT 4 columns x 4 rows, each cell 256x256. No gutters, no labels, no text, no grid.
Each cell is pixel art designed at EXACTLY 32x32 native pixels, then enlarged 8x nearest neighbor. All pixels are aligned 8x8 square blocks. Readable authentic 1990s handheld pixel art with chunky color clusters, strong silhouettes, restrained 14-color palette, no gradients or antialiasing. Dark outline #203b32, pine #385b3e, green #4f8346, grass #87a952, lime #a7c957, pale yellow #f4dfa2, tan #c5a05a, earth #947445, brown #754b36, terracotta #b86946, water #518a85, water highlight #86b3a0, cream #fff0c2.
ROW 1 — each of these four TERRAIN cells fills its entire 256x256 cell with NO margin: (1) seamless mossy olive green grass tile, mostly flat ground with very sparse grass flecks, NO flowers; (2) seamless golden sand footpath tile, sparse tiny pebbles; (3) seamless calm muted jade water tile with small horizontal ripple clusters; (4) seamless warm grey ancient paving stones, large stone blocks.
ROW 2 — objects with TRUE transparent backgrounds and 2 native pixels of margin in each cell: (1) round leafy oak tree with a short visible trunk, top-down Zelda perspective; (2) dense round small leafy bush; (3) low cluster of grey mossy rocks; (4) wooden plank footbridge, top-down view, running vertically, fills the width of its cell, edges transparent.
ROW 3 — centered sprites on TRUE transparent backgrounds with 2 native pixels margin: (1) friendly old mushroom villager, cream mushroom cap with terracotta patches and walking stick, face looks toward viewer; (2) small round lime green woodland slime creature, eyes, resting, squat; (3) the EXACT SAME lime green slime, slightly raised in a hopping pose, same size and identity; (4) mossy ancient stone plinth with an EMPTY inset bowl to receive one seed, no seed yet.
ROW 4 — centered objects on TRUE transparent backgrounds with 3 native pixels margin: (1) small closed wooden treasure chest with brass lock, front view top down; (2) the EXACT SAME chest opened, dark interior; (3) ONE glowing golden acorn seed with a little leaf on top, about 12x16 native pixels at center; (4) a low cluster of three cream daisies and yellow centers with green stems.
Everything has consistent light from upper left, crisp outlines and no drop shadows. Output reusable game atlas, not an illustration of a sheet.
```

