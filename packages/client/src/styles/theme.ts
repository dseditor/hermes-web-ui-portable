import type { GlobalThemeOverrides } from 'naive-ui'

// ── Design-studio palette: warm cream + espresso + 陶土紅/赭 (clay) ────
// Clay is the warm earthy accent (bridges the 朱印紅 brand); neutrals are
// warm cream (light) / warm ink (dark) for a calm studio feel.
const SEAL = '#B0563F'
const SEAL_HOVER = '#984733'
const SEAL_PRESSED = '#843D2C'
const SEAL_DARK = '#CF7A55'
const SEAL_DARK_HOVER = '#DB8A64'
const SEAL_DARK_PRESSED = '#C06A45'
const SEAL_TINT_LIGHT = 'rgba(176, 86, 63, 0.10)'
const SEAL_TINT_LIGHT_HOVER = 'rgba(176, 86, 63, 0.16)'
const SEAL_TINT_DARK = 'rgba(207, 122, 85, 0.18)'
const SEAL_TINT_DARK_HOVER = 'rgba(207, 122, 85, 0.26)'

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: SEAL,
    primaryColorHover: SEAL_HOVER,
    primaryColorPressed: SEAL_PRESSED,
    primaryColorSuppl: SEAL,
    bodyColor: '#f4efe6',       // warm cream (design-studio)
    cardColor: '#fbf9f4',
    modalColor: '#fbf9f4',
    popoverColor: '#fbf9f4',
    tableColor: '#fbf9f4',
    inputColor: '#ffffff',
    actionColor: '#ece5d8',
    textColorBase: '#2b2520',
    textColor1: '#2b2520',
    textColor2: '#6f665b',
    textColor3: '#a39a8c',
    dividerColor: '#e6ddcd',
    borderColor: '#e6ddcd',
    hoverColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: '10px',
    borderRadiusSmall: '8px',
    fontSize: '14px',
    fontSizeMedium: '14px',
    heightMedium: '36px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontFamilyMono: 'JetBrains Mono, Fira Code, Consolas, monospace',
  },
  Layout: {
    color: '#f4efe6',
    siderColor: '#2b2622',
    headerColor: '#f4efe6',
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
    borderRadius: '10px',
    borderRadiusSmall: '8px',
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
