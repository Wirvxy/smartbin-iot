// ============================================
// SmartBin design tokens, shared with the web dashboard
// (backend/src/main/resources/static/css/smartbin.css).
// Colour only ever means fill state; everything else is ink on concrete grey.
// ============================================

export const C = {
  bg: '#eceee9',
  surface: '#ffffff',
  surface2: '#f6f7f4',
  ink: '#17201b',
  ink2: '#39443e',
  muted: '#65706a',
  line: '#d5dbd4',
  lineStrong: '#b7c0b8',
  empty: '#dde2dc',

  ok: '#1f8a5b',
  okSoft: '#e3f2ea',
  soon: '#e2a200',
  soonInk: '#855b00',
  soonSoft: '#fbf1d6',
  full: '#d23b2a',
  fullInk: '#b12b1c',
  fullSoft: '#fbe5e1',

  white: '#ffffff',
};

// Loaded in App.js with @expo-google-fonts (Barlow + Barlow Condensed, SIL OFL).
export const F = {
  regular: 'Barlow_400Regular',
  medium: 'Barlow_500Medium',
  semibold: 'Barlow_600SemiBold',
  display: 'BarlowCondensed_600SemiBold',
  displayMedium: 'BarlowCondensed_500Medium',
};

export const T = {
  h1: { fontFamily: F.display, fontSize: 32, lineHeight: 35, color: C.ink },
  h2: { fontFamily: F.display, fontSize: 22, lineHeight: 26, color: C.ink },
  body: { fontFamily: F.regular, fontSize: 16, lineHeight: 23, color: C.ink },
  bodyMedium: { fontFamily: F.medium, fontSize: 16, lineHeight: 22, color: C.ink },
  small: { fontFamily: F.regular, fontSize: 14, lineHeight: 20, color: C.muted },
  label: { fontFamily: F.medium, fontSize: 14, lineHeight: 18, color: C.ink2 },
  figure: { fontFamily: F.display, fontSize: 22, lineHeight: 24, color: C.ink, fontVariant: ['tabular-nums'] },
};

export const R = { panel: 12, control: 8 };

/** Bins are "soon full" from 60 %, and "full" once past their own alert threshold. */
export const SOON = 60;

export function fillState(level, threshold = 80) {
  if (level >= threshold) return 'full';
  if (level >= SOON) return 'soon';
  return 'ok';
}

export const STATE = {
  ok: { color: C.ok, ink: C.ok, soft: C.okSoft, label: 'De la place' },
  soon: { color: C.soon, ink: C.soonInk, soft: C.soonSoft, label: 'Bientôt plein' },
  full: { color: C.full, ink: C.fullInk, soft: C.fullSoft, label: 'Plein' },
};
