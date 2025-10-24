'use client';

import React, { useState } from 'react';

/**
 * StyleguideUtilities Component
 * 
 * Interactive documentation for the consolidated utility system.
 * Demonstrates all utility classes with live examples and code snippets.
 * 
 * Following CODE_EXPANSION principles: preserves existing functionality while
 * providing comprehensive documentation for new consolidated utilities.
 */

const StyleguideUtilities: React.FC = () => {
  const [activeTab, setActiveTab] = useState('layout');

  const tabs = [
    { id: 'layout', label: 'Layout' },
    { id: 'transforms', label: 'Transforms' },
    { id: 'interactions', label: 'Interactions' },
    { id: 'animations', label: 'Animations' },
    { id: 'states', label: 'States' },
    { id: 'responsive', label: 'Responsive' },
    { id: 'accessibility', label: 'Accessibility' },
  ];

  const CodeBlock = ({ children, className = '' }: { children: string; className?: string }) => (
    <pre className={`bg-surface-container rounded-md p-4 text-sm overflow-x-auto ${className}`}>
      <code className="text-on-surface-variant">{children}</code>
    </pre>
  );

  const ExampleSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-8 p-6 bg-surface-container rounded-lg border border-outline-variant">
      <h3 className="text-lg font-semibold text-on-surface mb-4">{title}</h3>
      {children}
    </div>
  );

  const DemoBox = ({ className, children, label }: { className: string; children: React.ReactNode; label: string }) => (
    <div className="mb-4">
      <p className="text-sm text-on-surface-variant mb-2">{label}</p>
      <div className={`p-4 bg-surface-dim rounded border border-outline-variant ${className}`}>
        {children}
      </div>
      <CodeBlock className="mt-2">
        {`<div className="${className}">
  ${typeof children === 'string' ? children : 'Content'}
</div>`}
      </CodeBlock>
    </div>
  );

  const renderLayoutTab = () => (
    <div className="space-y-6">
      <ExampleSection title="Flexbox Utilities">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DemoBox className="flex justify-between items-center" label="Flex with space-between and center alignment">
            <div className="w-6 h-6 bg-primary rounded"></div>
            <div className="w-6 h-6 bg-secondary rounded"></div>
            <div className="w-6 h-6 bg-tertiary rounded"></div>
          </DemoBox>
          
          <DemoBox className="flex flex-col items-center gap-2" label="Flex column with center alignment">
            <div className="w-8 h-4 bg-primary rounded"></div>
            <div className="w-8 h-4 bg-secondary rounded"></div>
            <div className="w-8 h-4 bg-tertiary rounded"></div>
          </DemoBox>
        </div>
        
        <h4 className="text-md font-medium text-on-surface mt-6 mb-3">Available Flex Classes</h4>
        <CodeBlock>
{`.flex           - display: flex
.flex-col       - flex-direction: column
.flex-row       - flex-direction: row
.flex-wrap      - flex-wrap: wrap

.justify-start  - justify-content: flex-start
.justify-center - justify-content: center
.justify-between - justify-content: space-between
.justify-around - justify-content: space-around

.items-start    - align-items: flex-start
.items-center   - align-items: center
.items-end      - align-items: flex-end

.flex-1         - flex: 1 1 0%
.flex-auto      - flex: 1 1 auto
.flex-none      - flex: none`}
        </CodeBlock>
      </ExampleSection>

      <ExampleSection title="Grid Utilities">
        <div className="space-y-4">
          <DemoBox className="grid grid-cols-3 gap-4" label="3-column grid with gap">
            <div className="h-12 bg-primary rounded"></div>
            <div className="h-12 bg-secondary rounded"></div>
            <div className="h-12 bg-tertiary rounded"></div>
            <div className="h-12 bg-primary rounded"></div>
            <div className="h-12 bg-secondary rounded"></div>
            <div className="h-12 bg-tertiary rounded"></div>
          </DemoBox>
          
          <DemoBox className="grid grid-cols-auto gap-4" label="Auto-fit grid (responsive)">
            <div className="h-12 bg-primary rounded"></div>
            <div className="h-12 bg-secondary rounded"></div>
            <div className="h-12 bg-tertiary rounded"></div>
          </DemoBox>
        </div>
        
        <CodeBlock>
{`.grid          - display: grid
.grid-cols-1   - 1 column
.grid-cols-2   - 2 columns
.grid-cols-3   - 3 columns
.grid-cols-4   - 4 columns
.grid-cols-auto - auto-fit with min 250px`}
        </CodeBlock>
      </ExampleSection>

      <ExampleSection title="Position Utilities">
        <div className="relative h-32 bg-surface-dim rounded border border-outline-variant overflow-hidden">
          <div className="absolute-center w-8 h-8 bg-primary rounded">
            <span className="sr-only">Centered element</span>
          </div>
          <div className="absolute top-2 left-2 w-6 h-6 bg-secondary rounded"></div>
          <div className="absolute top-2 right-2 w-6 h-6 bg-tertiary rounded"></div>
        </div>
        
        <CodeBlock>
{`.relative       - position: relative
.absolute       - position: absolute
.fixed          - position: fixed

.absolute-center   - center both X and Y
.absolute-center-x - center horizontally
.absolute-center-y - center vertically
.fill-parent       - fill entire parent`}
        </CodeBlock>
      </ExampleSection>
    </div>
  );

  const renderTransformsTab = () => (
    <div className="space-y-6">
      <ExampleSection title="Transform Utilities">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-md font-medium text-on-surface">Scale Effects</h4>
            <DemoBox className="scale-105" label="scale-105">
              <div className="w-16 h-16 bg-primary rounded mx-auto"></div>
            </DemoBox>
            <DemoBox className="scale-110" label="scale-110">
              <div className="w-16 h-16 bg-secondary rounded mx-auto"></div>
            </DemoBox>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-md font-medium text-on-surface">Translate Effects</h4>
            <DemoBox className="translate-y-2" label="translate-y-2 (lift effect)">
              <div className="w-16 h-16 bg-tertiary rounded mx-auto"></div>
            </DemoBox>
            <DemoBox className="transform-center-x" label="transform-center-x">
              <div className="w-16 h-16 bg-error rounded"></div>
            </DemoBox>
          </div>
        </div>
        
        <CodeBlock>
{`.scale-95, .scale-100, .scale-105, .scale-110, .scale-125
.translate-y-1, .translate-y-2, .translate-y-4
.transform-center-x, .transform-center-y, .transform-center`}
        </CodeBlock>
      </ExampleSection>
    </div>
  );

  const renderInteractionsTab = () => (
    <div className="space-y-6">
      <ExampleSection title="Hover Effects">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DemoBox className="hover-lift-2 cursor-pointer" label="hover-lift-2 (hover to see effect)">
            <div className="w-16 h-16 bg-primary rounded mx-auto flex items-center justify-center text-on-primary">
              Hover
            </div>
          </DemoBox>
          
          <DemoBox className="hover-scale-105 cursor-pointer" label="hover-scale-105">
            <div className="w-16 h-16 bg-secondary rounded mx-auto flex items-center justify-center text-on-secondary">
              Hover
            </div>
          </DemoBox>
          
          <DemoBox className="hover-lift-scale cursor-pointer" label="hover-lift-scale (combined)">
            <div className="w-16 h-16 bg-tertiary rounded mx-auto flex items-center justify-center text-on-tertiary">
              Hover
            </div>
          </DemoBox>
        </div>
        
        <CodeBlock>
{`.hover-lift-1     - translateY(-1px) on hover
.hover-lift-2     - translateY(-2px) on hover
.hover-lift-4     - translateY(-4px) on hover
.hover-scale-105  - scale(1.05) on hover
.hover-scale-110  - scale(1.1) on hover
.hover-lift-scale - combined lift + scale
.hover-opacity-80 - opacity: 0.8 on hover
.hover-shadow-2   - elevation shadow on hover`}
        </CodeBlock>
      </ExampleSection>

      <ExampleSection title="Focus States">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-on-surface-variant mb-2 block">Focus ring example:</label>
            <button className="focus-ring px-4 py-2 bg-primary text-on-primary rounded">
              Tab to focus me
            </button>
          </div>
          
          <div>
            <label className="text-sm text-on-surface-variant mb-2 block">Focus shadow example:</label>
            <button className="focus-shadow px-4 py-2 bg-secondary text-on-secondary rounded">
              Tab to focus me
            </button>
          </div>
        </div>
        
        <CodeBlock>
{`.focus-ring      - 2px solid outline on focus
.focus-ring-inset - inset outline on focus
.focus-shadow    - shadow ring on focus
.focus-visible   - only visible on keyboard focus`}
        </CodeBlock>
      </ExampleSection>

      <ExampleSection title="Active States">
        <div className="space-y-4">
          <button className="active-scale-95 px-4 py-2 bg-primary text-on-primary rounded mr-4">
            Click me (active-scale-95)
          </button>
          <button className="active-opacity-70 px-4 py-2 bg-secondary text-on-secondary rounded">
            Click me (active-opacity-70)
          </button>
        </div>
        
        <CodeBlock>
{`.active-scale-95    - scale(0.95) when pressed
.active-scale-98    - scale(0.98) when pressed
.active-opacity-70  - opacity: 0.7 when pressed`}
        </CodeBlock>
      </ExampleSection>

      <ExampleSection title="Interactive Combinations">
        <div className="space-y-4">
          <div className="interactive-element px-6 py-4 bg-surface-container rounded-lg border border-outline-variant w-fit">
            <span className="text-on-surface">Interactive Element (hover, focus, active)</span>
          </div>
          
          <div className="interactive-card p-6 bg-surface-container rounded-lg border border-outline-variant w-fit">
            <span className="text-on-surface">Interactive Card (hover for lift + shadow)</span>
          </div>
        </div>
        
        <CodeBlock>
{`.interactive-element - complete button-like interactions
.interactive-card    - card with hover lift + shadow`}
        </CodeBlock>
      </ExampleSection>
    </div>
  );

  const renderAnimationsTab = () => (
    <div className="space-y-6">
      <ExampleSection title="Animation Classes">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DemoBox className="" label="animate-fade-in-up">
            <div className="animate-fade-in-up w-16 h-16 bg-primary rounded mx-auto"></div>
            <p className="text-xs text-center mt-2 text-on-surface-variant">Reload page to see effect</p>
          </DemoBox>
          
          <DemoBox className="" label="animate-float">
            <div className="animate-float w-16 h-16 bg-secondary rounded mx-auto"></div>
            <p className="text-xs text-center mt-2 text-on-surface-variant">Infinite floating animation</p>
          </DemoBox>
          
          <DemoBox className="" label="animate-pulse">
            <div className="animate-pulse w-16 h-16 bg-tertiary rounded mx-auto"></div>
            <p className="text-xs text-center mt-2 text-on-surface-variant">Infinite pulse animation</p>
          </DemoBox>
          
          <DemoBox className="" label="animate-bounce">
            <div className="animate-bounce w-16 h-16 bg-error rounded mx-auto"></div>
            <p className="text-xs text-center mt-2 text-on-surface-variant">Bounce animation</p>
          </DemoBox>
        </div>
        
        <CodeBlock>
{`.animate-fade-in-up - fade in from bottom
.animate-float      - gentle floating motion
.animate-pulse      - opacity pulse effect
.animate-bounce     - bounce effect`}
        </CodeBlock>
      </ExampleSection>

      <ExampleSection title="Transition Utilities">
        <div className="space-y-4">
          <div className="space-y-2">
            <button className="transition-fast px-4 py-2 bg-primary text-on-primary rounded hover:bg-primary-container hover:text-on-primary-container">
              Fast Transition
            </button>
            <button className="transition-medium px-4 py-2 bg-secondary text-on-secondary rounded hover:bg-secondary-container hover:text-on-secondary-container ml-4">
              Medium Transition
            </button>
            <button className="transition-slow px-4 py-2 bg-tertiary text-on-tertiary rounded hover:bg-tertiary-container hover:text-on-tertiary-container ml-4">
              Slow Transition
            </button>
          </div>
          
          <div className="space-y-2 mt-4">
            <div className="transition-transform hover-lift-2 w-32 h-16 bg-surface-container rounded border border-outline-variant flex items-center justify-center cursor-pointer">
              Transform Only
            </div>
            <div className="transition-colors px-4 py-2 bg-primary text-on-primary rounded hover:bg-secondary hover:text-on-secondary cursor-pointer w-fit">
              Colors Only
            </div>
          </div>
        </div>
        
        <CodeBlock>
{`.transition-fast      - 200ms all properties
.transition-medium    - 300ms all properties  
.transition-slow      - 500ms all properties
.transition-transform - transform only
.transition-opacity   - opacity only
.transition-colors    - color properties only
.transition-shadow    - shadow only`}
        </CodeBlock>
      </ExampleSection>
    </div>
  );

  const renderStatesTab = () => (
    <div className="space-y-6">
      <ExampleSection title="Disabled States">
        <div className="space-y-4">
          <button className="disabled-opacity px-4 py-2 bg-primary text-on-primary rounded" disabled>
            Disabled with Opacity
          </button>
          <button className="disabled-grayscale px-4 py-2 bg-secondary text-on-secondary rounded ml-4" disabled>
            Disabled with Grayscale
          </button>
        </div>
        
        <CodeBlock>
{`.disabled-opacity   - 50% opacity when disabled
.disabled-grayscale - grayscale + opacity when disabled`}
        </CodeBlock>
      </ExampleSection>

      <ExampleSection title="Display States">
        <div className="space-y-4">
          <div className="block w-full h-8 bg-primary rounded mb-2"></div>
          <div className="inline-block w-16 h-8 bg-secondary rounded mr-2"></div>
          <div className="inline-block w-16 h-8 bg-tertiary rounded"></div>
          <div className="hidden w-16 h-8 bg-error rounded"></div>
        </div>
        
        <CodeBlock>
{`.block        - display: block
.inline-block - display: inline-block
.inline       - display: inline
.hidden       - display: none
.table        - display: table
.table-cell   - display: table-cell`}
        </CodeBlock>
      </ExampleSection>

      <ExampleSection title="Cursor States">
        <div className="space-y-4">
          <div className="cursor-pointer p-2 bg-surface-container rounded border border-outline-variant w-fit">
            cursor-pointer
          </div>
          <div className="cursor-not-allowed p-2 bg-surface-container rounded border border-outline-variant w-fit">
            cursor-not-allowed
          </div>
          <div className="cursor-text p-2 bg-surface-container rounded border border-outline-variant w-fit">
            cursor-text
          </div>
        </div>
        
        <CodeBlock>
{`.cursor-pointer     - pointer cursor
.cursor-default     - default cursor
.cursor-text        - text cursor
.cursor-move        - move cursor
.cursor-not-allowed - not-allowed cursor`}
        </CodeBlock>
      </ExampleSection>
    </div>
  );

  const renderResponsiveTab = () => (
    <div className="space-y-6">
      <ExampleSection title="Responsive Display">
        <div className="space-y-4">
          <div className="mobile-only p-4 bg-primary text-on-primary rounded">
            Visible only on mobile (&lt; 768px)
          </div>
          <div className="tablet-up p-4 bg-secondary text-on-secondary rounded">
            Visible on tablet and up (≥ 768px)
          </div>
          <div className="desktop-up p-4 bg-tertiary text-on-tertiary rounded">
            Visible on desktop and up (≥ 1024px)
          </div>
        </div>
        
        <CodeBlock>
{`.mobile-only  - visible only on mobile (< 768px)
.tablet-only  - visible only on tablet (768px - 1023px)
.tablet-up    - visible on tablet and up (≥ 768px)
.desktop-only - visible only on desktop (≥ 1024px)
.desktop-up   - visible on desktop and up (≥ 1024px)`}
        </CodeBlock>
      </ExampleSection>

      <ExampleSection title="Responsive Grid">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="h-16 bg-primary rounded flex items-center justify-center text-on-primary">1</div>
          <div className="h-16 bg-secondary rounded flex items-center justify-center text-on-secondary">2</div>
          <div className="h-16 bg-tertiary rounded flex items-center justify-center text-on-tertiary">3</div>
        </div>
        <p className="text-sm text-on-surface-variant mt-2">
          1 column on mobile, 2 on tablet, 3 on desktop
        </p>
        
        <CodeBlock>
{`<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Responsive grid that adapts to screen size -->
</div>`}
        </CodeBlock>
      </ExampleSection>
    </div>
  );

  const renderAccessibilityTab = () => (
    <div className="space-y-6">
      <ExampleSection title="Screen Reader Support">
        <div className="space-y-4">
          <div className="relative">
            <span className="sr-only">This text is only visible to screen readers</span>
            <div className="p-4 bg-surface-container rounded border border-outline-variant">
              Visible content with hidden description
            </div>
          </div>
        </div>
        
        <CodeBlock>
{`.sr-only - visually hidden but available to screen readers`}
        </CodeBlock>
      </ExampleSection>

      <ExampleSection title="Focus Management">
        <div className="space-y-4">
          <button className="focus-visible px-4 py-2 bg-primary text-on-primary rounded">
            Focus visible only on keyboard navigation
          </button>
          <p className="text-sm text-on-surface-variant">
            Use Tab key to see focus ring (mouse clicks won't show it)
          </p>
        </div>
        
        <CodeBlock>
{`.focus-visible - focus styles only for keyboard navigation`}
        </CodeBlock>
      </ExampleSection>

      <ExampleSection title="Reduced Motion Support">
        <div className="space-y-4">
          <div className="animate-pulse motion-reduce w-16 h-16 bg-primary rounded mx-auto"></div>
          <p className="text-sm text-on-surface-variant text-center">
            Animation respects user's motion preferences
          </p>
        </div>
        
        <CodeBlock>
{`.motion-reduce - reduces animations when user prefers reduced motion

/* Automatic reduced motion support */
@media (prefers-reduced-motion: reduce) {
  /* All animations become instant */
}`}
        </CodeBlock>
      </ExampleSection>

      <ExampleSection title="Print Utilities">
        <div className="space-y-4">
          <div className="print-hidden p-4 bg-primary text-on-primary rounded">
            Hidden when printing
          </div>
          <div className="p-4 bg-secondary text-on-secondary rounded">
            Visible when printing
          </div>
        </div>
        
        <CodeBlock>
{`.print-hidden - hidden in print media
.print-block  - block display in print media
.print-inline - inline display in print media`}
        </CodeBlock>
      </ExampleSection>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'layout': return renderLayoutTab();
      case 'transforms': return renderTransformsTab();
      case 'interactions': return renderInteractionsTab();
      case 'animations': return renderAnimationsTab();
      case 'states': return renderStatesTab();
      case 'responsive': return renderResponsiveTab();
      case 'accessibility': return renderAccessibilityTab();
      default: return renderLayoutTab();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface mb-4">Utility System Documentation</h1>
        <p className="text-lg text-on-surface-variant max-w-3xl">
          Comprehensive documentation for our consolidated utility class system. 
          These utilities provide consistent, reusable patterns for layout, styling, 
          and interactions while maintaining all existing functionality.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-outline-variant mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-screen">
        {renderTabContent()}
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-outline-variant">
        <p className="text-sm text-on-surface-variant">
          These utilities follow CODE_EXPANSION principles, preserving all existing functionality 
          while providing standardized, reusable patterns. All utilities are built using our 
          centralized design tokens for consistency.
        </p>
      </div>
    </div>
  );
};

export default StyleguideUtilities;
