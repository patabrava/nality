/**
 * Design Token Utilities - React Hooks and Helper Functions
 * Provides type-safe access to design tokens in React components
 */

import { useMemo } from 'react';
import {
  designTokens,
  type DesignTokens,
  type ColorTokens,
  type SpacingTokens,
  type TypographyTokens,
  type AnimationTokens,
  createMediaQuery,
  createTransition,
  getToken,
} from './design-tokens';

// ===== REACT HOOKS =====

/**
 * Hook to access design tokens with type safety
 */
export function useDesignTokens(): DesignTokens {
  return designTokens;
}

/**
 * Hook to get a specific token value with fallback
 */
export function useToken(path: string, fallback?: string): string {
  return useMemo(() => getToken(path, fallback), [path, fallback]);
}

/**
 * Hook to create CSS custom property references
 */
export function useCSSCustomProperty(tokenPath: string): string {
  return useMemo(() => {
    const kebabPath = tokenPath.replace(/\./g, '-').replace(/([A-Z])/g, '-$1').toLowerCase();
    return `var(--md-sys-${kebabPath})`;
  }, [tokenPath]);
}

/**
 * Hook to create responsive styles based on breakpoints
 */
export function useResponsiveStyles<T>(
  styles: Partial<Record<keyof typeof designTokens.breakpoints, T>>
): T | undefined {
  return useMemo(() => {
    if (typeof window === 'undefined') return styles.lg; // SSR fallback
    
    const width = window.innerWidth;
    const breakpoints = designTokens.breakpoints;
    
    if (width >= parseInt(breakpoints['2xl'])) return styles['2xl'] ?? styles.xl ?? styles.lg;
    if (width >= parseInt(breakpoints.xl)) return styles.xl ?? styles.lg;
    if (width >= parseInt(breakpoints.lg)) return styles.lg ?? styles.md;
    if (width >= parseInt(breakpoints.md)) return styles.md ?? styles.sm;
    if (width >= parseInt(breakpoints.sm)) return styles.sm ?? styles.xs;
    return styles.xs;
  }, [styles]);
}

// ===== STYLE GENERATORS =====

/**
 * Generate spacing styles from design tokens
 */
export function createSpacingStyles(config: {
  margin?: keyof SpacingTokens | string;
  marginTop?: keyof SpacingTokens | string;
  marginRight?: keyof SpacingTokens | string;
  marginBottom?: keyof SpacingTokens | string;
  marginLeft?: keyof SpacingTokens | string;
  padding?: keyof SpacingTokens | string;
  paddingTop?: keyof SpacingTokens | string;
  paddingRight?: keyof SpacingTokens | string;
  paddingBottom?: keyof SpacingTokens | string;
  paddingLeft?: keyof SpacingTokens | string;
  gap?: keyof SpacingTokens | string;
}): React.CSSProperties {
  const styles: React.CSSProperties = {};
  const { spacing } = designTokens;
  
  if (config.margin) {
    styles.margin = typeof config.margin === 'string' 
      ? config.margin 
      : spacing[config.margin as keyof typeof spacing] as string;
  }
  if (config.marginTop) {
    styles.marginTop = typeof config.marginTop === 'string' 
      ? config.marginTop 
      : spacing[config.marginTop as keyof typeof spacing] as string;
  }
  if (config.marginRight) {
    styles.marginRight = typeof config.marginRight === 'string' 
      ? config.marginRight 
      : spacing[config.marginRight as keyof typeof spacing] as string;
  }
  if (config.marginBottom) {
    styles.marginBottom = typeof config.marginBottom === 'string' 
      ? config.marginBottom 
      : spacing[config.marginBottom as keyof typeof spacing] as string;
  }
  if (config.marginLeft) {
    styles.marginLeft = typeof config.marginLeft === 'string' 
      ? config.marginLeft 
      : spacing[config.marginLeft as keyof typeof spacing] as string;
  }
  if (config.padding) {
    styles.padding = typeof config.padding === 'string' 
      ? config.padding 
      : spacing[config.padding as keyof typeof spacing] as string;
  }
  if (config.paddingTop) {
    styles.paddingTop = typeof config.paddingTop === 'string' 
      ? config.paddingTop 
      : spacing[config.paddingTop as keyof typeof spacing] as string;
  }
  if (config.paddingRight) {
    styles.paddingRight = typeof config.paddingRight === 'string' 
      ? config.paddingRight 
      : spacing[config.paddingRight as keyof typeof spacing] as string;
  }
  if (config.paddingBottom) {
    styles.paddingBottom = typeof config.paddingBottom === 'string' 
      ? config.paddingBottom 
      : spacing[config.paddingBottom as keyof typeof spacing] as string;
  }
  if (config.paddingLeft) {
    styles.paddingLeft = typeof config.paddingLeft === 'string' 
      ? config.paddingLeft 
      : spacing[config.paddingLeft as keyof typeof spacing] as string;
  }
  if (config.gap) {
    styles.gap = typeof config.gap === 'string' 
      ? config.gap 
      : spacing[config.gap as keyof typeof spacing] as string;
  }
  
  return styles;
}

/**
 * Generate typography styles from design tokens
 */
export function createTypographyStyles(config: {
  size?: keyof TypographyTokens['fontSize'];
  weight?: keyof TypographyTokens['fontWeight'];
  lineHeight?: keyof TypographyTokens['lineHeight'];
  letterSpacing?: keyof TypographyTokens['letterSpacing'];
  family?: keyof TypographyTokens['fontFamily'];
  color?: keyof ColorTokens;
}): React.CSSProperties {
  const styles: React.CSSProperties = {};
  const { typography, colors } = designTokens;
  
  if (config.size) {
    styles.fontSize = typography.fontSize[config.size];
  }
  if (config.weight) {
    styles.fontWeight = typography.fontWeight[config.weight];
  }
  if (config.lineHeight) {
    styles.lineHeight = typography.lineHeight[config.lineHeight];
  }
  if (config.letterSpacing) {
    styles.letterSpacing = typography.letterSpacing[config.letterSpacing];
  }
  if (config.family) {
    styles.fontFamily = typography.fontFamily[config.family];
  }
  if (config.color) {
    styles.color = colors[config.color];
  }
  
  return styles;
}

/**
 * Generate button styles from design tokens
 */
export function createButtonStyles(config: {
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outlined' | 'text';
  disabled?: boolean;
}): React.CSSProperties {
  const { colors, components, borderRadius, shadows, animations } = designTokens;
  const styles: React.CSSProperties = {};
  
  // Base styles
  styles.display = 'inline-flex';
  styles.alignItems = 'center';
  styles.justifyContent = 'center';
  styles.border = 'none';
  styles.cursor = config.disabled ? 'not-allowed' : 'pointer';
  styles.transition = createTransition(['background-color', 'color', 'box-shadow'], 'medium2');
  styles.fontFamily = designTokens.typography.fontFamily.primary;
  styles.fontWeight = designTokens.typography.fontWeight.medium;
  
  // Size styles
  switch (config.size) {
    case 'small':
      styles.height = components.button.height.small;
      styles.padding = components.button.padding.small;
      styles.fontSize = designTokens.typography.fontSize.sm;
      styles.borderRadius = borderRadius.button.small;
      styles.minWidth = components.button.minWidth.small;
      break;
    case 'large':
      styles.height = components.button.height.large;
      styles.padding = components.button.padding.large;
      styles.fontSize = designTokens.typography.fontSize.lg;
      styles.borderRadius = borderRadius.button.large;
      styles.minWidth = components.button.minWidth.large;
      break;
    default: // medium
      styles.height = components.button.height.medium;
      styles.padding = components.button.padding.medium;
      styles.fontSize = designTokens.typography.fontSize.base;
      styles.borderRadius = borderRadius.button.medium;
      styles.minWidth = components.button.minWidth.medium;
  }
  
  // Variant styles
  if (config.disabled) {
    styles.backgroundColor = colors.surfaceVariant;
    styles.color = colors.onSurfaceVariant;
    styles.opacity = '0.6';
  } else {
    switch (config.variant) {
      case 'primary':
        styles.backgroundColor = colors.primary;
        styles.color = colors.onPrimary;
        break;
      case 'secondary':
        styles.backgroundColor = colors.secondary;
        styles.color = colors.onSecondary;
        break;
      case 'tertiary':
        styles.backgroundColor = colors.tertiary;
        styles.color = colors.onTertiary;
        break;
      case 'outlined':
        styles.backgroundColor = 'transparent';
        styles.color = colors.primary;
        styles.border = `1px solid ${colors.primary}`;
        break;
      case 'text':
        styles.backgroundColor = 'transparent';
        styles.color = colors.primary;
        styles.boxShadow = 'none';
        break;
      default:
        styles.backgroundColor = colors.primary;
        styles.color = colors.onPrimary;
    }
  }
  
  return styles;
}

/**
 * Generate card styles from design tokens
 */
export function createCardStyles(config: {
  elevation?: 1 | 2 | 3 | 4 | 5;
  padding?: 'mobile' | 'tablet' | 'desktop' | 'large';
  radius?: keyof typeof designTokens.borderRadius;
  maxWidth?: 'small' | 'medium' | 'large';
}): React.CSSProperties {
  const { colors, shadows, borderRadius, components } = designTokens;
  const styles: React.CSSProperties = {};
  
  // Base styles
  styles.backgroundColor = colors.surfaceContainer;
  styles.border = `1px solid ${colors.outlineVariant}`;
  styles.borderRadius = config.radius ? (borderRadius[config.radius] as string) : '20px';
  styles.boxSizing = 'border-box';
  styles.position = 'relative';
  
  // Elevation
  switch (config.elevation) {
    case 1:
      styles.boxShadow = shadows.elevation1;
      break;
    case 2:
      styles.boxShadow = shadows.elevation2;
      break;
    case 3:
      styles.boxShadow = shadows.elevation3;
      break;
    case 4:
      styles.boxShadow = shadows.elevation4;
      break;
    case 5:
      styles.boxShadow = shadows.elevation5;
      break;
    default:
      styles.boxShadow = shadows.elevation1;
  }
  
  // Padding
  switch (config.padding) {
    case 'mobile':
      styles.padding = components.card.padding.mobile;
      break;
    case 'tablet':
      styles.padding = components.card.padding.tablet;
      break;
    case 'large':
      styles.padding = components.card.padding.large;
      break;
    default: // desktop
      styles.padding = components.card.padding.desktop;
  }
  
  // Max width
  switch (config.maxWidth) {
    case 'small':
      styles.maxWidth = components.card.maxWidth.small;
      break;
    case 'medium':
      styles.maxWidth = components.card.maxWidth.medium;
      break;
    case 'large':
      styles.maxWidth = components.card.maxWidth.large;
      break;
  }
  
  return styles;
}

// ===== CSS-IN-JS UTILITIES =====

/**
 * Create CSS media query object for styled-components or emotion
 */
export function createBreakpointStyles<T>(
  breakpointStyles: Partial<Record<keyof typeof designTokens.breakpoints, T>>
): Record<string, T> {
  const result: Record<string, T> = {};
  
  Object.entries(breakpointStyles).forEach(([breakpoint, styles]) => {
    const mediaQuery = createMediaQuery(breakpoint as keyof typeof designTokens.breakpoints);
    result[mediaQuery] = styles;
  });
  
  return result;
}

/**
 * Create animation keyframes object
 */
export function createKeyframes(keyframes: Record<string, React.CSSProperties>): string {
  const keyframeEntries = Object.entries(keyframes)
    .map(([key, styles]) => {
      const styleString = Object.entries(styles)
        .map(([prop, value]) => `${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
        .join('; ');
      return `${key} { ${styleString} }`;
    })
    .join(' ');
  
  return keyframeEntries;
}

/**
 * Create container query styles
 */
export function createContainerStyles(
  containerName: string,
  styles: Record<string, React.CSSProperties>
): Record<string, React.CSSProperties> {
  const result: Record<string, React.CSSProperties> = {};
  
  Object.entries(styles).forEach(([size, styleProps]) => {
    result[`@container ${containerName} (min-width: ${size})`] = styleProps;
  });
  
  return result;
}

// ===== ACCESSIBILITY UTILITIES =====

/**
 * Create focus styles with proper ring and accessibility
 */
export function createFocusStyles(config: {
  ring?: boolean;
  glow?: boolean;
  offset?: boolean;
}): React.CSSProperties {
  const { colors, shadows } = designTokens;
  const styles: React.CSSProperties = {};
  
  if (config.ring) {
    styles.outline = `2px solid ${colors.primary}`;
    styles.outlineOffset = config.offset ? '2px' : '0';
  }
  
  if (config.glow) {
    styles.boxShadow = shadows.glow;
  }
  
  return styles;
}

/**
 * Create high contrast mode styles
 */
export function createHighContrastStyles(styles: React.CSSProperties): string {
  const styleString = Object.entries(styles)
    .map(([prop, value]) => `${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
    .join('; ');
  
  return `@media (prefers-contrast: high) { ${styleString} }`;
}

/**
 * Create reduced motion styles
 */
export function createReducedMotionStyles(styles: React.CSSProperties): string {
  const styleString = Object.entries(styles)
    .map(([prop, value]) => `${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
    .join('; ');
  
  return `@media (prefers-reduced-motion: reduce) { ${styleString} }`;
}

// ===== UTILITY CLASS GENERATORS =====

/**
 * Generate utility class names based on design tokens
 */
export function generateUtilityClasses(): Record<string, string> {
  const classes: Record<string, string> = {};
  
  // Spacing classes
  Object.keys(designTokens.spacing).forEach(key => {
    if (typeof designTokens.spacing[key as keyof typeof designTokens.spacing] === 'string') {
      classes[`space-${key}`] = `space-${key}`;
      classes[`p-${key}`] = `p-${key}`;
      classes[`m-${key}`] = `m-${key}`;
    }
  });
  
  // Typography classes
  Object.keys(designTokens.typography.fontSize).forEach(key => {
    classes[`text-${key}`] = `text-${key}`;
  });
  
  Object.keys(designTokens.typography.fontWeight).forEach(key => {
    classes[`font-${key}`] = `font-${key}`;
  });
  
  // Border radius classes
  Object.keys(designTokens.borderRadius).forEach(key => {
    if (typeof designTokens.borderRadius[key as keyof typeof designTokens.borderRadius] === 'string') {
      classes[`rounded-${key}`] = `rounded-${key}`;
    }
  });
  
  // Shadow classes
  [1, 2, 3, 4, 5].forEach(level => {
    classes[`shadow-${level}`] = `shadow-${level}`;
  });
  
  return classes;
}

// ===== THEME CONTEXT HELPERS =====

/**
 * Get current theme values (useful for theme switching)
 */
export function getCurrentTheme(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  const rootElement = document.documentElement;
  const computedStyles = window.getComputedStyle(rootElement);
  const theme: Record<string, string> = {};
  
  // Extract all CSS custom properties
  for (let i = 0; i < rootElement.style.length; i++) {
    const property = rootElement.style[i];
    if (property && property.startsWith('--md-sys-')) {
      theme[property] = computedStyles.getPropertyValue(property).trim();
    }
  }
  
  return theme;
}

/**
 * Apply theme values to document root
 */
export function applyTheme(theme: Record<string, string>): void {
  if (typeof window === 'undefined') return;
  
  const rootElement = document.documentElement;
  
  Object.entries(theme).forEach(([property, value]) => {
    rootElement.style.setProperty(property, value);
  });
}

// ===== EXPORTS =====
export {
  designTokens,
  createMediaQuery,
  createTransition,
  getToken,
} from './design-tokens';

export default {
  useDesignTokens,
  useToken,
  useCSSCustomProperty,
  useResponsiveStyles,
  createSpacingStyles,
  createTypographyStyles,
  createButtonStyles,
  createCardStyles,
  createBreakpointStyles,
  createKeyframes,
  createContainerStyles,
  createFocusStyles,
  createHighContrastStyles,
  createReducedMotionStyles,
  generateUtilityClasses,
  getCurrentTheme,
  applyTheme,
};
