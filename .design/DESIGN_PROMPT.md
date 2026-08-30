# Planning-board UI mockup

Build an interactive mockup of a children's robot-programming interface that mirrors a
**physical paper planning board** one-to-one. The board is velcro on paper: three columns,
six numbered step rows, and two trays of movable cards. Autistic students plan on the paper
board first, then reproduce that plan in software, so **visual and structural fidelity to the
paper board is the primary objective, above every other concern** - above polish, above
convention, above your own sense of good UI. When in doubt, match the board.

This document is the complete and only specification.
## Absolute rules - read before anything else

1. **Every piece of artwork is supplied in this document as SVG markup. Copy it verbatim.**
   Never redraw, trace, re-path, approximate, simplify, "clean up", or substitute artwork.
   No emoji. No icon fonts. No icon libraries. No hand-authored path data. If something seems
   to be missing, leave the space empty and say so - **do not invent it.**
2. **Three of the five representation levels have no artwork at all** (`photo`, `aac`, `app`).
   Render a plain bordered frame labelled with the level name. **Never generate, source, or
   draw a photograph, a pictogram, or a substitute icon for these.** This is as important as
   rule 1.
3. **Never restyle the supplied markup.** Colours and stroke widths inside each SVG are final.
   Do not normalise, theme, recolour, or harmonise them.
4. Two kinds of artwork are supplied and they are treated differently:
   - **Glyphs** are bare. You must draw a card behind them (spec below).
   - **Standalone artwork** already carries its own frame or panel. **Never** put it in a card.
   Each entry below says which it is. Getting this backwards double-frames the tile.
5. **Never scale a glyph to fit its card.** Every glyph is already drawn at the correct size:
   one glyph unit equals one card unit. Place it at natural size using the anchoring table
   below. The glyphs are deliberately different sizes - the rabbit nearly fills its card, the
   snail occupies barely a third of it - and that size difference carries meaning. Fitting each
   glyph to its card would destroy it. Preserve aspect ratio always; never stretch.
6. **Build only what is specified.** No extra chrome, headers, footers, branding, tooltips,
   help text, onboarding, empty states, or decoration.

The markup below is prepared and self-contained: internal `<style>` blocks were converted to
presentation attributes so every icon can safely coexist in one document. Do not reintroduce
CSS classes, rename attributes, or move styling into a stylesheet.
---

## Cards and glyph placement

A tile is a card plus a glyph. Draw the card from this exact geometry, then place the glyph at
**natural size** (1 glyph unit = 1 card unit) at the anchor given in the table below.

**Wide card** - `direction` tiles, and every STEP slot. viewBox `0 0 251.1 126.87`:

```html
<svg viewBox="0 0 251.1 126.87" xmlns="http://www.w3.org/2000/svg"><rect stroke-miterlimit="10" stroke-width="3" fill="#fff" stroke="#4d4d4d" x="1.5" y="1.5" width="248.1" height="123.87" rx="12" ry="12"/></svg>
```

**Square card** - `speed`, `color`, `button`, `time`. viewBox `0 0 116.62 100.23`:

```html
<svg viewBox="0 0 116.62 100.23" xmlns="http://www.w3.org/2000/svg"><rect fill="#fff" stroke="#4d4d4d" stroke-miterlimit="10" stroke-width="3" x="1.5" y="1.5" width="113.62" height="97.23" rx="12" ry="12"/></svg>
```

An empty step slot is the same wide rounded shape filled `#f2f2f2` with a thin light border.

### Anchoring - measured from the reference boards, use these exactly

| Class | Horizontal | Vertical |
|---|---|---|
| `direction` | glyph's left edge **8.5 units** from the card's left edge | centred |
| `speed` | centred, **except the turtle**, whose centre sits **4.13 units right** of the card's centre | glyph's bottom edge **4.5 units** above the card's bottom edge |
| `color` | centred | centred |
| `button` | centred | centred |
| `time` | centred | centred |

Two of these are deliberate and must not be "corrected":

- **Direction glyphs hang to the left**, not centred. The wide card leaves room on the right for
  a second element (see the step grammar below).
- **Speed glyphs sit on the floor of their card**, not centred, so the animals read as standing
  on the ground. Combined with their natural sizes this makes the rabbit tower over the snail.
  The turtle's slight rightward nudge balances its leftward visual mass; keep it.
---

## The five representation levels

Every icon belongs to a **class**. A teacher sets the level **per class**, independently - a
student might have motor cards as hardware photos, speed icons as PECS symbols, and colours as
paper drawings, all at once. There is no global level.

| Level | What it is | Artwork today |
|---|---|---|
| `photo` | photographs of the real hardware | **none - placeholder frame** |
| `aac` | PECS-style AAC pictograms | **none - placeholder frame** |
| `paper` | the paper board, plain line art | supplied below |
| `paper-color` | the paper board with colour coding | supplied below |
| `app` | denser icons for advanced students | **none - placeholder frame** |

The progression `paper` -> `paper-color` -> `app` is the primary one; `photo` and `aac` extend
the concrete end.

Only the `direction` class actually differs between `paper` and `paper-color` (it gains a cyan
port dot). For every other class the two levels use identical artwork - it is repeated under
both headings below so you never have to guess.

`sensor-identity` appears only from `paper-color` upward; at `paper` it is absent entirely.
---

## Screen 1 - the board

Canvas is **1280 x 1068.23**. Every coordinate below is in that space - build at these exact
numbers and scale the whole board uniformly to fit the viewport. They are measured from the
reference composition, so following them reproduces it.

> Coordinates give the top-left of each card's **visible rounded rectangle**. The supplied card
> SVG insets its rect by 1.5 units for the stroke, so place the SVG itself 1.5 units up and left
> of the value given.

| Element | x | y | size |
|---|---|---|---|
| Top bar (`#4d4d4d`) | 0 | 0 | 1280 x 56.99 |
| Bluetooth glyph | 1185.65 | 7.52 | 19.60 x 40.07 |
| Settings gear | 1231.02 | 8.58 | 34.31 x 37.90 |
| Column divider (x2) | 348.53 and 714.32 | 152 | 27.68 x 735.69 each |
| STEP slots 1-6 | 75.15 | 159.78 + n x 133.4 | 248.10 x 123.87 |
| Go | 61.34 | 954.03 | 179.53 x 96.83 |
| Stop | 255.70 | 954.03 | 100.33 x 96.83 |
| ACTION direction tiles (x3) | 421.31 | 151.76 + n x 136.6 | 248.10 x 123.87 |
| ACTION speed tiles (x3) | 425.45 | 581.07 + n x 109.6 | 113.62 x 97.23 |
| SENSE colour grid (3x3) | 776.09 + col x 150 | 144.95 + row x 117.81 | 113.62 x 97.23 |
| SENSE button tiles (x2) | 776.09 + col x 150 | 572.70 | 113.62 x 97.23 |
| SENSE timer tile | 776.09 | 767.78 | 113.62 x 97.23 |

**Top bar.** The Bluetooth glyph and gear are the only things on it. Both stroke `#f2f2f2`,
which is why they need the dark bar - they are invisible on white.

**When `sensor-identity` is visible** (that is, at `paper-color` and above), the whole SENSE
column shifts **right by about 100 units** to open space at its left for the two row-label
glyphs: the `?` sits left of the colour grid, the briefcase left of the button row.

**Three column headers** in **Kode Mono Bold** (load from Google Fonts), black, generously
letter-spaced: `STEP`, `ACTION`, `SENSE`, with their baselines around y=112. The step numbers
1-6 use the same face, to the left of each slot. In the reference these are outlined vectors
rather than live text; rendering them in Kode Mono Bold reproduces them.

**STEP column (left).** Six rows numbered 1-6, each number to the left of a slot. **A step slot
is a wide card** - the same 251.1x126.87 geometry as a direction tile - filled `#f2f2f2` when
empty. Space the six slots evenly down the column. Beneath them sit Go and Stop, side by side.

### How a filled step is composed

Every filled step follows the same two-slot grammar inside its one wide card:

| | Left of the card | Right of the card |
|---|---|---|
| Motor step | the `direction` glyph | a `speed` tile (optional) |
| Timed wait | a `time.timer` tile | an editable number |
| Sensor wait | a `sensor-identity` glyph | a `color` or `button` tile |
| Stop | the `direction.stop-motor` glyph | nothing |

The **left** element answers *which thing*, the **right** element answers *what value*. The left
element uses the same left-anchored placement as in the tray - which is exactly why direction
glyphs hang left rather than centring. The right element is a complete square tile (card and
all) nested inside the wide card, inset about **13 units** from the wide card's right edge and
vertically centred. A step with no right-hand value simply leaves that space empty.

**ACTION column (centre).** The three wide direction tiles stacked with small gaps, then a
larger gap, then the three square speed tiles stacked and left-aligned beneath them.

**SENSE column (right).** The nine colour tiles in a 3x3 grid, then a gap, then the two button
tiles side by side, then a gap, then the timer tile alone. From `paper-color` upward the two
sensor-identity glyphs sit as row labels to the left of the colour grid and the button row.

**The two column dividers are supplied as artwork** (`board.divider`, in the library below).
Place one copy at each x given in the table. They are deliberately wobbly, hand-inked lines and
they are the strongest cue that this is a paper artifact. Use the supplied path verbatim - never
substitute a line, rule, border, smooth curve, or CSS divider.

---

## Screen 2 - teacher settings

As important as the board. One row per icon class, each row showing:

- the class name,
- a **live preview** of one tile from that class at its current level,
- a **five-option segmented control**: `photo`, `aac`, `paper`, `paper-color`, `app`,
- a **hide toggle**.

`photo`, `aac` and `app` are **visibly disabled** and labelled as having no artwork yet. Only
`paper` and `paper-color` are selectable. The `controls` class has no hide toggle - it can never
be hidden.

Changes apply to the board immediately.

**Hiding a class removes the capability, not just the artwork.** The whole tray group disappears,
the column **reflows so no empty gap is left behind**, and any tiles of that class already in
step slots are cleared. A student with `speed` hidden cannot set speed at all.

Leave visual room for a future "show words alongside icons" toggle, but **do not build it**.

---

## Screen 3 - Bluetooth pair

A minimal dialog from the top-bar Bluetooth glyph: searching, a short list of found devices,
connect, and a connected state that changes the glyph. Nothing more.

---

## Interactions

- **Drag a tile from a tray into any step slot.** The tray tile stays - each tray position is an
  infinite source, exactly like a stack of identical velcro cards.
- **Drag a tile out of a slot** to remove it.
- **Drop a speed tile onto a motor tile already in a slot** to form a side-by-side composite
  inside that one slot.
- **Drop the timer into a slot** and it pairs with an editable number to its right, inside one
  wide slot. See the reference composition at the end of this document.
- **Go** highlights each filled step in sequence, about a second each, then stops.
- **Stop** halts immediately and clears the highlight.
- **Bluetooth glyph** opens screen 3. **Gear** opens screen 2.
---

# Artwork library

Everything below is prepared, self-contained markup. Copy verbatim.

## Glyphs - draw a card behind each of these

---

### Class `direction`

Motor direction. Wide cards. Card: **wide**. Hideable: yes.

#### `direction.forward`

`paper`:

```html
<svg data-role="direction.forward" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 98.97 97.45"><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="6" d="M49.24,93.78c-24.88,0-45.05-20.17-45.05-45.05,0-24.88,20.17-45.05,45.05-45.05,24.88,0,45.05,20.17,45.05,45.05,0,12.62-5.01,24.68-13.72,33.74l-11.31,11.31"/><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="6" d="M94.3,93.78h-25.03s0-25.03,0-25.03"/></svg>
```

`paper-color`:

```html
<svg data-role="direction.forward" data-level="paper-color" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 98.32 99"><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="6" d="M49.37,94.81c-24.88,0-45.05-20.17-45.05-45.05S24.49,4.7,49.37,4.7c24.88,0,45.05,20.17,45.05,45.05,0,12.62-5.01,24.68-13.72,33.74l-11.31,11.31"/><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="6" d="M94.43,94.81h-25.03s0-25.03,0-25.03"/><path fill="#3ec0f0" stroke="#231f20" stroke-miterlimit="10" stroke-width="3" d="M67.64,50.23c0,9.73-7.89,17.61-17.61,17.61s-17.61-7.89-17.61-17.61c0-9.73,7.89-17.61,17.61-17.61s17.61,7.89,17.61,17.61Z"/></svg>
```

#### `direction.backward`

`paper`:

```html
<svg data-role="direction.backward" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 98.58 99.77"><path fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="6" d="M93.82,49.5c0-24.88-20.17-45.05-45.05-45.05S3.71,24.62,3.71,49.5s20.17,45.05,45.05,45.05c12.62,0,24.68-5.01,33.74-13.72l11.31-11.31"/><path fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="6" d="M93.82,94.55v-25.03h-25.03"/></svg>
```

`paper-color`:

```html
<svg data-role="direction.backward" data-level="paper-color" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100.39 99"><path stroke="#231f20" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="6" d="M95.63,48.72c0-24.88-20.17-45.05-45.05-45.05S5.52,23.84,5.52,48.72s20.17,45.05,45.05,45.05c12.62,0,24.68-5.01,33.74-13.72l11.31-11.31"/><path stroke="#231f20" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="6" d="M95.63,93.78v-25.03h-25.03"/><path fill="#3ec0f0" stroke-miterlimit="10" stroke-width="3" stroke="#231f20" d="M69.18,48.72c0,9.73-7.89,17.61-17.61,17.61s-17.61-7.89-17.61-17.61,7.89-17.61,17.61-17.61,17.61,7.89,17.61,17.61Z"/></svg>
```

#### `direction.stop-motor`

`paper`:

```html
<svg data-role="direction.stop-motor" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="9.69 10.42 99.24 100.60"><ellipse fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="6" cx="59.31" cy="60.72" rx="46.62" ry="47.3"/><rect fill="#fff" x="47.32" y="48.53" width="23.97" height="24.38" rx="1" ry="1"/><path d="M69.29,50.53v20.38h-19.97v-20.38h19.97ZM70.29,46.53h-21.97c-1.66,0-3,1.34-3,3v22.38c0,1.66,1.34,3,3,3h21.97c1.66,0,3-1.34,3-3v-22.38c0-1.66-1.34-3-3-3h0Z"/></svg>
```

`paper-color`:

```html
<svg data-role="direction.stop-motor" data-level="paper-color" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100.13 102.19"><ellipse fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="6" cx="50.05" cy="51.15" rx="46.62" ry="47.3"/><rect fill="#e93628" x="37.57" y="38.46" width="24.97" height="25.38"/><path fill="#231f20" d="M61.04,39.96v22.38h-21.97v-22.38h21.97ZM64.04,36.96h-27.97v28.38h27.97v-28.38h0Z"/></svg>
```

---

### Class `speed`

Speed modifier, dropped onto a motor tile. Square cards. Card: **square**. Hideable: yes.

#### `speed.fast`

`paper`:

```html
<svg data-role="speed.fast" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95.42 86.3"><path fill="#fff" d="M21.12,66.08c.18-7.1,2.84-13.61,7.16-18.71,5.69-6.73,14.27-11.01,23.87-11.01h.88l-15.96-15.67c-3.43-3.36-3.43-8.82,0-12.19,3.43-3.36,8.99-3.36,12.42,0l15.07,14.8h.89c6.8,0,13.01,2.54,17.73,6.69,5.44,4.8,8.87,11.74,8.87,19.43v4.36c0,4.8-3.97,8.7-8.87,8.7h-4.43c-7.23,0-13.11,5.67-13.29,12.72.01.11.01.22.01.33,0,3.21-1.21,6.32-3.39,8.72h-23.23c-9.8,0-17.74-7.8-17.74-17.41,0-.25,0-.5.01-.76Z"/><path fill="#fff" d="M83.18,10.24v19.75c-4.72-4.15-10.93-6.69-17.73-6.69v-13.06c0-4.8,3.97-8.7,8.87-8.7s8.86,3.9,8.86,8.7Z"/><path fill="#fff" d="M28.26,47.35l.02.02c-4.32,5.1-6.98,11.61-7.16,18.71-6.08,2.12-12.85-.35-16.02-5.88-3.62-6.28-1.36-14.25,5.03-17.79,6.4-3.55,14.51-1.34,18.13,4.94Z"/><path fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M52.15,62.48c7.23,0,13.13,5.65,13.31,12.72.01.11.01.22.01.33,0,3.21-1.21,6.32-3.39,8.72"/><line fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" x1="74.32" y1="45.07" x2="74.36" y2="45.07"/><path fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M74.32,84.25h-35.47c-9.8,0-17.74-7.8-17.74-17.41,0-.25,0-.5.01-.76.18-7.1,2.84-13.61,7.16-18.71,5.69-6.73,14.27-11.01,23.87-11.01h.88l-15.96-15.67c-3.43-3.36-3.43-8.82,0-12.19,3.43-3.36,8.99-3.36,12.42,0l15.07,14.8h.89c6.8,0,13.01,2.54,17.73,6.69,5.44,4.8,8.87,11.74,8.87,19.43v4.36c0,4.8-3.97,8.7-8.87,8.7h-4.43c-7.23,0-13.11,5.67-13.29,12.72-.01.11-.01.23-.01.34"/><path fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M83.18,30.01V10.24c0-4.8-3.97-8.7-8.86-8.7s-8.87,3.9-8.87,8.7v13.06"/><path fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M28.26,47.35c-3.62-6.28-11.73-8.49-18.13-4.94-6.39,3.54-8.65,11.51-5.03,17.79,3.17,5.53,9.94,8,16.02,5.88.01,0,.03-.01.04-.01"/></svg>
```

`paper-color`: identical artwork - reuse the markup above.

#### `speed.medium`

`paper`:

```html
<svg data-role="speed.medium" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75.95 48.62"><path fill="#fff" d="M66.34,19.02c3.76,0,6.8,3.2,6.8,7.15s-3.04,7.16-6.8,7.16h-6.8c0-5.21-1.32-10.1-3.64-14.31h10.44Z"/><path fill="#fff" d="M59.54,33.33v10.73c0,1.97-1.52,3.58-3.4,3.58h-6.8c-1.87,0-3.4-1.61-3.4-3.58v-10.73h13.6Z"/><path fill="#fff" d="M59.54,33.33h-13.6l-6.8-14.31,10.81-7.51c2.37,2.12,4.39,4.66,5.95,7.51,2.32,4.21,3.64,9.1,3.64,14.31Z"/><path fill="#fff" d="M49.95,11.51l-10.81,7.51h-13.6l-10.8-7.51c4.74-4.24,10.89-6.8,17.6-6.8s12.87,2.56,17.61,6.8Z"/><polygon fill="#fff" points="39.14 19.02 45.94 33.33 18.74 33.33 25.54 19.02 39.14 19.02"/><path fill="#fff" d="M25.54,19.02l-6.8,14.31H5.14c0-8.74,3.73-16.57,9.6-21.82l10.8,7.51Z"/><path fill="#fff" d="M18.74,33.33v10.73c0,1.97-1.52,3.58-3.4,3.58h-6.8c-1.87,0-3.4-1.61-3.4-3.58v-10.73h13.6Z"/><path fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M39.14,19.02l6.8,14.31v10.73c0,1.97,1.53,3.58,3.4,3.58h6.8c1.88,0,3.4-1.61,3.4-3.58v-10.73c0-5.21-1.32-10.1-3.64-14.31-1.56-2.85-3.58-5.39-5.95-7.51-4.74-4.24-10.89-6.8-17.61-6.8s-12.86,2.56-17.6,6.8c-5.87,5.25-9.6,13.08-9.6,21.82v10.73c0,1.97,1.53,3.58,3.4,3.58h6.8c1.88,0,3.4-1.61,3.4-3.58v-10.73l6.8-14.31h13.6Z"/><polyline fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" points="14.73 11.5 14.74 11.51 25.54 19.02"/><polyline fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" points="49.96 11.5 49.95 11.51 39.14 19.02"/><path fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M55.9,19.02h10.44c3.76,0,6.8,3.2,6.8,7.15s-3.04,7.16-6.8,7.16H5.14"/></svg>
```

`paper-color`: identical artwork - reuse the markup above.

#### `speed.slow`

`paper`:

```html
<svg data-role="speed.slow" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40.75 40.36"><path fill="#fff" d="M38.37,11.77v11.21c0,8.21-6.39,14.94-14.19,14.94h-7.09c7.83,0,14.18-6.69,14.18-14.94v-11.21c0-2.06,1.59-3.73,3.55-3.73s3.55,1.67,3.55,3.73Z"/><path fill="#fff" d="M2.92,23.75c-.01-.26-.02-.51-.02-.77,0-8.26,6.35-14.94,14.19-14.94s14.18,6.68,14.18,14.94-6.35,14.94-14.18,14.94S3.3,31.64,2.92,23.75Z"/><path fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M2.92,23.75c.38,5.83,4.99,10.43,10.62,10.43s10.64-5.01,10.64-11.2c0-4.13-3.18-7.47-7.09-7.47s-7.1,3.34-7.1,7.47c0,2.06,1.59,3.73,3.55,3.73s3.55-1.67,3.55-3.73"/><path fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M2.9,22.98c0-8.26,6.35-14.94,14.19-14.94s14.18,6.68,14.18,14.94-6.35,14.94-14.18,14.94S3.3,31.64,2.92,23.75c-.01-.26-.02-.51-.02-.77Z"/><path fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M2.9,37.92h21.28c7.8,0,14.19-6.73,14.19-14.94v-11.21c0-2.06-1.59-3.73-3.55-3.73s-3.55,1.67-3.55,3.73v11.21"/><line fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" x1="31.27" y1="4.3" x2="33.23" y2="8.41"/><line fill="none" stroke="#231f20" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" x1="38.37" y1="4.3" x2="36.42" y2="8.41"/></svg>
```

`paper-color`: identical artwork - reuse the markup above.

---

### Class `color`

The nine colour-sensor readings. Square cards. Card: **square**. Hideable: yes.

#### `color.red`

`paper`:

```html
<svg data-role="color.red" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64.22 87.16"><path fill="#e93628" d="M32.11,87.16c17.73,0,32.11-14.38,32.11-32.11,0-9.17-4.59-17.89-13.76-25.23-9.17-7.34-16.06-18.35-18.35-29.82-2.29,11.47-9.17,22.48-18.35,29.82C4.59,37.16,0,45.87,0,55.05c0,17.73,14.38,32.11,32.11,32.11Z"/></svg>
```

`paper-color`: identical artwork - reuse the markup above.

#### `color.yellow`

`paper`:

```html
<svg data-role="color.yellow" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64.22 87.16"><path fill="#fae276" d="M32.11,87.16c17.73,0,32.11-14.38,32.11-32.11,0-9.17-4.59-17.89-13.76-25.23-9.17-7.34-16.06-18.35-18.35-29.82-2.29,11.47-9.17,22.48-18.35,29.82C4.59,37.16,0,45.87,0,55.05c0,17.73,14.38,32.11,32.11,32.11Z"/></svg>
```

`paper-color`: identical artwork - reuse the markup above.

#### `color.blue`

`paper`:

```html
<svg data-role="color.blue" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64.22 87.16"><path fill="#5189c7" d="M32.11,87.16c17.73,0,32.11-14.38,32.11-32.11,0-9.17-4.59-17.89-13.76-25.23-9.17-7.34-16.06-18.35-18.35-29.82-2.29,11.47-9.17,22.48-18.35,29.82C4.59,37.16,0,45.87,0,55.05c0,17.73,14.38,32.11,32.11,32.11Z"/></svg>
```

`paper-color`: identical artwork - reuse the markup above.

#### `color.purple`

`paper`:

```html
<svg data-role="color.purple" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64.22 87.16"><path fill="#77509f" d="M32.11,87.16c17.73,0,32.11-14.38,32.11-32.11,0-9.17-4.59-17.89-13.76-25.23-9.17-7.34-16.06-18.35-18.35-29.82-2.29,11.47-9.17,22.48-18.35,29.82C4.59,37.16,0,45.87,0,55.05c0,17.73,14.38,32.11,32.11,32.11Z"/></svg>
```

`paper-color`: identical artwork - reuse the markup above.

#### `color.green`

`paper`:

```html
<svg data-role="color.green" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64.22 87.16"><path fill="#4ba450" d="M32.11,87.16c17.73,0,32.11-14.38,32.11-32.11,0-9.17-4.59-17.89-13.76-25.23-9.17-7.34-16.06-18.35-18.35-29.82-2.29,11.47-9.17,22.48-18.35,29.82C4.59,37.16,0,45.87,0,55.05c0,17.73,14.38,32.11,32.11,32.11Z"/></svg>
```

`paper-color`: identical artwork - reuse the markup above.

#### `color.pink`

`paper`:

```html
<svg data-role="color.pink" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64.22 87.16"><path fill="#c93e95" d="M32.11,87.16c17.73,0,32.11-14.38,32.11-32.11,0-9.17-4.59-17.89-13.76-25.23S34.4,11.47,32.11,0c-2.29,11.47-9.17,22.48-18.35,29.82C4.59,37.16,0,45.87,0,55.05c0,17.73,14.38,32.11,32.11,32.11Z"/></svg>
```

`paper-color`: identical artwork - reuse the markup above.

#### `color.black`

`paper`:

```html
<svg data-role="color.black" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64.22 87.16"><path d="M32.11,87.16c17.73,0,32.11-14.38,32.11-32.11,0-9.17-4.59-17.89-13.76-25.23-9.17-7.34-16.06-18.35-18.35-29.82-2.29,11.47-9.17,22.48-18.35,29.82C4.59,37.16,0,45.87,0,55.05c0,17.73,14.38,32.11,32.11,32.11Z"/></svg>
```

`paper-color`: identical artwork - reuse the markup above.

#### `color.white`

`paper`:

```html
<svg data-role="color.white" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64.22 87.16"><path d="M32.11,12.6c3.65,7.82,9.17,15,15.85,20.34,8.02,6.42,12.26,14.06,12.26,22.11,0,15.5-12.61,28.11-28.11,28.11s-28.11-12.61-28.11-28.11c0-8.05,4.24-15.69,12.26-22.11,6.68-5.34,12.2-12.51,15.85-20.34h0ZM32.11,0c-2.29,11.47-9.17,22.48-18.35,29.82S0,45.87,0,55.05c0,17.73,14.38,32.11,32.11,32.11s32.11-14.38,32.11-32.11c0-9.17-4.59-17.89-13.76-25.23S34.4,11.47,32.11,0h0Z"/></svg>
```

`paper-color`: identical artwork - reuse the markup above.

#### `color.no-color`

`paper`:

```html
<svg data-role="color.no-color" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64.22 87.16"><path d="M32.11,12.6c3.65,7.82,9.17,15,15.85,20.34,8.02,6.42,12.26,14.06,12.26,22.11,0,15.5-12.61,28.11-28.11,28.11s-28.11-12.61-28.11-28.11c0-8.05,4.24-15.69,12.26-22.11,6.68-5.34,12.2-12.51,15.85-20.34h0ZM32.11,0c-2.29,11.47-9.17,22.48-18.35,29.82S0,45.87,0,55.05c0,17.73,14.38,32.11,32.11,32.11s32.11-14.38,32.11-32.11c0-9.17-4.59-17.89-13.76-25.23S34.4,11.47,32.11,0h0Z"/><circle fill="none" stroke="#e93628" stroke-miterlimit="10" stroke-width="4" cx="32.2" cy="55.6" r="19.63"/><path stroke-width="6" fill="none" stroke="#e93628" stroke-miterlimit="10" d="M17.29,41.52l29.84,29.84"/></svg>
```

`paper-color`: identical artwork - reuse the markup above.

---

### Class `button`

Button-sensor states. Square cards. Card: **square**. Hideable: yes.

#### `button.press`

`paper`:

```html
<svg data-role="button.press" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 89.26 75.46"><rect fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" x="5.3" y="53.01" width="80.03" height="18.92" rx="9.46" ry="9.46" transform="translate(90.64 124.95) rotate(-180)"/><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M77.33,53.01V11.38c0-4.18-3.58-7.57-8-7.57h-8"/><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M13.31,53.01V11.38c0-4.18,3.58-7.57,8-7.57h8"/><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M57.32,26.52l-12.01,11.35-12.01-11.35"/><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M45.32,37.87V3.81"/></svg>
```

`paper-color`: identical artwork - reuse the markup above.

#### `button.not-pressed`

`paper`:

```html
<svg data-role="button.not-pressed" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85.13 73.14"><rect fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" x="2.54" y="51.72" width="80.03" height="18.92" rx="9.46" ry="9.46" transform="translate(85.11 122.37) rotate(-180)"/><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M74.57,51.72V10.09c0-4.18-3.58-7.57-8-7.57H18.54c-4.42,0-8,3.39-8,7.57v41.63"/><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M52.56,17.66l-20.01,18.92"/><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M52.56,36.58l-20.01-18.92"/></svg>
```

`paper-color`: identical artwork - reuse the markup above.

---

### Class `time`

Timed wait. Square card; in a step slot it pairs with an editable number. Card: **square**. Hideable: yes.

#### `time.timer`

`paper`:

```html
<svg data-role="time.timer" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63.03 77.78"><line fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" x1="24.13" y1="2" x2="38.89" y2="2"/><line fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" x1="31.51" y1="46.27" x2="42.58" y2="35.2"/><circle fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" cx="31.51" cy="46.27" r="29.51"/></svg>
```

`paper-color`: identical artwork - reuse the markup above.

---

## Standalone artwork - NEVER put these in a card

#### `sensor-identity.color-sensor`

Row label for the colour group. Carries its own dark rounded frame.

`paper`: absent at this level - render nothing.

`paper-color`:

```html
<svg data-role="sensor-identity.color-sensor" data-level="paper-color" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85.52 85.52"><rect fill="#fff" stroke="#000" stroke-miterlimit="10" stroke-width="5" x="2.5" y="2.24" width="80.52" height="80.52" rx="9.26" ry="9.26"/><path d="M22.47,14.49c6.55-1.1,31.56-.93,38.5-.13,4.8.56,8.17,3.9,8.73,8.73.95,8.15.84,28.78.02,37.06-.5,5.08-3.55,8.63-8.75,9.24-8.15.95-28.78.84-37.06.02-5.08-.5-8.63-3.55-9.24-8.75-.86-7.42-.96-30.8.05-38.05.56-4.04,3.75-7.45,7.75-8.12ZM62.87,41.87c0-11.42-9.26-20.68-20.68-20.68s-20.68,9.26-20.68,20.68,9.26,20.68,20.68,20.68,20.68-9.26,20.68-20.68Z"/><path fill="#fff" d="M62.87,41.89c0,11.42-9.26,20.68-20.68,20.68s-20.68-9.26-20.68-20.68,9.26-20.68,20.68-20.68,20.68,9.26,20.68,20.68ZM60.71,41.89c0-10.23-8.29-18.53-18.53-18.53s-18.53,8.29-18.53,18.53,8.29,18.53,18.53,18.53,18.53-8.29,18.53-18.53Z"/><circle fill="#fff" cx="42.19" cy="41.89" r="18.53"/><path fill="#231f20" d="M47.48,31.7l3.92,5.92-6.49,6.74v2.4h-3.49v-3.4l5.89-6.09-1.57-2.34h-5.46l-3.52,3.6-1.77-2.74,3.92-4.09h8.57ZM41.14,49.13h4.12v3.77h-4.12v-3.77Z"/></svg>
```

#### `sensor-identity.button-device`

Row label for the button group. A briefcase; no frame of its own.

`paper`: absent at this level - render nothing.

`paper-color`:

```html
<svg data-role="sensor-identity.button-device" data-level="paper-color" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.43 76.42"><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="5" d="M25.4,15.78c-5.34.15-10.68.34-16.02.45-5.7.12-6.84,1.18-6.86,6.88-.03,14.65-.03,29.3,0,43.94,0,5.19,1.67,6.85,6.86,6.86,19.22.02,38.45.02,57.67,0,5.19,0,6.85-1.67,6.86-6.86.03-14.65.03-29.3,0-43.94-.01-5.7-1.16-6.84-6.86-6.86-12.21-.03-24.41,0-36.62-.03-1.53,0-3.05-.28-4.58-.44"/><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="5" d="M51.03,15.32c0-2.75,0-5.49,0-8.24,0-3.07-1.51-4.58-4.58-4.58-5.49,0-10.99,0-16.48,0-3.07,0-4.59,1.51-4.58,4.58,0,2.75,0,5.49,0,8.24"/><rect fill="#231f20" x="1.75" y="47.46" width="71.71" height="24.59"/></svg>
```

#### `controls.go`

Play. A green arrow on a **pale-green rounded rectangle panel** (`#c9e5c6`, corner radius 16.81) that is part of the artwork. The panel IS the button - do not add a frame, and do not crop or square its corners.

`paper` and `paper-color` (identical):

```html
<svg data-role="controls.go" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 179.53 96.83"><rect fill="#c9e5c6" width="179.53" height="96.83" rx="16.81" ry="16.81"/><polygon fill="#4ba450" stroke="#231f20" stroke-miterlimit="10" stroke-width="3" points="139.62 48.42 91.49 9.94 91.49 29.84 20.95 29.84 20.95 67 91.49 67 91.49 86.9 139.62 48.42"/></svg>
```

#### `controls.stop`

Stop. A red octagon on a **dark rounded rectangle panel** (`#4d4d4d`, corner radius 12.57) that is part of the artwork. The panel IS the button - do not add a frame, and do not crop or square its corners.

`paper` and `paper-color` (identical):

```html
<svg data-role="controls.stop" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100.33 96.83"><rect fill="#4d4d4d" width="100.33" height="96.83" rx="12.57" ry="12.57"/><polygon fill="#e93628" points="33.73 88.1 10.48 64.86 10.48 31.98 33.73 8.73 66.61 8.73 89.85 31.98 89.85 64.86 66.61 88.1 33.73 88.1"/><path fill="#fff" d="M65.78,10.73l22.08,22.08v31.22l-22.08,22.08h-31.22l-22.08-22.08v-31.22l22.08-22.08h31.22ZM67.43,6.73h-34.53L8.48,31.15v34.53l24.42,24.42h34.53l24.42-24.42V31.15l-24.42-24.42h0Z"/><path d="M67.43,6.73l24.42,24.42v34.53l-24.42,24.42h-34.53l-24.42-24.42V31.15L32.9,6.73h34.53ZM68.26,4.73h-36.19l-.59.59L7.06,29.73l-.59.59v36.19l.59.59,24.42,24.42.59.59h36.19l.59-.59,24.42-24.42.59-.59V30.32l-.59-.59-24.42-24.42-.59-.59h0Z"/></svg>
```

#### `controls.bluetooth`

Top-bar glyph. Strokes #f2f2f2 - designed for the DARK bar; it is invisible on white.

`paper` and `paper-color` (identical):

```html
<svg data-role="controls.bluetooth" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.6 40.07"><path fill="none" stroke="#f2f2f2" stroke-miterlimit="10" stroke-width="3" d="M1.06,11.83l16.41,16.41-8.21,8.21V3.62l8.21,8.21L1.06,28.24"/></svg>
```

#### `controls.settings`

Top-bar gear. Strokes #f2f2f2 - designed for the DARK bar; invisible on white.

`paper` and `paper-color` (identical):

```html
<svg data-role="controls.settings" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34.31 37.9"><path fill="none" stroke="#f2f2f2" stroke-miterlimit="10" stroke-width="3" d="M13.08,5.2c.21-2.25,2.21-3.9,4.46-3.68,1.95.19,3.5,1.73,3.68,3.68.2,2.25,2.18,3.91,4.43,3.71.47-.04.94-.17,1.37-.37,2.06-.93,4.48-.02,5.42,2.03.81,1.78.25,3.88-1.34,5.02-1.85,1.3-2.3,3.85-1,5.7.27.39.61.73,1,1,1.84,1.32,2.26,3.87.94,5.71-1.14,1.59-3.24,2.15-5.02,1.34-2.05-.95-4.48-.07-5.43,1.98-.2.43-.32.89-.37,1.37-.21,2.25-2.21,3.9-4.46,3.68-1.95-.19-3.5-1.73-3.68-3.68-.2-2.25-2.18-3.91-4.43-3.71-.47.04-.94.17-1.37.37-2.06.93-4.48.02-5.42-2.03-.81-1.78-.25-3.88,1.34-5.02,1.85-1.3,2.3-3.85,1-5.7-.27-.39-.61-.73-1-1-1.84-1.32-2.26-3.87-.94-5.71,1.14-1.58,3.23-2.15,5.01-1.34,2.05.95,4.48.07,5.43-1.98.2-.43.32-.89.37-1.37"/><circle fill="none" stroke="#f2f2f2" stroke-miterlimit="10" stroke-width="3" cx="17.16" cy="18.95" r="5.24"/></svg>
```

#### `board.divider`

THE HAND-DRAWN COLUMN DIVIDER. Two copies separate the three columns. This is real artwork with deliberate wobble - use it verbatim and never substitute a line, rule, border, or smooth curve.

`paper` and `paper-color` (identical):

```html
<svg data-role="board.divider" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27.68 735.69"><path d="M13.99.82c3.47,23.4,5.76,46.97,7.17,70.58,1.44,24.08,1.97,48.21,1.87,72.33-.1,24.6-.86,49.19-2.04,73.76s-2.78,49.31-4.6,73.93c-1.79,24.3-3.78,48.58-5.78,72.86-1.96,23.83-3.85,47.67-5.46,71.53-1.63,24.02-2.99,48.05-3.91,72.11-.92,24.01-1.39,48.05-1.2,72.08.19,23.49,1.01,46.98,2.74,70.41,1.66,22.47,4.16,44.89,7.85,67.11.88,5.29,1.83,10.56,2.84,15.83.22,1.12,1.32,1.86,2.35,2.19.5.16,2.5.43,2.29-.69-4.26-22.02-7.25-44.26-9.33-66.59-2.16-23.13-3.34-46.35-3.85-69.57-.52-23.93-.33-47.88.36-71.8.69-24.15,1.88-48.29,3.38-72.4,1.48-23.81,3.26-47.59,5.17-71.37,1.95-24.23,4-48.44,5.87-72.67,1.89-24.51,3.63-49.04,4.99-73.59,1.37-24.61,2.37-49.25,2.78-73.89.4-24.32.22-48.65-.81-72.95-1-23.65-2.81-47.26-5.73-70.75-.7-5.65-1.47-11.3-2.31-16.93-.17-1.12-1.35-1.87-2.35-2.19-.54-.17-2.45-.43-2.29.69h0v-.02Z"/></svg>
```

---

## Reference and spares

#### `Artboard 51v2`

Bare red octagon, no panel. Alternate stop-motor glyph seen on one PDF page. Needs a card if used.

```html
<svg data-role="Artboard 51v2" data-level="reference" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90.45 90.48"><polygon fill="#e93628" points="29.2 85.28 5.95 62.04 5.95 29.16 29.2 5.91 62.08 5.91 85.33 29.16 85.33 62.04 62.08 85.28 29.2 85.28"/><path fill="#fff" d="M61.25,7.91l22.08,22.08v31.22l-22.08,22.08h-31.22L7.95,61.21v-31.22L30.03,7.91h31.22ZM62.91,3.91H28.37L3.95,28.33v34.53l24.42,24.42h34.53l24.42-24.42V28.33L62.91,3.91h0Z"/><path d="M62.91,3.91l24.42,24.42v34.53l-24.42,24.42H28.37L3.95,62.86V28.33L28.37,3.91h34.53ZM63.74,1.91H27.55l-.59.59L2.54,26.92l-.59.59v36.19l.59.59,24.42,24.42.59.59h36.19l.59-.59,24.42-24.42.59-.59V27.5l-.59-.59L64.32,2.5l-.59-.59h0Z"/></svg>
```

#### `Timer Tile`

REFERENCE ONLY - the original pre-composed filled timer step, card and all. It shows how a filled timer step should be composed (square timer tile nested at the left of a wide card, number to its right). Do not use it as an asset; build the composition from the card plus the `time.timer` glyph.

```html
<svg data-role="Timer Tile" data-level="reference" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 251.1 126.9"> <rect fill="#fff" stroke="#4d4d4d" stroke-miterlimit="10" stroke-width="3" x="1.5" y="1.5" width="248.1" height="123.9" rx="12" ry="12"/> <rect fill="#fff" stroke="#4d4d4d" stroke-miterlimit="10" stroke-width="3" x="15.3" y="14.8" width="113.6" height="97.2" rx="12" ry="12"/> <line fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" x1="64.8" y1="28.4" x2="79.5" y2="28.4"/> <line fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" x1="72.1" y1="72.7" x2="83.2" y2="61.6"/> <circle fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" cx="72.1" cy="72.7" r="29.5"/> </svg>
```

---

# Reminder of the absolute rules

1. Copy every icon **verbatim**. Never redraw, trace, or substitute one.
2. `photo`, `aac` and `app` are **labelled placeholder frames**. Never invent artwork for them.
3. Glyphs need a card drawn behind them. Standalone artwork must **never** be put in a card.
4. Glyphs render at **natural size** and are anchored per the table - never scaled to fit.
   Direction glyphs hang left; speed glyphs sit on the card's floor.
5. Never restyle, recolour, or re-theme the supplied markup.
6. The column dividers are supplied artwork. Place them verbatim; never substitute a line.
7. Build only what is specified. Nothing extra.
