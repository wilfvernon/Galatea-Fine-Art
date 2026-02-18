# Galatea Fine Art

A curated gallery site built with React and Vite.

## Scripts

- npm run dev — start development server
- npm run build — create production build
- npm run preview — preview production build locally
- npm run lint — run ESLint checks
- npm run lint:fix — auto-fix lint issues where possible

## Project Structure

```
src/
├── main2.jsx
├── AppMain.jsx
├── index.css
├── pinned.css
└── components/
    ├── Gallery.jsx
    ├── GalleryWithMeta.jsx
    ├── HeaderPinned.jsx
    └── Modal.jsx
public/
└── items.json
```

## Data Format

Edit public/items.json to add or modify gallery items:

```json
{
  "name": "Item Name",
  "type": "Item Type",
  "rarity": "rarity-level",
  "attunement": null,
  "image": "url-to-image",
  "description": "Item description with **bold text** support"
}
```

## Styling Notes

- Shared color tokens are defined in :root in src/index.css.
- Spacing uses scalable units (rem and clamp) for responsive behavior.
- Header-specific pinned layout styles are in src/pinned.css.

## Current Best-Practice Baseline

- Accessibility: gallery tiles are keyboard-accessible button elements with labels.
- Safety: modal description rendering avoids dangerous HTML injection.
- UX: modal closes with Escape, backdrop click, and locks page scroll while open.
- Performance: gallery images use lazy loading and async decoding.
- Quality: ESLint is configured for React Hooks and Vite-friendly component exports.
