/**
 * CSS Utility System
 * 
 * TypeScript utilities for generating CSS-in-JS patterns and utility classes.
 * Follows CODE_EXPANSION principles by preserving existing functionality while
 * providing standardized utility generation for common patterns.
 * 
 * @fileoverview Centralized system for CSS utility generation
 */

import { designTokens, type DesignTokens } from './design-tokens';

// ============================================================================
// CORE UTILITY TYPES
// ============================================================================

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
export type AlignItems = 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
export type AlignContent = 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';

export type GridTemplateColumns = string | number;
export type GridTemplateRows = string | number;
export type GridGap = keyof DesignTokens['spacing'];

export type Position = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
export type Display = 'block' | 'inline' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'inline-grid' | 'none';

export type TransformFunction = 'translateX' | 'translateY' | 'translate' | 'scale' | 'scaleX' | 'scaleY' | 'rotate' | 'skew';
export type TransitionProperty = 'all' | 'transform' | 'opacity' | 'background-color' | 'box-shadow' | 'border' | string;

// Motion token types
export type MotionDuration = keyof DesignTokens['animations']['duration'];
export type MotionEasing = keyof DesignTokens['animations']['easing'];
export type BreakpointKey = 'md' | 'lg' | 'xl';

// ============================================================================
// LAYOUT UTILITIES
// ============================================================================

/**
 * Flexbox Layout Utilities
 * Generates consistent flex layouts using design tokens
 */
export const flexUtilities = {
  /**
   * Basic flex container with common configurations
   */
  container: (
    direction: FlexDirection = 'row',
    justify: JustifyContent = 'flex-start',
    align: AlignItems = 'stretch',
    wrap: FlexWrap = 'nowrap'
  ) => ({
    display: 'flex',
    flexDirection: direction,
    justifyContent: justify,
    alignItems: align,
    flexWrap: wrap,
  }),

  /**
   * Common flex patterns for rapid development
   */
  patterns: {
    row: () => flexUtilities.container('row', 'flex-start', 'center'),
    column: () => flexUtilities.container('column', 'flex-start', 'stretch'),
    center: () => flexUtilities.container('row', 'center', 'center'),
    spaceBetween: () => flexUtilities.container('row', 'space-between', 'center'),
    spaceAround: () => flexUtilities.container('row', 'space-around', 'center'),
    justifyEnd: () => flexUtilities.container('row', 'flex-end', 'center'),
  },

  /**
   * Flex item utilities
   */
  item: {
    grow: (value: number = 1) => ({ flexGrow: value }),
    shrink: (value: number = 1) => ({ flexShrink: value }),
    basis: (value: string) => ({ flexBasis: value }),
    none: () => ({ flex: 'none' }),
    auto: () => ({ flex: 'auto' }),
  },
};

/**
 * Grid Layout Utilities
 * Generates CSS Grid layouts with design token integration
 */
export const gridUtilities = {
  /**
   * Basic grid container
   */
  container: (
    columns?: GridTemplateColumns,
    rows?: GridTemplateRows,
    gap?: GridGap
  ) => ({
    display: 'grid',
    ...(columns && { gridTemplateColumns: typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns }),
    ...(rows && { gridTemplateRows: typeof rows === 'number' ? `repeat(${rows}, 1fr)` : rows }),
    ...(gap && { gap: `var(--md-sys-spacing-${gap})` }),
  }),

  /**
   * Common grid patterns
   */
  patterns: {
    auto: (minWidth: string, gap?: GridGap) => 
      gridUtilities.container(`repeat(auto-fit, minmax(${minWidth}, 1fr))`, undefined, gap),
    equal: (columns: number, gap?: GridGap) => 
      gridUtilities.container(columns, undefined, gap),
    responsive: {
      cards: (gap?: GridGap) => gridUtilities.container(
        'repeat(auto-fit, minmax(280px, 1fr))', 
        undefined, 
        gap
      ),
      columns: {
        mobile: (gap?: GridGap) => gridUtilities.container(1, undefined, gap),
        tablet: (gap?: GridGap) => gridUtilities.container(2, undefined, gap),
        desktop: (gap?: GridGap) => gridUtilities.container(3, undefined, gap),
      },
    },
  },

  /**
   * Grid item utilities
   */
  item: {
    span: (columns: number, rows?: number) => ({
      gridColumn: `span ${columns}`,
      ...(rows && { gridRow: `span ${rows}` }),
    }),
    area: (rowStart: number, colStart: number, rowEnd: number, colEnd: number) => ({
      gridArea: `${rowStart} / ${colStart} / ${rowEnd} / ${colEnd}`,
    }),
  },
};

// ============================================================================
// POSITIONING UTILITIES
// ============================================================================

/**
 * Position Utilities
 * Common positioning patterns with transform utilities
 */
export const positionUtilities = {
  /**
   * Basic positioning
   */
  set: (position: Position, top?: string, right?: string, bottom?: string, left?: string) => ({
    position,
    ...(top !== undefined && { top }),
    ...(right !== undefined && { right }),
    ...(bottom !== undefined && { bottom }),
    ...(left !== undefined && { left }),
  }),

  /**
   * Common positioning patterns
   */
  patterns: {
    relative: () => ({ position: 'relative' as const }),
    absolute: () => ({ position: 'absolute' as const }),
    fixed: () => ({ position: 'fixed' as const }),
    sticky: () => ({ position: 'sticky' as const }),
    
    // Centering patterns
    absoluteCenter: () => ({
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }),
    
    absoluteCenterX: () => ({
      position: 'absolute' as const,
      left: '50%',
      transform: 'translateX(-50%)',
    }),
    
    absoluteCenterY: () => ({
      position: 'absolute' as const,
      top: '50%',
      transform: 'translateY(-50%)',
    }),

    // Edge positioning
    topLeft: () => positionUtilities.set('absolute', '0', undefined, undefined, '0'),
    topRight: () => positionUtilities.set('absolute', '0', '0', undefined, undefined),
    bottomLeft: () => positionUtilities.set('absolute', undefined, undefined, '0', '0'),
    bottomRight: () => positionUtilities.set('absolute', undefined, '0', '0', undefined),
    
    // Fill patterns
    fillParent: () => positionUtilities.set('absolute', '0', '0', '0', '0'),
  },
};

// ============================================================================
// TRANSFORM UTILITIES
// ============================================================================

/**
 * Transform Utilities
 * Generate consistent transform patterns for animations and interactions
 */
export const transformUtilities = {
  /**
   * Individual transform functions
   */
  functions: {
    translateX: (value: string) => `translateX(${value})`,
    translateY: (value: string) => `translateY(${value})`,
    translate: (x: string, y?: string) => `translate(${x}${y ? `, ${y}` : ''})`,
    scale: (value: number | string) => `scale(${value})`,
    scaleX: (value: number | string) => `scaleX(${value})`,
    scaleY: (value: number | string) => `scaleY(${value})`,
    rotate: (value: string) => `rotate(${value})`,
    skew: (x: string, y?: string) => `skew(${x}${y ? `, ${y}` : ''})`,
  },

  /**
   * Common transform combinations
   */
  patterns: {
    // Hover effects
    hoverLift: (distance: string = '-2px') => ({
      transform: `translateY(${distance})`,
    }),
    
    hoverScale: (scale: number = 1.05) => ({
      transform: `scale(${scale})`,
    }),
    
    hoverLiftScale: (distance: string = '-2px', scale: number = 1.02) => ({
      transform: `translateY(${distance}) scale(${scale})`,
    }),

    // Centering transforms
    centerX: () => ({ transform: 'translateX(-50%)' }),
    centerY: () => ({ transform: 'translateY(-50%)' }),
    center: () => ({ transform: 'translate(-50%, -50%)' }),

    // Animation states
    scaleOut: () => ({ transform: 'scale(0)' }),
    scaleIn: () => ({ transform: 'scale(1)' }),
    slideUp: (distance: string = '20px') => ({ transform: `translateY(${distance})` }),
    slideDown: (distance: string = '-20px') => ({ transform: `translateY(${distance})` }),
    slideLeft: (distance: string = '20px') => ({ transform: `translateX(${distance})` }),
    slideRight: (distance: string = '-20px') => ({ transform: `translateX(${distance})` }),
  },

  /**
   * Combine multiple transforms
   */
  combine: (...transforms: string[]) => ({
    transform: transforms.join(' '),
  }),
};

// ============================================================================
// ANIMATION & TRANSITION UTILITIES
// ============================================================================

/**
 * Transition Utilities
 * Generate consistent transitions using design tokens
 */
export const transitionUtilities = {
  /**
   * Basic transitions using design tokens
   */
  create: (
    property: TransitionProperty = 'all',
    duration?: MotionDuration,
    easing?: MotionEasing
  ) => ({
    transition: `${property} var(--md-sys-motion-duration-${String(duration || 'short2')}) var(--md-sys-motion-easing-${String(easing || 'standard')})`,
  }),

  /**
   * Predefined transition patterns
   */
  patterns: {
    fast: (property: TransitionProperty = 'all') => 
      transitionUtilities.create(property, 'short1', 'standard'),
    
    medium: (property: TransitionProperty = 'all') => 
      transitionUtilities.create(property, 'medium2', 'standard'),
    
    slow: (property: TransitionProperty = 'all') => 
      transitionUtilities.create(property, 'long2', 'standard'),

    // Specific property transitions
    transform: (duration?: MotionDuration) => 
      transitionUtilities.create('transform', duration, 'standard'),
    
    opacity: (duration?: MotionDuration) => 
      transitionUtilities.create('opacity', duration, 'standard'),
    
    colors: (duration?: MotionDuration) => 
      transitionUtilities.create('background-color, border-color, color', duration, 'standard'),
    
    shadow: (duration?: MotionDuration) => 
      transitionUtilities.create('box-shadow', duration, 'standard'),
  },

  /**
   * Multiple property transitions
   */
  multiple: (
    properties: Array<{
      property: TransitionProperty;
      duration?: MotionDuration;
      easing?: MotionEasing;
    }>
  ) => ({
    transition: properties
      .map(({ property, duration = 'short2', easing = 'standard' }) =>
        `${property} var(--md-sys-motion-duration-${String(duration)}) var(--md-sys-motion-easing-${String(easing)})`
      )
      .join(', '),
  }),
};

/**
 * Keyframe Animation Utilities
 * Generate consistent animations using design tokens
 */
export const animationUtilities = {
  /**
   * Common keyframe definitions (to be added to CSS)
   */
  keyframes: {
    fadeInUp: `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
    
    fadeIn: `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `,
    
    slideDown: `
      @keyframes slideDown {
        from { transform: translateY(-100%); }
        to { transform: translateY(0); }
      }
    `,
    
    float: `
      @keyframes float {
        from { transform: translateY(0px); }
        to { transform: translateY(-10px); }
      }
    `,
    
    pulse: `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `,
    
    bounce: `
      @keyframes bounce {
        0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
        40%, 43% { transform: translateY(-30px); }
        70% { transform: translateY(-15px); }
        90% { transform: translateY(-4px); }
      }
    `,
  },

  /**
   * Animation utility functions
   */
  create: (
    name: string,
    duration?: MotionDuration,
    easing?: MotionEasing,
    iterationCount: string | number = 1,
    direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse' = 'normal',
    fillMode: 'none' | 'forwards' | 'backwards' | 'both' = 'both'
  ) => ({
    animation: `${name} var(--md-sys-motion-duration-${String(duration || 'medium2')}) var(--md-sys-motion-easing-${String(easing || 'standard')}) ${iterationCount} ${direction} ${fillMode}`,
  }),

  /**
   * Predefined animation patterns
   */
  patterns: {
    fadeInUp: (duration?: MotionDuration) => 
      animationUtilities.create('fadeInUp', duration, 'standard', 1, 'normal', 'forwards'),
    
    float: (duration?: MotionDuration) => 
      animationUtilities.create('float', duration || 'long4', 'standard', 'infinite', 'alternate'),
    
    pulse: (duration?: MotionDuration) => 
      animationUtilities.create('pulse', duration || 'medium2', 'standard', 'infinite'),
    
    bounce: () => 
      animationUtilities.create('bounce', 'medium4', 'standard', 1, 'normal', 'forwards'),
  },
};

// ============================================================================
// COMPONENT STATE UTILITIES
// ============================================================================

/**
 * Interactive State Utilities
 * Generate consistent hover, focus, and active states
 */
export const stateUtilities = {
  /**
   * Hover state generators
   */
  hover: {
    lift: (distance: string = '-2px') => ({
      '&:hover': {
        ...transformUtilities.patterns.hoverLift(distance),
        ...transitionUtilities.patterns.transform('short2'),
      },
    }),
    
    scale: (scale: number = 1.05) => ({
      '&:hover': {
        ...transformUtilities.patterns.hoverScale(scale),
        ...transitionUtilities.patterns.transform('short2'),
      },
    }),
    
    liftScale: (distance: string = '-2px', scale: number = 1.02) => ({
      '&:hover': {
        ...transformUtilities.patterns.hoverLiftScale(distance, scale),
        ...transitionUtilities.patterns.transform('short2'),
      },
    }),
    
    opacity: (value: number = 0.8) => ({
      '&:hover': {
        opacity: value,
        ...transitionUtilities.patterns.opacity('short2'),
      },
    }),
    
    shadow: (elevation: keyof DesignTokens['shadows'] = 'elevation2') => ({
      '&:hover': {
        boxShadow: `var(--md-sys-shadow-${elevation})`,
        ...transitionUtilities.patterns.shadow('short2'),
      },
    }),
  },

  /**
   * Focus state generators
   */
  focus: {
    outline: (color: keyof DesignTokens['colors'] = 'primary') => ({
      '&:focus': {
        outline: `2px solid var(--md-sys-color-${color})`,
        outlineOffset: '2px',
      },
    }),
    
    ring: (color: keyof DesignTokens['colors'] = 'primary') => ({
      '&:focus': {
        boxShadow: `0 0 0 3px var(--md-sys-color-${color})33`,
        ...transitionUtilities.patterns.shadow('short1'),
      },
    }),
  },

  /**
   * Active state generators
   */
  active: {
    scale: (scale: number = 0.95) => ({
      '&:active': {
        transform: `scale(${scale})`,
        ...transitionUtilities.patterns.transform('short1'),
      },
    }),
    
    opacity: (value: number = 0.7) => ({
      '&:active': {
        opacity: value,
        ...transitionUtilities.patterns.opacity('short1'),
      },
    }),
  },

  /**
   * Disabled state generators
   */
  disabled: {
    opacity: (value: number = 0.5) => ({
      '&:disabled, &[aria-disabled="true"]': {
        opacity: value,
        cursor: 'not-allowed',
        pointerEvents: 'none',
      },
    }),
  },
};

// ============================================================================
// UTILITY COMPOSITION HELPERS
// ============================================================================

/**
 * Utility Composition
 * Helper functions for combining utilities
 */
export const utilityHelpers = {
  /**
   * Merge multiple utility objects
   */
  merge: (...utilities: Array<Record<string, any>>) => 
    Object.assign({}, ...utilities),

  /**
   * Apply utilities conditionally
   */
  conditional: (condition: boolean, utilities: Record<string, any>) =>
    condition ? utilities : {},

  /**
   * Create responsive utilities
   */
  responsive: (utilities: {
    mobile?: Record<string, any>;
    tablet?: Record<string, any>;
    desktop?: Record<string, any>;
  }) => ({
    ...utilities.mobile,
    [`@media (min-width: ${designTokens.breakpoints.md})`]: utilities.tablet,
    [`@media (min-width: ${designTokens.breakpoints.lg})`]: utilities.desktop,
  }),

  /**
   * Create utility variants
   */
  variants: <T extends Record<string, any>>(
    base: T,
    variants: Record<string, Partial<T>>
  ) => ({
    base,
    variants,
  }),
};

// ============================================================================
// EXPORTS
// ============================================================================

export const cssUtilities = {
  flex: flexUtilities,
  grid: gridUtilities,
  position: positionUtilities,
  transform: transformUtilities,
  transition: transitionUtilities,
  animation: animationUtilities,
  state: stateUtilities,
  helpers: utilityHelpers,
};

export default cssUtilities;
