## Correction - the Go and Stop buttons

Two things about `controls.go` and `controls.stop`:

**1. They are not tiles.** Do not put them in the white card. They are outside the
card-plus-glyph system entirely.

**2. But they are not bare glyphs either.** Each carries its own filled, rounded-rectangle
frame, and that frame *is* the button:

- **Go** - a green arrow on a **pale-green panel**, fill `#c9e5c6`, corner radius **16.81**.
- **Stop** - a red octagon on a **dark panel**, fill `#4d4d4d`, corner radius **12.57**.

So: do not add a frame around them, and do not remove, crop, recolour, or square the corners
of the frame they already have. Same rule as everything else - use the markup verbatim.

**The markup I gave you earlier for these two was cropped, which clipped the panels and cut
off their rounded corners. Replace it with the markup below**, in which each panel fills its
viewBox exactly.

Go - place at x=61.34, y=954.03, size 179.53 x 96.83:

```html
<svg data-role="controls.go" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 179.53 96.83"><rect fill="#c9e5c6" width="179.53" height="96.83" rx="16.81" ry="16.81"/><polygon fill="#4ba450" stroke="#231f20" stroke-miterlimit="10" stroke-width="3" points="139.62 48.42 91.49 9.94 91.49 29.84 20.95 29.84 20.95 67 91.49 67 91.49 86.9 139.62 48.42"/></svg>
```

Stop - place at x=255.70, y=954.03, size 100.33 x 96.83:

```html
<svg data-role="controls.stop" data-level="paper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100.33 96.83"><rect fill="#4d4d4d" width="100.33" height="96.83" rx="12.57" ry="12.57"/><polygon fill="#e93628" points="33.73 88.1 10.48 64.86 10.48 31.98 33.73 8.73 66.61 8.73 89.85 31.98 89.85 64.86 66.61 88.1 33.73 88.1"/><path fill="#fff" d="M65.78,10.73l22.08,22.08v31.22l-22.08,22.08h-31.22l-22.08-22.08v-31.22l22.08-22.08h31.22ZM67.43,6.73h-34.53L8.48,31.15v34.53l24.42,24.42h34.53l24.42-24.42V31.15l-24.42-24.42h0Z"/><path d="M67.43,6.73l24.42,24.42v34.53l-24.42,24.42h-34.53l-24.42-24.42V31.15L32.9,6.73h34.53ZM68.26,4.73h-36.19l-.59.59L7.06,29.73l-.59.59v36.19l.59.59,24.42,24.42.59.59h36.19l.59-.59,24.42-24.42.59-.59V30.32l-.59-.59-24.42-24.42-.59-.59h0Z"/></svg>
```

Nothing else changes.
