import { HeroSection } from '@/components/sections/hero-section';
import { VozPosSection } from '@/components/sections/voz-pos-section';
import { ViewPosSection } from '@/components/sections/view-pos-section';
import { DigiPosSection } from '@/components/sections/digi-pos-section';
import { AIAssistantSection } from '@/components/sections/ai-assistant-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { PricingSection } from '@/components/sections/pricing-section';
import { AccountingTestimonialsSection } from '@/components/sections/accounting-testimonials-section';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <HeroSection />
      <VozPosSection />
      <ViewPosSection />
      <DigiPosSection />
      <AIAssistantSection />
      <TestimonialsSection />
      <PricingSection />
      <AccountingTestimonialsSection />
    </main>
  );
}