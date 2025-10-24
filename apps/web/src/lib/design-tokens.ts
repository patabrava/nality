/**
 * Design Token System - Central Source of Truth
 * Following Material Design 3 and OpenAI-inspired clean aesthetic
 * Extracted from globals.css, landing.css, and timeline.css
 */

// ===== COLOR TOKENS =====
export const colorTokens = {
  // Material Design 3 System Colors
  primary: '#6750a4',
  onPrimary: '#ffffff',
  primaryContainer: '#eaddff',
  onPrimaryContainer: '#21005d',
  
  secondary: '#625b71',
  onSecondary: '#ffffff',
  secondaryContainer: '#e8def8',
  onSecondaryContainer: '#1d192b',
  
  tertiary: '#7d5260',
  onTertiary: '#ffffff',
  tertiaryContainer: '#ffd8e4',
  onTertiaryContainer: '#31111d',
  
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#410002',
  
  // Surface Colors (Dark Theme)
  surface: '#0d0d0d',
  onSurface: '#e6e1e5',
  surfaceVariant: '#1a1a1a',
  onSurfaceVariant: '#cab6cc',
  surfaceDim: '#111111',
  surfaceBright: '#1f1f1f',
  
  // Surface Container Hierarchy
  surfaceContainerLowest: '#0a0a0a',
  surfaceContainerLow: '#131313',
  surfaceContainer: '#1a1a1a',
  surfaceContainerHigh: '#262626',
  surfaceContainerHighest: '#333333',
  
  // Outline Colors
  outline: '#79747e',
  outlineVariant: '#49454f',
  
  // Inverse Colors
  inverseSurface: '#e6e1e5',
  inverseOnSurface: '#0d0d0d',
  inversePrimary: '#6750a4',
  
  // Neutral Colors (Extended)
  neutralVariant10: '#1d1b20',
  neutralVariant20: '#332d38',
  neutralVariant30: '#4a4458',
  neutralVariant40: '#625b71',
  neutralVariant50: '#7c7289',
  neutralVariant60: '#968da3',
  neutralVariant70: '#b1a7bd',
  neutralVariant80: '#ccc2d8',
  neutralVariant90: '#e8def8',
  neutralVariant95: '#f6edff',
  neutralVariant99: '#fffbfe',
  
  // Utility Colors
  warning: '#ffc107',
  onWarning: '#1c1c1c',
  success: '#4caf50',
  onSuccess: '#ffffff',
  info: '#2196f3',
  onInfo: '#ffffff',
} as const;

// ===== SPACING TOKENS =====
export const spacingTokens = {
  // Base spacing scale (4px unit)
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '48px',
  '6xl': '56px',
  '7xl': '64px',
  '8xl': '80px',
  '9xl': '96px',
  
  // Container spacing
  containerPadding: {
    mobile: '16px',
    tablet: '24px',
    desktop: '32px',
    wide: '48px',
  },
  
  // Section spacing
  sectionSpacing: {
    mobile: '48px',
    tablet: '64px',
    desktop: '80px',
  },
  
  // Component spacing
  cardPadding: {
    mobile: '16px',
    tablet: '20px',
    desktop: '24px',
    large: '28px',
  },
  
  // Timeline specific spacing
  timeline: {
    spineOffset: {
      mobile: '24px',
      mobileLarge: '28px',
      desktop: '50%',
    },
    itemMargin: {
      mobile: '32px',
      mobileLarge: '40px',
      tablet: '48px',
      desktop: '64px',
    },
    nodeSize: {
      mobile: '12px',
      mobileLarge: '16px',
      desktop: '16px',
      large: '20px',
    },
    cardClearance: {
      desktop: '32px',
      large: '40px',
      ultraWide: '48px',
    },
  },
} as const;

// ===== TYPOGRAPHY TOKENS =====
export const typographyTokens = {
  // Font families
  fontFamily: {
    primary: "'Roboto', system-ui, -apple-system, 'Segoe UI', sans-serif",
    mono: "'Roboto Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
    system: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
  
  // Font weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Font sizes (responsive clamp values)
  fontSize: {
    xs: 'clamp(0.625rem, 2vw, 0.75rem)',        // 10px-12px
    sm: 'clamp(0.75rem, 3vw, 0.875rem)',        // 12px-14px
    base: 'clamp(0.875rem, 3vw, 1rem)',         // 14px-16px
    lg: 'clamp(1rem, 4vw, 1.125rem)',           // 16px-18px
    xl: 'clamp(1.125rem, 4vw, 1.25rem)',        // 18px-20px
    '2xl': 'clamp(1.25rem, 5vw, 1.5rem)',       // 20px-24px
    '3xl': 'clamp(1.5rem, 6vw, 2rem)',          // 24px-32px
    '4xl': 'clamp(2rem, 8vw, 2.5rem)',          // 32px-40px
    '5xl': 'clamp(2.5rem, 10vw, 3rem)',         // 40px-48px
  },
  
  // Line heights
  lineHeight: {
    tight: '1.1',
    snug: '1.2',
    normal: '1.3',
    relaxed: '1.4',
    loose: '1.5',
    extraLoose: '1.6',
  },
  
  // Letter spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ===== BORDER RADIUS TOKENS =====
export const borderRadiusTokens = {
  none: '0',
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '50%',
  
  // Component specific
  card: {
    mobile: '12px',
    tablet: '16px',
    desktop: '20px',
  },
  button: {
    small: '6px',
    medium: '8px',
    large: '12px',
  },
  input: '8px',
  badge: {
    small: '6px',
    medium: '8px',
    large: '10px',
  },
} as const;

// ===== SHADOW TOKENS =====
export const shadowTokens = {
  // Elevation shadows
  elevation1: '0 1px 3px rgba(0, 0, 0, 0.1)',
  elevation2: '0 2px 8px rgba(0, 0, 0, 0.15)',
  elevation3: '0 4px 12px rgba(0, 0, 0, 0.2)',
  elevation4: '0 8px 24px rgba(0, 0, 0, 0.15)',
  elevation5: '0 12px 32px rgba(0, 0, 0, 0.2)',
  
  // Interactive shadows
  buttonHover: '0 2px 8px rgba(0, 0, 0, 0.15)',
  cardHover: '0 8px 24px rgba(0, 0, 0, 0.15)',
  
  // Focus shadows
  focusRing: '0 0 0 2px var(--md-sys-color-primary)',
  focusRingOffset: '0 0 0 2px var(--md-sys-color-primary), 0 0 0 4px rgba(103, 80, 164, 0.2)',
  
  // Special effects
  glow: '0 0 12px var(--md-sys-color-primary)',
  inset: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
} as const;

// ===== ANIMATION TOKENS =====
export const animationTokens = {
  // Duration
  duration: {
    instant: '0ms',
    short1: '50ms',
    short2: '100ms',
    short3: '150ms',
    short4: '200ms',
    medium1: '250ms',
    medium2: '300ms',
    medium3: '350ms',
    medium4: '400ms',
    long1: '450ms',
    long2: '500ms',
    long3: '550ms',
    long4: '600ms',
    extraLong1: '700ms',
    extraLong2: '800ms',
    extraLong3: '900ms',
    extraLong4: '1000ms',
  },
  
  // Easing functions
  easing: {
    linear: 'linear',
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    standardAccelerate: 'cubic-bezier(0.3, 0, 1, 1)',
    standardDecelerate: 'cubic-bezier(0, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasizedAccelerate: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
    emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
    legacy: 'cubic-bezier(0.4, 0, 0.2, 1)',
    legacyAccelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    legacyDecelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  },
  
  // Common transition patterns
  transition: {
    fast: 'all 200ms cubic-bezier(0.2, 0, 0, 1)',
    medium: 'all 300ms cubic-bezier(0.2, 0, 0, 1)',
    slow: 'all 400ms cubic-bezier(0.2, 0, 0, 1)',
    transform: 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
    opacity: 'opacity 150ms cubic-bezier(0.2, 0, 0, 1)',
    colors: 'background-color 200ms cubic-bezier(0.2, 0, 0, 1), color 200ms cubic-bezier(0.2, 0, 0, 1)',
  },
} as const;

// ===== BREAKPOINT TOKENS =====
export const breakpointTokens = {
  // Breakpoint values
  xs: '320px',
  sm: '480px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1440px',
  '3xl': '1920px',
  
  // Container max widths
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1440px',
  },
  
  // Landing page specific
  landing: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1440px',
  },
  
  // Timeline specific
  timeline: {
    mobileEnd: '767px',
    tabletStart: '768px',
    desktopStart: '1024px',
    ultraWideStart: '1440px',
  },
} as const;

// ===== Z-INDEX TOKENS =====
export const zIndexTokens = {
  // Base layers
  base: 0,
  raised: 1,
  overlay: 2,
  
  // Component layers
  timeline: {
    spine: 1,
    node: 2,
    card: 2,
    badge: 5,
    menu: 10,
  },
  
  // UI layers
  dropdown: 10,
  tooltip: 20,
  modal: 30,
  notification: 40,
  skipLink: 999999,
} as const;

// ===== COMPONENT TOKENS =====
export const componentTokens = {
  // Button tokens
  button: {
    height: {
      small: '32px',
      medium: '40px',
      large: '48px',
    },
    padding: {
      small: '8px 16px',
      medium: '12px 24px',
      large: '16px 32px',
    },
    minWidth: {
      small: '80px',
      medium: '120px',
      large: '160px',
    },
  },
  
  // Input tokens
  input: {
    height: {
      small: '32px',
      medium: '40px',
      large: '48px',
    },
    padding: '12px 16px',
    borderWidth: '1px',
  },
  
  // Card tokens
  card: {
    padding: {
      mobile: '16px',
      tablet: '20px',
      desktop: '24px',
      large: '28px',
    },
    maxWidth: {
      small: '320px',
      medium: '480px',
      large: '640px',
    },
  },
  
  // Navigation tokens
  nav: {
    height: '48px',
    padding: '0 24px',
    zIndex: 10,
  },
  
  // Header tokens
  header: {
    height: {
      mobile: '56px',
      desktop: '64px',
    },
    padding: {
      mobile: '0 16px',
      desktop: '0 24px',
    },
  },
} as const;

// ===== UTILITY CLASSES MAP =====
export const utilityClassTokens = {
  spacing: {
    margin: 'm',
    marginTop: 'mt',
    marginRight: 'mr',
    marginBottom: 'mb',
    marginLeft: 'ml',
    marginX: 'mx',
    marginY: 'my',
    padding: 'p',
    paddingTop: 'pt',
    paddingRight: 'pr',
    paddingBottom: 'pb',
    paddingLeft: 'pl',
    paddingX: 'px',
    paddingY: 'py',
  },
  
  typography: {
    fontSize: 'text',
    fontWeight: 'font',
    lineHeight: 'leading',
    letterSpacing: 'tracking',
    textAlign: 'text',
  },
  
  layout: {
    display: 'd',
    flexDirection: 'flex',
    justifyContent: 'justify',
    alignItems: 'items',
    gap: 'gap',
    grid: 'grid',
    gridCols: 'grid-cols',
    width: 'w',
    height: 'h',
    maxWidth: 'max-w',
    maxHeight: 'max-h',
  },
  
  colors: {
    background: 'bg',
    color: 'text',
    border: 'border',
  },
  
  effects: {
    shadow: 'shadow',
    borderRadius: 'rounded',
    opacity: 'opacity',
    transform: 'transform',
    transition: 'transition',
  },
} as const;

// ===== TOKEN EXPORT MAP =====
export const designTokens = {
  colors: colorTokens,
  spacing: spacingTokens,
  typography: typographyTokens,
  borderRadius: borderRadiusTokens,
  shadows: shadowTokens,
  animations: animationTokens,
  breakpoints: breakpointTokens,
  zIndex: zIndexTokens,
  components: componentTokens,
  utilities: utilityClassTokens,
} as const;

// ===== TYPE DEFINITIONS =====
export type ColorTokens = typeof colorTokens;
export type SpacingTokens = typeof spacingTokens;
export type TypographyTokens = typeof typographyTokens;
export type BorderRadiusTokens = typeof borderRadiusTokens;
export type ShadowTokens = typeof shadowTokens;
export type AnimationTokens = typeof animationTokens;
export type BreakpointTokens = typeof breakpointTokens;
export type ZIndexTokens = typeof zIndexTokens;
export type ComponentTokens = typeof componentTokens;
export type UtilityClassTokens = typeof utilityClassTokens;
export type DesignTokens = typeof designTokens;

// ===== CSS CUSTOM PROPERTY GENERATORS =====
export function generateCSSCustomProperties(tokens: Record<string, any>, prefix = '--md-sys'): string {
  const properties: string[] = [];
  
  function processTokens(obj: Record<string, any>, currentPrefix: string) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        processTokens(value, `${currentPrefix}-${key}`);
      } else {
        properties.push(`  ${currentPrefix}-${key}: ${value};`);
      }
    }
  }
  
  processTokens(tokens, prefix);
  return properties.join('\n');
}

// ===== UTILITY FUNCTIONS =====
export function getToken(path: string, fallback?: string): string {
  const keys = path.split('.');
  let current: any = designTokens;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return fallback || path;
    }
  }
  
  return typeof current === 'string' ? current : fallback || path;
}

export function createMediaQuery(breakpoint: keyof typeof breakpointTokens, type: 'min' | 'max' = 'min'): string {
  const value = breakpointTokens[breakpoint];
  return `@media (${type}-width: ${value})`;
}

export function createTransition(properties: string[], duration?: keyof typeof animationTokens.duration, easing?: keyof typeof animationTokens.easing): string {
  const dur = duration ? animationTokens.duration[duration] : animationTokens.duration.medium2;
  const ease = easing ? animationTokens.easing[easing] : animationTokens.easing.standard;
  return properties.map(prop => `${prop} ${dur} ${ease}`).join(', ');
}

// ===== DEFAULT EXPORT =====
export default designTokens;
