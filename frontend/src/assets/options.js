export const FRAME_SIZES = [
  { id: 's', label: 'S', name: 'Small', tile: 22 },
  { id: 'm', label: 'M', name: 'Medium', tile: 29 },
  { id: 'l', label: 'L', name: 'Large', tile: 32 },
];

export const TOGGLES = [
  { id: 'showExplored', label: 'SEARCHED' },
  { id: 'showPath', label: 'ROUTE' },
  { id: 'showDanger', label: 'DANGER' },
  { id: 'crt', label: 'SCANLINES' },
  { id: 'showCoords', label: 'COORDS' },
];

export const DEFAULT_TOGGLES = { showExplored: true, showPath: true, showDanger: true, crt: true, showCoords: false };
