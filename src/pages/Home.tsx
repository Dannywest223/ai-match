import { Hero } from "../components/Hero";
import { TrustSignals } from "../components/TrustSignals";
import { StatsBar } from "../components/StatsBar";
import { HowItWorks } from "../components/HowItWorks";
import { Testimonials } from "../components/Testimonials";
import { TrustedBy } from "../components/TrustedBy";
import { CtaSection } from "../components/CtaSection";

export function Home() {
  return (
    <main>
      <Hero />
      <TrustSignals />
      <StatsBar />
      <HowItWorks />
      <Testimonials />
      <TrustedBy />
      <CtaSection />
    </main>
  );
}