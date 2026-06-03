// GrimForge Fonts Configuration for Expo
export const fontFamilies = {
  // Display (headings, badges)
  display: 'Cinzel_700Bold',
  displayRegular: 'Cinzel_400Regular',
  
  // Body & Literary reading fonts
  crimson: 'CrimsonText_400Regular',
  crimsonItalic: 'CrimsonText_400Regular_Italic',
  crimsonBold: 'CrimsonText_700Bold',
  
  garamond: 'EBGaramond_400Regular',
  merriweather: 'Merriweather_400Regular',
  'source-serif': 'SourceSerif4_400Regular',
  georgia: 'serif',
  lato: 'Lato_400Regular',
  dancing: 'DancingScript_400Regular',
};

export const FONTS_LIST = [
  { id: 'crimson',       label: 'Crimson Text',  family: 'CrimsonText_400Regular',  desc: 'Classic literary' },
  { id: 'garamond',      label: 'EB Garamond',   family: 'EBGaramond_400Regular',   desc: 'Elegant & refined' },
  { id: 'merriweather',  label: 'Merriweather',  family: 'Merriweather_400Regular',  desc: 'Comfortable & clear' },
  { id: 'source-serif',  label: 'Source Serif',  family: 'SourceSerif4_400Regular',  desc: 'Modern & readable' },
  { id: 'lato',          label: 'Lato',          family: 'Lato_400Regular',         desc: 'Clean sans-serif' },
  { id: 'dancing',       label: 'Dancing Script', family: 'DancingScript_400Regular', desc: 'Flowing cursive' },
];

export const LINE_HEIGHTS = {
  compact: 1.55,
  normal: 1.85,
  relaxed: 2.05,
  spacious: 2.30,
};

/** Resolve reading font id → loaded Expo font family name */
export function getReaderFontFamily(fontId) {
  return fontFamilies[fontId] || fontFamilies.crimson;
}

export const WIDTHS = {
  narrow: '80%',
  standard: '90%',
  wide: '96%',
  full: '100%',
};
