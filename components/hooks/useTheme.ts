import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

enum CssColorMode {
  auto = 'auto',
  light = 'light',
  dark = 'dark',
}

enum ComponentColorMode {
  auto = 'auto',
  day = 'day',
  night = 'night',
}

enum SupportedTheme {
  light = 'light',
  dark = 'dark',
  dark_dimmed = 'dark_dimmed',
  dark_high_contrast = 'dark_high_contrast',
}

type CssColorTheme = {
  colorMode: CssColorMode
  lightTheme: SupportedTheme
  darkTheme: SupportedTheme
}

type ComponentColorTheme = {
  colorMode: ComponentColorMode
  dayScheme: SupportedTheme
  nightScheme: SupportedTheme
}

type ColorModeThemes = {
  css: CssColorTheme
  component: ComponentColorTheme
}

export const defaultCSSTheme: CssColorTheme = {
  colorMode: CssColorMode.auto,
  lightTheme: SupportedTheme.light,
  darkTheme: SupportedTheme.dark,
}

export const defaultComponentTheme: ComponentColorTheme = {
  colorMode: ComponentColorMode.auto,
  dayScheme: SupportedTheme.light,
  nightScheme: SupportedTheme.dark,
}

const cssColorModeToComponentColorMode: Record<CssColorMode, ComponentColorMode> = {
  [CssColorMode.auto]: ComponentColorMode.auto,
  [CssColorMode.light]: ComponentColorMode.day,
  [CssColorMode.dark]: ComponentColorMode.night,
}

function filterMode(mode = ''): CssColorMode | undefined {
  if (Object.values<string>(CssColorMode).includes(mode)) {
    return mode as CssColorMode
  }
}

function filterTheme({ name = '', color_mode = '' } = {}): SupportedTheme | undefined {
  if (Object.values<string>(SupportedTheme).includes(name)) {
    return name as SupportedTheme
  }
  if (Object.values<string>(SupportedTheme).includes(color_mode)) {
    return color_mode as SupportedTheme
  }
}

export function getCssTheme(cookieValue = ''): CssColorTheme {
  if (!cookieValue) return defaultCSSTheme
  try {
    const parsed = JSON.parse(cookieValue)
    const { color_mode, light_theme, dark_theme } = parsed
    return {
      colorMode: filterMode(color_mode) || defaultCSSTheme.colorMode,
      lightTheme: filterTheme(light_theme) || defaultCSSTheme.lightTheme,
      darkTheme: filterTheme(dark_theme) || defaultCSSTheme.darkTheme,
    }
  } catch (err) {
    console.warn("Unable to parse 'color_mode' cookie", err)
    return defaultCSSTheme
  }
}

export function getComponentTheme(cookieValue = ''): ComponentColorTheme {
  const { colorMode, lightTheme, darkTheme } = getCssTheme(cookieValue)
  return {
    // The cookie value is a primer/css color_mode.
    // We need to convert that to a primer/react compatible version.
    colorMode: cssColorModeToComponentColorMode[colorMode],
    dayScheme: lightTheme,
    nightScheme: darkTheme,
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<ColorModeThemes>({
    css: defaultCSSTheme,
    component: defaultComponentTheme,
  })

  useEffect(() => {
    const cookieValue = Cookies.get('color_mode')
    const css = getCssTheme(cookieValue)
    const component = getComponentTheme(cookieValue)
    setTheme({ css, component })
  }, [])

  return { theme }
}
