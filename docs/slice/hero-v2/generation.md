# Sprout v2 · kit de personaje

Generado con la herramienta integrada `image_gen`. La imagen aporta las piezas del personaje; el ensamblador usa las mismas piezas para todas las animaciones, con tamaño, paleta y ancla estables. Se conservan máster y PNG listos para el motor.

```text
Use case: stylized-concept
Asset type: MODULAR production pixel-art character parts atlas, for a coherent Game Boy Color inspired plant hero named Sprout.
Create one square PNG with TRUE TRANSPARENT alpha background. Exactly 4 columns x 4 rows, equal square cells, no grid, labels, checkerboard, text, scenery, shadows or guides.
This is a CUTOUT ANIMATION KIT, not complete character poses. Each cell contains just ONE isolated reusable body part centered in empty transparent space. Pieces have crisp, flat, chunky pixel-art clusters, dark one-pixel forest outline. No gradients, texture, blur or antialiasing. Palette strictly limited to dark forest #183c35, forest #376743, green #75a847, lime #c1db75, cream skin #ffe5ac, ochre skin shadow #d9a35f, terracotta #b76d45, terracotta highlight #e39a5e, deep brown #704936, warm light #fff3cf. Readable silhouette, expressive eyes, simple clean shapes. Imagine native pixels about 10px square in this large source.

ROW 1: FOUR HEADS ONLY, no neck, body, arms or legs. A cute plant child with exactly TWO green leaves on the crown, a round cream face, two simple dark vertical eyes, no nose, small smile. Head plus leaves, same size and proportions in all four directions:
cell 1 FRONT facing down toward camera, two eyes;
cell 2 LEFT profile, one visible eye pointing to image left;
cell 3 RIGHT profile, one visible eye pointing to image right;
cell 4 BACK of head, round cream back of head, two green leaves, NO eyes or face.
All four heads same height, coherent plant identity. Head silhouette roughly 24 native px wide x 24 high. Full heads stay inside their cells with ample margins.

ROW 2: FOUR TORSOS ONLY, no heads, arms or legs. Small dark green shirt under simple terracotta gardening overalls with two shoulder straps and one small cream rectangular chest pocket. Same scale in all four directions:
cell 1 FRONT torso, visible two straps and chest pocket;
cell 2 LEFT profile torso;
cell 3 RIGHT profile torso;
cell 4 BACK torso, crossed straps on back and NO pocket.
Torso silhouette roughly 12 native pixels wide x 11 high. Center each small isolated torso in its cell, do not enlarge torso to head size.

ROW 3: FOUR ARM/HAND PIECES ONLY, no bodies:
cell 1 a LEFT short hanging arm, dark green sleeve, small cream hand, roughly 5 native pixels wide x 10 high;
cell 2 the matching RIGHT short hanging arm, dark green sleeve and cream hand;
cell 3 one small cream closed fist with dark outline, roughly 5x5 native pixels;
cell 4 one small cream open hand with dark outline, roughly 5x6 native pixels.
All isolated, suitable for an animator to attach to torso shoulder pivots.

ROW 4:
cell 1 one tiny LEFT brown boot with short terracotta trouser leg, roughly 6 native pixels wide x 8 high;
cell 2 matching RIGHT brown boot and short terracotta trouser leg;
cell 3 a separate LEAF SWORD: one curved bright green leaf blade with lime cutting edge, dark green outline and tiny brown handle, blade pointing up, roughly 9 native pixels wide x 22 high;
cell 4 one pale cream and lime crescent SLASH effect, a single clean quarter-circle arc, no character or weapon, roughly 25 native pixels wide x 25 high.

All pieces completely isolated on true transparent background with no other marks. Flat pixel art, no 3D shading or rendered look. Keep cream face pale and luminous so the character reads immediately against a green woodland background. This atlas will be cropped into modular head, torso, arms, boots and weapon, then animated without regenerating the character's identity.
```
