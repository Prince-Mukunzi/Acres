import { ArrowUpRight } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax effect for the background image
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroWidth = useTransform(scrollYProgress, (val) => {
    // Accelerate the scroll effect over the first 30% of scroll
    const p = Math.min(val / 0.3, 1);
    return `min(100%, calc(100% - (100% - 1280px) * ${p}))`;
  });

  return (
    <section
      ref={containerRef}
      className="relative mx-auto px-4 py-4 md:px-6 flex flex-col items-center"
    >
      <motion.div
        style={{ maxWidth: heroWidth, width: "100%" }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden bg-off-white shadow-sm flex items-center justify-center min-h-125 xl:min-h-150 2xl:min-h-200 w-full max-w-[100vw] xl:max-w-7xl rounded-2xl"
      >
        <motion.img
          style={{ y }}
          src="/landmark_1.png"
          alt="Acres Dashboard Mockup"
          className="absolute inset-0 h-[130%] w-full object-cover object-center origin-top transform-gpu will-change-transform backface-hidden"
        />

        <div className="absolute inset-0 bg-linear-to-t from-charcoal-black/80 via-charcoal-black/40 to-transparent flex flex-col justify-end p-6 md:p-16 pb-12 md:pb-20">
          <div className="max-w-5xl">
            <h1 className="font-bricolage font-medium tracking-tight text-off-white flex flex-col select-none">
              {/* TOP ROW */}
              <div className="flex items-center gap-4 md:gap-8 overflow-hidden pb-4">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[4vw] lg:text-[3rem] leading-[0.85]"
                >
                  Acres
                </motion.span>

                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{
                    duration: 1,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.3,
                  }}
                  className="h-0.5 md:h-.75 w-[20vw] md:w-64 bg-off-white rounded-full origin-left"
                />
              </div>

              {/* MAIN HEADING */}
              <div className="flex flex-col leading-[0.85]">
                <div className="overflow-hidden pb-2">
                  <motion.span
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.1,
                    }}
                    className="inline-block text-[12vw] md:text-[10vw] lg:text-[6rem] 2xl:text-[8rem] leading-[0.85]"
                  >
                    Automate your
                  </motion.span>
                </div>

                <div className="overflow-hidden pb-4">
                  <motion.span
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.2,
                    }}
                    className="inline-block text-[12vw] md:text-[10vw] lg:text-[6rem] 2xl:text-[8rem] leading-[0.85]"
                  >
                    properties
                  </motion.span>
                </div>
              </div>

              {/* PARAGRAPH (FULL WIDTH UNDER) */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
                className="font-syne text-[1.1rem] md:text-[1.4rem] xl:text-[1.5rem] text-off-white/95 font-normal leading-[1.4] max-w-[700px]"
              >
                The all-in-one platform for commercial, residential, and private
                landlords to run their real estate business. Simple, fast, and
                built to scale.
              </motion.p>
            </h1>
          </div>
        </div>
      </motion.div>

      <motion.div
        style={{ maxWidth: heroWidth, width: "100%" }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 md:mt-16 flex flex-col md:flex-row justify-between items-start md:items-start gap-8 w-full max-w-[100vw] xl:max-w-7xl px-4 md:px-0"
      >
        <div className="flex flex-col gap-5 max-w-xl">
          <h2 className="font-bricolage text-4xl md:text-5xl lg:text-[3.5rem] font-medium tracking-tight text-charcoal-black leading-[1.1]">
            Manage <i className="text-charcoal-black/40">Properties</i> without
            friction
          </h2>
          <p className="font-syne text-[0.95rem] md:text-[1.1rem] text-charcoal-black/50 max-w-80 md:max-w-100 mt-2 md:mt-6 leading-relaxed">
            Streamline your entire portfolio with intelligent automation,
            real-time insights, and tools that scale with your business.
          </p>
        </div>
        <Link
          to="/login"
          className="flex group items-center gap-1.5 px-5 py-2.5 md:py-3 rounded-full bg-acres-blue text-off-white font-syne text-[0.95rem] font-medium hover:bg-acres-blue/90 transition-colors shadow-[0_4px_14px_rgba(93,162,255,0.4)] shrink-0 ml-auto md:ml-2"
        >
          Start 30-Day Free Trial
          <ArrowUpRight className="w-4 h-4 group-hover:rotate-360 transition-transform duration-300" />
        </Link>

        {/* <button
          onClick={() => setIsDemoOpen(true)}
          className="landing-cta-button flex items-center rounded-full bg-acres-blue text-off-white px-6 md:px-8 py-3 md:py-4 text-[0.95rem] md:text-[1.05rem] whitespace-nowrap shadow-[0_8px_20px_rgba(93,162,255,0.3)] hover:shadow-[0_12px_25px_rgba(93,162,255,0.4)] transition-shadow cursor-pointer"
        >
          Watch Demo            <Play className="ml-3 h-5 w-5" />

        </button> */}
      </motion.div>

      {/* Demo Video Overlay Modal */}
      {/* <AnimatePresence>
        {isDemoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8"
          > */}
      {/* Backdrop with heavy blur */}
      {/* <motion.div
              initial={{
                backdropFilter: "blur(0px)",
                backgroundColor: "rgba(0,0,0,0)",
              }}
              animate={{
                backdropFilter: "blur(24px)",
                backgroundColor: "rgba(0,0,0,0.7)",
              }}
              exit={{
                backdropFilter: "blur(0px)",
                backgroundColor: "rgba(0,0,0,0)",
              }}
              onClick={() => setIsDemoOpen(false)}
              className="absolute inset-0 cursor-pointer"
            /> */}

      {/* Modal Content */}
      {/* <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full aspect-video rounded-2xl overflow-hidden landing-glass-panel border border-white/10 shadow-2xl z-10"
            >
              <button
                onClick={() => setIsDemoOpen(false)}
                className="absolute cursor-pointer top-4 right-4 z-20 w-10 h-10 rounded-full bg-off-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-off-white hover:bg-off-white/20 transition-colors shadow-lg group"
              >
                <X className="w-5 h-5 group-hover:rotate-360 transition-transform duration-300" />
              </button>

              <div className="w-full h-full bg-charcoal-black/20 flex items-center justify-center">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="Acres Demo Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence> */}
    </section>
  );
}
