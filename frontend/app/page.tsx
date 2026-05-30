import SmoothScroll from '@/components/layout/smooth-scroll';
import Navbar from '@/components/landing/navbar';
import Hero from '@/components/landing/hero';
import StatsSection from '@/components/landing/stats-section';
import TrustBar from '@/components/landing/trust-bar';
import FeaturesGrid from '@/components/landing/features-grid';
import Testimonials from '@/components/landing/testimonials';
import Pricing from '@/components/landing/pricing';
import FAQ from '@/components/landing/faq';
import CTASection from '@/components/landing/cta-section';
import Footer from '@/components/landing/footer';

export default function HomePage() {
  return (
    <SmoothScroll>
      <Navbar />
      <Hero />
      <StatsSection />
      <TrustBar />
      <FeaturesGrid />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </SmoothScroll>
  );
}
