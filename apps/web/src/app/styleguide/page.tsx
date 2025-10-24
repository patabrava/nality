import StyleguideLayout from '@/components/styleguide/StyleguideLayout'
import OverviewSection from '@/components/styleguide/sections/OverviewSection'
import StyleguideTokens from '@/components/styleguide/StyleguideTokens'
import StyleguideUtilities from '@/components/styleguide/StyleguideUtilities'
import ColorsSection from '@/components/styleguide/sections/ColorsSection'
import ThemeSection from '@/components/styleguide/sections/ThemeSection'
import TypographySection from '@/components/styleguide/sections/TypographySection'
import SpacingSection from '@/components/styleguide/sections/SpacingSection'
import ComponentsSection from '@/components/styleguide/sections/ComponentsSection'
import FormsSection from '@/components/styleguide/sections/FormsSection'
import NavigationSection from '@/components/styleguide/sections/NavigationSection'
import LayoutSection from '@/components/styleguide/sections/LayoutSection'
import AnimationsSection from '@/components/styleguide/sections/AnimationsSection'
import AccessibilitySection from '@/components/styleguide/sections/AccessibilitySection'

export const metadata = {
  title: 'Nality Design System',
  description: 'Complete design system documentation and component library for Nality',
  robots: { index: false, follow: false } // Keep internal
}

export default function StyleguidePage() {
  return (
    <StyleguideLayout>
      <div id="overview">
        <OverviewSection />
      </div>
      
      <div id="tokens">
        <StyleguideTokens />
      </div>
      
      <div id="utilities">
        <StyleguideUtilities />
      </div>
      
      <div id="colors">
        <ColorsSection />
      </div>
      
      <div id="themes">
        <ThemeSection />
      </div>
      
      <div id="typography">
        <TypographySection />
      </div>
      
      <div id="spacing">
        <SpacingSection />
      </div>
      
      <div id="components">
        <ComponentsSection />
      </div>
      
      <div id="forms">
        <FormsSection />
      </div>
      
      <div id="navigation">
        <NavigationSection />
      </div>
      
      <div id="layout">
        <LayoutSection />
      </div>
      
      <div id="animations">
        <AnimationsSection />
      </div>
      
      <div id="accessibility">
        <AccessibilitySection />
      </div>
    </StyleguideLayout>
  )
}
