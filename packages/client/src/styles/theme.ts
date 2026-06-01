import type { GlobalThemeOverrides } from 'naive-ui'

// ── Brand palette: 墨黑 (ink) + 朱印紅 (seal/cinnabar red) ──────────────
// Accent is the warm seal red; neutrals stay ink-black / warm paper so the
// red reads as an intentional brand mark rather than colouring everything.
const SEAL = '#C8403A'
const SEAL_HOVER = '#B5332C'
const SEAL_PRESSED = '#9E2620'
const SEAL_DARK = '#E45B4D'
const SEAL_DARK_HOVER = '#EE6C5E'
const SEAL_DARK_PRESSED = '#D44A3C'
const SEAL_TINT_LIGHT = 'rgba(200, 64, 58, 0.10)'
const SEAL_TINT_LIGHT_HOVER = 'rgba(200, 64, 58, 0.16)'
const SEAL_TINT_DARK = 'rgba(228, 91, 77, 0.16)'
const SEAL_TINT_DARK_HOVER = 'rgba(228, 91, 77, 0.24)'

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: SEAL,
    primaryColorHover: SEAL_HOVER,
    primaryColorPressed: SEAL_PRESSED,
    primaryColorSuppl: SEAL,
    bodyColor: '#faf8f4',       // warm paper (宣紙感)
    cardColor: '#ffffff',
    modalColor: '#ffffff',
    popoverColor: '#ffffff',
    tableColor: '#ffffff',
    inputColor: '#ffffff',
    actionColor: '#f3efe8',
    textColorBase: '#1a1714',
    textColor1: '#1a1714',
    textColor2: '#6b645c',
    textColor3: '#9a938a',
    dividerColor: '#e6e0d6',
    borderColor: '#e2dccf',
    hoverColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: '8px',
    borderRadiusSmall: '6px',
    fontSize: '14px',
    fontSizeMedium: '14px',
    heightMedium: '36px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontFamilyMono: 'JetBrains Mono, Fira Code, Consolas, monospace',
  },
  Layout: {
    color: '#faf8f4',
    siderColor: '#f5f1ea',
    headerColor: '#faf8f4',
  },
  Menu: {
    itemTextColorActive: SEAL,
    itemTextColorActiveHover: SEAL_HOVER,
    itemTextColorChildActive: SEAL,
    itemIconColorActive: SEAL,
    itemIconColorActiveHover: SEAL_HOVER,
    itemColorActive: SEAL_TINT_LIGHT,
    itemColorActiveHover: SEAL_TINT_LIGHT_HOVER,
    arrowColorActive: SEAL,
  },
  Button: {
    textColorPrimary: '#ffffff',
    colorPrimary: SEAL,
    colorHoverPrimary: SEAL_HOVER,
    colorPressedPrimary: SEAL_PRESSED,
    borderRadiusMedium: '8px',
  },
  Input: {
    color: '#ffffff',
    colorFocus: '#ffffff',
    border: '1px solid #e2dccf',
    borderHover: '1px solid #c9c0b2',
    borderFocus: `1px solid ${SEAL}`,
    placeholderColor: '#9a938a',
    caretColor: SEAL,
  },
  Card: {
    color: '#ffffff',
    borderColor: '#e6e0d6',
  },
  Modal: {
    color: '#ffffff',
  },
  Tag: {
    borderRadius: '6px',
  },
}

export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: SEAL_DARK,
    primaryColorHover: SEAL_DARK_HOVER,
    primaryColorPressed: SEAL_DARK_PRESSED,
    primaryColorSuppl: SEAL_DARK,
    bodyColor: '#16140f',       // warm ink black
    cardColor: '#211e1a',
    modalColor: '#211e1a',
    popoverColor: '#211e1a',
    tableColor: '#211e1a',
    inputColor: '#211e1a',
    actionColor: '#1c1a16',
    textColorBase: '#ece7df',
    textColor1: '#ece7df',
    textColor2: '#a39c91',
    textColor3: '#6b645c',
    dividerColor: '#332f29',
    borderColor: '#332f29',
    hoverColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: '8px',
    borderRadiusSmall: '6px',
    fontSize: '14px',
    fontSizeMedium: '14px',
    heightMedium: '36px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontFamilyMono: 'JetBrains Mono, Fira Code, Consolas, monospace',
  },
  Layout: {
    color: '#16140f',
    siderColor: '#1b1915',
    headerColor: '#16140f',
  },
  Menu: {
    itemTextColorActive: SEAL_DARK,
    itemTextColorActiveHover: SEAL_DARK_HOVER,
    itemTextColorChildActive: SEAL_DARK,
    itemIconColorActive: SEAL_DARK,
    itemIconColorActiveHover: SEAL_DARK_HOVER,
    itemColorActive: SEAL_TINT_DARK,
    itemColorActiveHover: SEAL_TINT_DARK_HOVER,
    arrowColorActive: SEAL_DARK,
  },
  Button: {
    textColorPrimary: '#ffffff',
    colorPrimary: SEAL_DARK,
    colorHoverPrimary: SEAL_DARK_HOVER,
    colorPressedPrimary: SEAL_DARK_PRESSED,
    borderRadiusMedium: '8px',
  },
  Input: {
    color: '#211e1a',
    colorFocus: '#211e1a',
    border: '1px solid #332f29',
    borderHover: '1px solid #574f45',
    borderFocus: `1px solid ${SEAL_DARK}`,
    placeholderColor: '#6b645c',
    caretColor: SEAL_DARK,
  },
  Card: {
    color: '#211e1a',
    borderColor: '#332f29',
  },
  Modal: {
    color: '#211e1a',
  },
  Tag: {
    borderRadius: '6px',
  },
  Switch: {
    railColor: '#332f29',
    railColorActive: SEAL_DARK,
    loadingColor: SEAL_DARK,
    opacityDisabled: 0.4,
  },
}

export function getThemeOverrides(isDark: boolean, isComic?: boolean): GlobalThemeOverrides {
  const base = isDark ? darkThemeOverrides : lightThemeOverrides
  if (!isComic) return base
  const comicFont = "'Comic Neue', 'ZCOOL KuaiLe', 'Zen Maru Gothic', 'Gaegu', cursive, sans-serif"
  return {
    ...base,
    common: {
      ...base.common!,
      fontFamily: comicFont,
    },
  }
}
