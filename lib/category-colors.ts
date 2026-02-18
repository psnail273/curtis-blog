/**
 * Mid-Century Modern color palette for article categories.
 * Each color pair is WCAG AA safe against the site's light/dark backgrounds.
 *
 * Light mode: used as text/border color on #FAFAFA background
 * Dark mode:  lighter variant for #111111 background
 */

interface CategoryColor {
  light: string;  // text/border color for light mode
  dark: string;   // text/border color for dark mode
  bgLight: string; // subtle badge background for light mode
  bgDark: string;  // subtle badge background for dark mode
}

/**
 * Explicit color assignments for known categories.
 * Hues are spread ~90-120° apart on the color wheel for maximum distinction.
 *
 * Education — Deep Teal   (~185°)  cool blue-green
 * Tech      — Terracotta  (~12°)   warm orange-rust
 * Gaming    — Sage Green  (~122°)  earthy green
 * Politics  — Dusty Plum  (~318°)  muted purple
 */
const CATEGORY_COLORS: Record<string, CategoryColor> = {
  Education: { light: '#2D7A7E', dark: '#6CB5B9', bgLight: '#2D7A7E15', bgDark: '#6CB5B918' },
  Tech:      { light: '#A84E2A', dark: '#D97449', bgLight: '#A84E2A15', bgDark: '#D9744918' },
  Gaming:    { light: '#507A52', dark: '#7DB580', bgLight: '#507A5215', bgDark: '#7DB58018' },
  Politics:  { light: '#7B4A66', dark: '#A87D96', bgLight: '#7B4A6615', bgDark: '#A87D9618' },
};

/** Fallback palette for categories without an explicit assignment. */
const FALLBACK_PALETTE: CategoryColor[] = [
  // Mustard
  { light: '#A67C32', dark: '#D4A84B', bgLight: '#A67C3215', bgDark: '#D4A84B18' },
  // Slate Blue
  { light: '#4A6680', dark: '#7BA3C4', bgLight: '#4A668015', bgDark: '#7BA3C418' },
  // Rust
  { light: '#8B5E3C', dark: '#C49A6C', bgLight: '#8B5E3C15', bgDark: '#C49A6C18' },
  // Olive
  { light: '#5F7A3E', dark: '#8FB35E', bgLight: '#5F7A3E15', bgDark: '#8FB35E18' },
];

/**
 * Hash for unknown categories — consistent assignment from the fallback palette.
 */
function hashCategory(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getCategoryColor(category: string): CategoryColor {
  // Explicit mapping first (case-sensitive match)
  if (category in CATEGORY_COLORS) {
    return CATEGORY_COLORS[category];
  }
  // Fallback for unknown categories
  const index = hashCategory(category) % FALLBACK_PALETTE.length;
  return FALLBACK_PALETTE[index];
}

/**
 * Returns CSS custom properties for a category color,
 * suitable for use as inline style on a container element.
 * Components inside can reference var(--cat-color) and var(--cat-bg).
 */
export function getCategoryStyle(category: string): React.CSSProperties {
  const color = getCategoryColor(category);
  return {
    '--cat-color-light': color.light,
    '--cat-color-dark': color.dark,
    '--cat-bg-light': color.bgLight,
    '--cat-bg-dark': color.bgDark,
  } as React.CSSProperties;
}
