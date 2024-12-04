import { HeroSection } from '@/components/sections/hero';
import { FeaturesSection } from '@/components/sections/features';
import { PricingSection } from '@/components/sections/pricing';
import { TestimonialsSection } from '@/components/sections/testimonials';
import { NewsletterSection } from '@/components/sections/newsletter';
import { DemoSection } from '@/components/sections/demo';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <PricingSection />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  );
}