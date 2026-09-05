/**
 * GVR Mart design tokens. Brand color is blue (client explicitly asked to move off the
 * earlier green identity); mango/tomato remain as warm accent/error colors.
 */

export const colors = {
  blueDeep: '#123C73',
  blue: '#2F6FED',
  blueSoft: '#DCE9FB',
  mango: '#F2A93B',
  mangoSoft: '#FDECC8',
  tomato: '#E8503F',
  cream: '#FBF8F1',
  ink: '#22281F',
  inkSoft: '#5C6459',
  white: '#FFFFFF',
  border: 'rgba(18,60,115,0.08)',
  overlay: 'rgba(10,20,35,0.45)',
  muted: '#A9AFA1',
  faint: '#B7BDAE',
} as const;

export const radii = {
  lg: 22,
  md: 16,
  sm: 10,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
} as const;

/** RN needs explicit shadow props (iOS) + elevation (Android); this mirrors the web's box-shadow. */
export const shadow = {
  card: {
    shadowColor: 'rgba(18,60,115,1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 26,
    elevation: 10,
  },
} as const;

export const fontFamily = {
  headingRegular: 'Fraunces_500Medium',
  headingSemibold: 'Fraunces_600SemiBold',
  headingBold: 'Fraunces_700Bold',
  headingExtraBold: 'Fraunces_800ExtraBold',
  headingItalicSemibold: 'Fraunces_600SemiBold_Italic',
  body: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  bodySemibold: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
  bodyExtraBold: 'Manrope_800ExtraBold',
  scribble: 'Caveat_700Bold',
} as const;

export const gradients = {
  hero: [colors.blueDeep, '#1B57A8', colors.blue] as const,
  logoMark: [colors.blue, colors.blueDeep] as const,
  promoWarm: ['#FDECC8', '#F9D889'] as const,
  promoCool: [colors.blueSoft, '#B7D2F5'] as const,
};
