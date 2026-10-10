// The ZIIV mark: five flat pieces (three rounded bars, a rounded square and
// a circle) set in a square turned 45°. Pieces are drawn on an upright
// 100 × 100 grid, then MARK_TRANSFORM rotates and fits them into a
// 100 × 100 viewBox. Shared by the logo, preloader, page transition,
// services illustration and pattern fields so the mark is always identical.

type Radii = [tl: number, tr: number, br: number, bl: number];

/** Rounded rectangle with an individual radius per corner, as a path. */
function roundedRect(x0: number, y0: number, x1: number, y1: number, [tl, tr, br, bl]: Radii): string {
  return [
    `M${x0 + tl} ${y0}`,
    `H${x1 - tr}`,
    `A${tr} ${tr} 0 0 1 ${x1} ${y0 + tr}`,
    `V${y1 - br}`,
    `A${br} ${br} 0 0 1 ${x1 - br} ${y1}`,
    `H${x0 + bl}`,
    `A${bl} ${bl} 0 0 1 ${x0} ${y1 - bl}`,
    `V${y0 + tl}`,
    `A${tl} ${tl} 0 0 1 ${x0 + tl} ${y0}`,
    'Z',
  ].join('');
}

function circle(cx: number, cy: number, r: number): string {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`;
}

/** Rotates the upright grid 45° and scales it to sit inside 0 to 100. */
export const MARK_TRANSFORM = 'translate(50 50) scale(0.68) rotate(-45) translate(-50 -50)';

/** The logo's own colours, from the supplied artwork. */
export const MARK_COLORS = {
  mint: '#B4E2C8',
  green: '#20845C',
  forest: '#033A23',
  ink: '#02241F',
} as const;

export type MarkTone = keyof typeof MARK_COLORS;

export const MARK_PARTS: { id: string; d: string; tone: MarkTone }[] = [
  { id: 'top', d: roundedRect(11, 0, 99, 30, [14, 14, 14, 14]), tone: 'mint' },
  { id: 'right', d: roundedRect(73, 36, 100, 98, [7, 7, 11, 11]), tone: 'green' },
  { id: 'core', d: circle(51, 52, 15.5), tone: 'forest' },
  { id: 'base', d: roundedRect(1, 73, 67, 100, [12, 7, 7, 12]), tone: 'forest' },
  { id: 'corner', d: roundedRect(0, 36, 29, 67, [6, 6, 6, 6]), tone: 'ink' },
];
