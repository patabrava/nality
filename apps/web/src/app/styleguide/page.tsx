import StyleguideLayout from '@/components/styleguide/StyleguideLayout'
import OverviewSection from '@/components/styleguide/sections/OverviewSection'
import ColorsSection from '@/components/styleguide/sections/ColorsSection'
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
      <OverviewSection />
      <ColorsSection />
      <TypographySection />
      <SpacingSection />
      <ComponentsSection />
      <FormsSection />
      <NavigationSection />
      <LayoutSection />
      <AnimationsSection />
      <AccessibilitySection />
    </StyleguideLayout>
  )
}
