import { ColorSchemeName, Platform, StyleSheet, ViewStyle } from 'react-native';

// AFAIK, Android has a problem with negative margins.
export type RhythmSize =
  | 'XXS'
  | 'XS'
  | 'Sm'
  | ''
  | '_10x'
  | 'Lg'
  | 'Lg_10x'
  | 'XL'
  | 'XL_10x'
  | 'XXL'
  | 'XXL_10x';

type RhythmProp =
  | `${
      | 'm'
      | 'p'
      | `${'m' | 'p'}${'l' | 'r' | 't' | 'b' | 'v' | 'h'}`}${RhythmSize}`
  | `${'w' | 'h' | `${'max' | 'min'}${'W' | 'H'}`}${RhythmSize}`
  | `${'_' | ''}${'top' | 'bottom' | 'left' | 'right'}${RhythmSize}`;
type RhythmStyles = Record<RhythmProp, ViewStyle>;

export const fontSize = 18;
const lineHeightRatio = 1.5;
export const lineHeight = fontSize * lineHeightRatio;

// http://inlehmansterms.net/2014/06/09/groove-to-a-vertical-rhythm
const fontSizeWithLineHeight = (fontSize: number) => {
  const lines = Math.ceil(fontSize / lineHeight);
  return { fontSize, lineHeight: lines * lineHeight };
};

const colors = {
  white: '#fff',
  black: '#333',
  // brand: '#38a169',
  // brand: '#DC2626',
  gray: '#9CA3AF',
  lightGray: '#E5E7EB',
  error: '#B91C1C',
  warning: '#FF4500',
};

export const createTheme = (colorScheme: ColorSchemeName) =>
  StyleSheet.create({
    textXS: fontSizeWithLineHeight(14),
    textSm: fontSizeWithLineHeight(16),
    text: fontSizeWithLineHeight(fontSize),
    textLg: fontSizeWithLineHeight(24),
    textXL: fontSizeWithLineHeight(32),
    textXXL: fontSizeWithLineHeight(42),

    textBold: { fontWeight: '500' },
    textNotBold: { fontWeight: 'normal' },

    textCenter: { textAlign: 'center' },
    textLeft: { textAlign: 'left' },
    textRight: { textAlign: 'right' },
    textJustify: { textAlign: 'justify' },

    underline: {
      textDecorationLine: 'underline',
    },

    lineThrough: {
      textDecorationLine: 'line-through',
    },

    noTextDecoration: {
      textDecorationLine: 'none',
    },

    mAuto: { margin: 'auto' },
    mhAuto: { marginHorizontal: 'auto' },

    wFull: { width: '100%' },
    maxWFull: { maxWidth: '100%' },
    hFull: { height: '100%' },
    maxHFull: { maxHeight: '100%' },

    // Note rhythm. Vertical is baseLineHeight, horizontal is baseFontSize.
    // RNfW statically renders only actually used styles so we can generate them.
    ...(() => {
      const sizes = [
        ['XXS', lineHeight / 6, fontSize / 6],
        ['XS', lineHeight / 4, fontSize / 4],
        ['Sm', lineHeight / 2, fontSize / 2],
        ['', lineHeight, fontSize],
        ['_10x', lineHeight * 10, fontSize * 10],
        ['Lg', lineHeight * 2, fontSize * 2],
        ['Lg_10x', lineHeight * 20, fontSize * 20],
        ['XL', lineHeight * 3, fontSize * 3],
        ['XL_10x', lineHeight * 30, fontSize * 30],
        ['XXL', lineHeight * 4, fontSize * 4],
        ['XXL_10x', lineHeight * 40, fontSize * 40],
      ] as const;
      const directions = ['l', 'r', 't', 'b', 'v', 'h'] as const;
      const dMap = {
        l: 'Left',
        r: 'Right',
        t: 'Top',
        b: 'Bottom',
        v: 'Vertical',
        h: 'Horizontal',
      } as const;

      const rhythm: Partial<RhythmStyles> = {};

      (['m', 'p'] as const).forEach((a) => {
        sizes.forEach(([size, v, h]) => {
          const prop = (a + size) as keyof RhythmStyles;
          rhythm[prop] =
            a === 'm'
              ? { marginVertical: v, marginHorizontal: h }
              : { paddingVertical: v, paddingHorizontal: h };
        });
        directions.forEach((d) => {
          sizes.forEach(([size, v, h]) => {
            const prop = (a + d + size) as keyof RhythmStyles;
            const mopProp = a === 'm' ? 'margin' : 'padding';
            const valueProps = `${mopProp}${dMap[d]}`;
            rhythm[prop] = {
              [valueProps]: d === 'v' || d === 't' || d === 'b' ? v : h,
            };
          });
        });
      });

      (['w', 'h'] as const).forEach((a) => {
        sizes.forEach(([size, v, h]) => {
          const prop = (a + size) as keyof RhythmStyles;
          rhythm[prop] = {
            [a === 'w' ? 'width' : 'height']: a === 'w' ? h : v,
          };
          ['max', 'min'].forEach((b) => {
            const prop = (b + a.toUpperCase() + size) as keyof RhythmStyles;
            rhythm[prop] = {
              [b + (a === 'w' ? 'Width' : 'Height')]: a === 'w' ? h : v,
            };
          });
        });
      });

      ['_', ''].forEach((a) => {
        ['top', 'bottom', 'left', 'right'].forEach((b) => {
          sizes.forEach(([size, v, h]) => {
            const prop = (a + b + size) as keyof RhythmStyles;
            const value = b === 'top' || b === 'bottom' ? v : h;
            rhythm[prop] = {
              [b]: a === '_' ? -value : value,
            };
          });
        });
      });

      return rhythm as RhythmStyles;
    })(),

    color: {
      color: colorScheme === 'light' ? colors.black : colors.white,
    },
    colorInverted: {
      color: colorScheme !== 'light' ? colors.black : colors.white,
    },
    // colorBrand: {
    //   color: colors.brand,
    // },
    colorGray: {
      color: colors.gray,
    },
    colorWarning: {
      color: colors.warning,
    },
    colorError: {
      color: colors.error,
    },

    bgColor: {
      backgroundColor: colorScheme === 'light' ? colors.white : colors.black,
    },
    bgColorGray: {
      backgroundColor: colors.gray,
    },
    bgColorLightGray: {
      backgroundColor: colors.lightGray,
    },
    bgColorInverted: {
      backgroundColor: colorScheme !== 'light' ? colors.white : colors.black,
    },
    // bgColorBrand: {
    //   backgroundColor: colors.brand,
    // },
    bgColorWarning: {
      backgroundColor: colors.warning,
    },
    bgColorError: {
      backgroundColor: colors.error,
    },
    bgColorYellow: {
      backgroundColor: 'yellow',
    },

    bgColorTransparent: {
      backgroundColor: 'transparent',
    },

    opacity0: {
      opacity: 0,
    },
    opacity02: {
      opacity: 0.2,
    },
    opacityPressed: {
      opacity: 0.7,
    },
    opacityDisabled: {
      opacity: 0.5,
    },
    opacity1: {
      opacity: 1,
    },

    rounded: {
      borderRadius: 6,
    },

    overflowHidden: {
      overflow: 'hidden',
    },

    flexRow: {
      flexDirection: 'row',
    },

    flexGrow: {
      flex: 1,
    },

    flexWrap: {
      flexWrap: 'wrap',
    },

    flexNoWrap: {
      flexWrap: 'nowrap',
    },

    justifyStart: { justifyContent: 'flex-start' },
    justifyEnd: { justifyContent: 'flex-end' },
    justifyCenter: { justifyContent: 'center' },
    justifyBetween: { justifyContent: 'space-between' },
    justifyAround: { justifyContent: 'space-around' },
    justifyEvenly: { justifyContent: 'space-evenly' },

    itemsStart: { alignItems: 'flex-start' },
    itemsEnd: { alignItems: 'flex-end' },
    itemsCenter: { alignItems: 'center' },
    itemsBaseline: { alignItems: 'baseline' },
    itemsStretch: { alignItems: 'stretch' },

    absolute: {
      position: 'absolute',
    },

    relative: {
      position: 'relative',
    },

    inset: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },

    border: {
      borderWidth: 1,
    },

    borderLightGray: {
      borderColor: colors.lightGray,
    },
    borderGray: {
      borderColor: colors.gray,
    },
    borderBlack: {
      borderColor: colors.black,
    },

    _z1: {
      zIndex: -1,
    },

    z1: {
      zIndex: 1,
    },

    shadow: {
      shadowColor: colors.gray,
      shadowOffset: {
        width: 0,
        height: lineHeight / 4.5,
      },
      shadowOpacity: 0.58,
      shadowRadius: lineHeight,
    },

    shadowBottomLine: {
      shadowColor: colors.lightGray,
      shadowOffset: {
        width: 0,
        height: 1,
      },
    },

    // Remember, never combine transitions because only one can be applied.
    // @ts-expect-error RNfW
    transition: Platform.select({
      web: {
        transitionProperty:
          'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter',
        transitionDuration: '150ms',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    }),

    // Remember, never combine transitions because only one can be applied.
    // @ts-expect-error RNfW
    transitionSlow: Platform.select({
      web: {
        transitionProperty:
          'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter',
        transitionDuration: '1.5s',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    }),

    // The concept of _10x etc. is limiting and wrong anyway.
    // The grid should consist of dividable squares.
    // 29 we use right now is not well dividable.
    // createTheme should be redesigned.
    // Sizes should be defined manually only and as needed.
    // Example:
    width13: {
      width: fontSize * 13,
    },

    // I suppose it has better performance than percents from parents.
    viewportWidth100: {
      width: '100vw',
    },

    viewportHeightMin100: {
      minHeight: '100vh',
    },

    noOutline: {
      // @ts-expect-error RNfW
      outlineStyle: 'none',
    },
  });
