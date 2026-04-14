import { useRef, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";

export default function StaticLandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bgRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  // Re-use the exact same landing page wrapper structure over the footer to preserve aesthetics
  return (
    <div className="landing-page min-h-screen text-foreground selection:bg-acres-blue/30 relative w-full overflow-x-hidden">
      {/* Background Aura */}
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

      {/* Sticky Bottom Footer */}
      <div className="fixed bottom-0 left-0 w-full z-0 bg-charcoal-black">
        <Footer />
      </div>

      {/* Main Foreground Container (Slides over the footer) */}
      <div className="relative z-10 bg-off-white shadow-[0_40px_80px_rgba(0,0,0,0.2)] rounded-b-4xl md:rounded-b-4xl px-0 pb-16 min-h-screen flex flex-col pt-32 lg:pt-40">
        <Header />
        
        {/* Child Pages get injected here */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-6">
           {children}
        </main>
      </div>

      {/* Invisible footer placeholder that gives the page enough scrollable height to see the real footer underneath */}
      <div
        className="opacity-0 pointer-events-none w-full relative z-0"
        aria-hidden="true"
      >
        <Footer />
      </div>
    </div>
  );
}
