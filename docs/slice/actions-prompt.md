## Ataque con la hoja

```text
Use case: stylized-concept
Asset type: companion ACTION sprite sheet for the existing SPROUT character reference.
Input image 1 is a CHARACTER IDENTITY and PALETTE reference only. Create a NEW sprite sheet. Preserve this exact plant child's appearance, proportions, cream face, two green leaves, terracotta overalls, dark green outlines, brown boots.
Square sheet, EXACT 4 columns by 4 rows, no text, labels, guides, shadows or borders. True transparent background. Exactly equal cells with generous space. Crisp chunky Game Boy Color pixel art, designed at 32x32 then enlarged, no fine texture, no antialiasing. Keep the feet anchored at the same height across all frames.
Animate swinging a small curved bright green leaf sword held in a hand. Weapon is made of a single leaf, light green sharp edge. The blade remains within each cell. Tiny pale yellow slash accent only in frame 3, not all frames.
Rows show facing directions: row 1 DOWN (front facing viewer); row 2 LEFT; row 3 RIGHT; row 4 UP (back facing viewer).
The four columns of EVERY row are four distinct consecutive sword action frames: 1 anticipation with leaf pulled back; 2 beginning swing; 3 full strike with extended arm and leaf, short crescent slash; 4 recovery with leaf lowered.
Keep character size and identity consistent across all 16 cells and matching the reference. This is a functional sprite sheet for a game engine, not a concept poster.
```

## Corrección de transparencia

La primera salida del ataque tenía un damero gris opaco. Se solicitó una edición de extracción del fondo con `image_gen`, preservando personaje, poses, hoja y encuadre. La segunda salida también resultó opaca y se descartó. Se conserva la primera como `sprout-action-source.png`; el cargador elimina el damero por clave de color neutro, y `ready/sprout-attack.png` exporta las celdas con alfa real.

Prompt de la corrección intentada:

```text
Use case: background-extraction. EDIT the supplied SPROUT sprite sheet. Remove ONLY the grey checkerboard background and make all empty space truly transparent with PNG alpha=0. Keep every character and leaf sword pixel, palette, pose, framing and placement exactly unchanged. Keep all 16 sprites in exactly the same 4x4 grid. The current grey checkerboard is painted into the image and MUST be removed; do not draw another checkerboard. Output actual alpha transparency, not black, white or checkerboard. Preserve the pale yellow slash accents as foreground. Do not move, rescale or redraw the sprites.
```
