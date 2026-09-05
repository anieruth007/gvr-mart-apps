import { TextStyle } from 'react-native';
import { colors, fontFamily } from './tokens';

export const typography: Record<string, TextStyle> = {
  heroTitle: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: 27,
    lineHeight: 32,
    color: colors.white,
  },
  h1: {
    fontFamily: fontFamily.headingBold,
    fontSize: 24,
    lineHeight: 29,
    color: colors.blueDeep,
  },
  h2: {
    fontFamily: fontFamily.headingBold,
    fontSize: 20,
    lineHeight: 25,
    color: colors.blueDeep,
  },
  h3: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: 16,
    lineHeight: 21,
    color: colors.blueDeep,
  },
  eyebrow: {
    fontFamily: fontFamily.bodyExtraBold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.blue,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  bodySmall: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkSoft,
  },
  label: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    color: colors.ink,
  },
  price: {
    fontFamily: fontFamily.bodyExtraBold,
    fontSize: 15,
    color: colors.blueDeep,
  },
  priceStrike: {
    fontFamily: fontFamily.body,
    fontSize: 11,
    color: colors.faint,
    textDecorationLine: 'line-through',
  },
  scribble: {
    fontFamily: fontFamily.scribble,
    fontSize: 20,
    color: colors.tomato,
  },
  button: {
    fontFamily: fontFamily.bodyExtraBold,
    fontSize: 13.5,
    color: colors.white,
  },
};
