import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-charcoal-black text-off-white pt-32 pb-8 overflow-hidden min-h-125 flex flex-col justify-end">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-100 bg-acres-blue opacity-10 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-6xl px-6 w-full relative z-10 flex-1 flex flex-col">
        <div className="flex flex-col items-center justify-center text-center gap-8 mb-auto mt-10">
          <p className="font-syne text-xl text-off-white/50 mb-4 font-light">
            You scrolled enough
          </p>
          <Link
            to="/login"
            className="px-10 py-4 text-lg group bg-off-white text-charcoal-black rounded-full flex items-center font-syne font-medium hover:bg-gray-100 transition-colors shadow-2xl"
          >
            Start 30 days Free Trial
            <ArrowRight className="ml-3 h-5 w-5 -rotate-45 group-hover:rotate-315 transition-all duration-200" />
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-12 pt-24 pb-10">
          <div className="flex items-center gap-3">
            <p className="font-syne text-off-white/50 mb-4 font-light">
              &copy; {new Date().getFullYear()} Acres. All rights reserved.
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-8 md:gap-12 font-syne text-[0.95rem] text-off-white/50 font-medium">
            <div className="flex flex-col gap-5">
              <span className="text-off-white hover:text-off-white transition-colors">
                Quick Links
              </span>
              <a
                href="#pricing"
                className="hover:text-off-white transition-colors"
              >
                Pricing
              </a>
              <a
                href="#features"
                className="hover:text-off-white transition-colors"
              >
                Features
              </a>
            </div>
            <div className="flex flex-col gap-5">
              <span className="text-off-white hover:text-off-white transition-colors">
                Legal
              </span>
              <a href="#" className="hover:text-off-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-off-white transition-colors">
                Terms of Service
              </a>
            </div>
            <div className="flex flex-col gap-5">
              <span className="text-off-white hover:text-off-white transition-colors">
                Social
              </span>
              <a href="#" className="hover:text-off-white transition-colors">
                Instagram
              </a>
              <a href="#" className="hover:text-off-white transition-colors">
                Linkedin
              </a>
            </div>
            <div className="flex flex-col gap-5">
              <span className="text-off-white hover:text-off-white transition-colors">
                Contact
              </span>
              <a
                href="mailto:princemukunzi11@gmail.com"
                className="hover:text-off-white transition-colors"
              >
                E-mail
              </a>
              <a
                href="tel:+250793919844"
                className="hover:text-off-white transition-colors"
              >
                (+250) 793 919 844
              </a>
            </div>
          </div>
        </div>

        <div className="w-full mt-24 pb-8 flex justify-center pointer-events-none select-none">
          <h1
            className="font-bricolage text-[28vw] md:text-[25vw] font-bold leading-[0.8] tracking-tighter text-off-white text-center w-full z-10"
            style={{
              WebkitBoxReflect:
                "below -0.1em linear-gradient(to bottom, transparent 40%, rgba(255,255,255,0.4))",
            }}
          >
            Acres
          </h1>
        </div>
      </div>
    </footer>
  );
}
