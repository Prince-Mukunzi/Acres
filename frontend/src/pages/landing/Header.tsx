import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Plus, Menu, X } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { isAuthenticated, user } = useAuth();
  const [activeItem, setActiveItem] = useState("Index");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const navItems = ["Features", "Pricing", "FAQ"];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-6 z-50 w-full px-4 md:px-6 flex flex-col items-center pointer-events-none">
      <div className="relative pointer-events-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: hidden ? -100 : 0, opacity: hidden ? 0 : 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex items-center gap-2 md:gap-4 lg:gap-6 rounded-full bg-off-white/40 p-2 md:p-3 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-xl border border-white/60"
        >
          <Link
            to="/"
            onClick={() => setActiveItem("")}
            className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-acres-blue text-off-white shrink-0 z-20 relative"
          >
            <img
              src="/acres_light.svg"
              alt="Acres Logo"
              className="w-4 h-4 md:w-6 md:h-6"
            />
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center font-syne text-[0.95rem] font-medium text-charcoal-black gap-1 px-1"
            onMouseLeave={() => setHoveredItem(null)}
          >
            {navItems.map((item) => {
              const active = hoveredItem
                ? hoveredItem === item
                : activeItem === item;

              return (
                <a
                  key={item}
                  href={item === "Index" ? "/" : `/#${item.toLowerCase()}`}
                  onClick={() => setActiveItem(item)}
                  onMouseEnter={() => setHoveredItem(item)}
                  className={`group relative flex items-center gap-1.5 px-5 py-2.5 rounded-full transition-colors ${
                    active ? "text-charcoal-black" : "text-charcoal-black/70"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="header-magic-pill"
                      className="absolute inset-0 bg-off-white rounded-full shadow-sm"
                      transition={{
                        type: "spring",
                        bounce: 0.15,
                        duration: 0.5,
                      }}
                    />
                  )}

                  <span className="relative z-10">{item}</span>

                  <span
                    className={`relative z-10 transition-transform duration-300 group-hover:rotate-360 ${
                      active
                        ? "text-charcoal-black/40"
                        : "text-charcoal-black/20"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </span>
                </a>
              );
            })}
          </nav>

          <Link
            to={
              isAuthenticated
                ? user?.isAdmin
                  ? "/admin"
                  : "/dashboard"
                : "/login"
            }
            className="flex group items-center gap-1.5 px-5 py-2.5 md:py-3 rounded-full bg-acres-blue text-off-white font-syne text-[0.95rem] font-medium hover:bg-acres-blue/90 transition-colors shadow-[0_4px_14px_rgba(93,162,255,0.4)] shrink-0 ml-auto md:ml-2"
          >
            {isAuthenticated ? "Dashboard" : "Login"}
            <ArrowUpRight className="w-4 h-4 group-hover:rotate-360 transition-transform duration-300" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-charcoal-black/5 text-charcoal-black hover:bg-charcoal-black/10 transition-colors ml-1"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </motion.div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-4 rounded-3xl bg-off-white/40 p-3 shadow-lg backdrop-blur-xl border border-white/60 overflow-hidden md:hidden pointer-events-auto"
            >
              <nav className="flex flex-col gap-2 font-syne font-medium">
                {navItems.map((item) => {
                  const active = activeItem === item;
                  return (
                    <a
                      key={item}
                      href={item === "Index" ? "/" : `/#${item.toLowerCase()}`}
                      onClick={() => {
                        setActiveItem(item);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center justify-between px-5 py-3 rounded-2xl transition-colors ${
                        active
                          ? "bg-off-white text-charcoal-black shadow-sm"
                          : "text-charcoal-black/70 hover:bg-white/50"
                      }`}
                    >
                      <span className="text-base">{item}</span>
                      <Plus
                        className={`w-4 h-4 ${active ? "text-charcoal-black/40 rotate-180" : "text-charcoal-black/20"}`}
                      />
                    </a>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
