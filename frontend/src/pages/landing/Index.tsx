import { useRef } from "react";
import Header from "./Header";
import Hero from "./Hero";
import Partners from "./Partners";
import Features from "./Features";
import Pricing from "./Pricing";
import FAQ from "./FAQ";
import Footer from "./Footer";

export default function LandingPage() {
  const bgRef = useRef<HTMLDivElement>(null);

  return (
    <div className="landing-page min-h-screen text-foreground selection:bg-acres-blue/30 relative w-full overflow-x-hidden">
      <div
        ref={bgRef}
        className="fixed inset-0 w-full h-full -z-20 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(
              42rem 42rem at var(--pointer-x, 50%) var(--pointer-y, 20%),
              rgba(93, 162, 255, 0.16),
              transparent 62%
            ),
            linear-gradient(180deg, #f7f7f8 0%, #f3f4f7 100%)
          `,
        }}
      />

      <div className="fixed bottom-0 left-0 w-full z-0 bg-charcoal-black">
        <Footer />
      </div>

      <div className="relative z-10 bg-off-white shadow-[0_40px_80px_rgba(0,0,0,0.2)] rounded-b-4xl md:rounded-b-4xl px-0 pb-16 overflow-hidden">
        <Header />

        <Hero />

        <Partners />
        <div className="py-12 md:py-24">
          <Features />
        </div>
        <Pricing />
        <FAQ />
      </div>
      <div
        className="opacity-0 pointer-events-none w-full relative z-0"
        aria-hidden="true"
      >
        <Footer />
      </div>
    </div>
  );
}
