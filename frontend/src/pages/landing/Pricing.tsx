import { useState } from "react";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Pricing() {
  const [units, setUnits] = useState(50);
  const [isYearly, setIsYearly] = useState(false);

  // Base price per unit per month is $1
  const pricePerUnit = isYearly ? 0.8 : 1;
  const currentTotal = Math.round(units * pricePerUnit);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="mb-12 flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end"
      >
        <div>
          <span className="font-syne text-xs tracking-widest text-charcoal-black/40 uppercase">
            What it costs
          </span>
          <h2 className="mt-2 font-bricolage text-3xl font-bold text-charcoal-black md:text-5xl">
            Pricing
          </h2>
        </div>
        <div className="landing-glass-panel bg-white/40 flex items-center rounded-full backdrop-blur-sm p-2 relative shadow-inner">
          <button
            onClick={() => setIsYearly(false)}
            className={`relative z-10 px-5 py-2 font-syne text-sm font-semibold transition-colors ${
              !isYearly
                ? "text-charcoal-black"
                : "text-charcoal-black/60 hover:text-charcoal-black"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`relative z-10 flex items-center px-5 py-2 font-syne text-sm font-semibold transition-colors ${
              isYearly
                ? "text-charcoal-black"
                : "text-charcoal-black/60 hover:text-charcoal-black"
            }`}
          >
            Yearly
            <span
              className={`ml-2 rounded-full px-2 py-1 text-[0.65rem] uppercase tracking-wider transition-colors ${
                isYearly
                  ? "bg-acres-blue/20 text-acres-blue"
                  : "bg-acres-blue/10 text-acres-blue"
              }`}
            >
              Save 20%
            </span>
          </button>

          <div
            className="absolute top-1 bottom-1 w-25 left-1 bg-off-white rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              transform: isYearly ? "translateX(100px)" : "translateX(0)",
              width: isYearly ? "170px" : "100px",
            }}
          />
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 gap-8 md:grid-cols-2"
      >
        <motion.div
          variants={itemVariants}
          className="landing-glass-panel bg-white/40 flex flex-col justify-between rounded-2xl p-8 md:p-12"
        >
          <div>
            <h3 className="font-bricolage text-2xl font-medium md:text-3xl text-charcoal-black">
              Pay as you grow
            </h3>
            <p className="mt-3 font-syne text-[0.95rem] text-charcoal-black/60 leading-relaxed">
              We believe in simple, transparent pricing. You get access to the
              entire platform—you only pay for the units you actively manage.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-off-white/60 backdrop-blur-sm rounded-2xl p-4 lg:p-5 border border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="text-2xl font-bricolage font-bold text-charcoal-black mb-1">
                  0%
                </div>
                <div className="text-[0.65rem] font-syne font-bold text-charcoal-black/40 uppercase tracking-widest">
                  Setup fees
                </div>
              </div>
              <div className="bg-off-white/60 backdrop-blur-sm rounded-2xl p-4 lg:p-5 border border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="text-2xl font-bricolage font-bold text-charcoal-black mb-1">
                  24/7
                </div>
                <div className="text-[0.65rem] font-syne font-bold text-charcoal-black/40 uppercase tracking-widest">
                  Support
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div className="mb-4 flex items-end justify-between font-syne">
              <span className="text-sm text-charcoal-black/70">
                Number of units
              </span>
              <span className="font-bricolage text-5xl text-charcoal-black">
                {units}
              </span>
            </div>

            <div className="w-full">
              <input
                type="range"
                min="10"
                max="500"
                value={units}
                onChange={(e) => setUnits(parseInt(e.target.value))}
                className="landing-slider w-full cursor-pointer"
                style={{ "--value": units } as React.CSSProperties}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="landing-glass-panel bg-white/40 flex flex-col rounded-2xl p-8 md:p-12 border border-white/80"
        >
          <h3 className="mb-6 font-bricolage font-medium text-xl text-charcoal-black">
            Estimated Cost
          </h3>

          <div className="mb-8 flex items-baseline">
            <div className="relative overflow-visible h-18 min-w-[130px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentTotal}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute font-bricolage text-6xl font-bold tracking-tight text-charcoal-black"
                >
                  ${currentTotal}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="ml-2 font-syne text-charcoal-black/50 whitespace-nowrap">
              / mo {isYearly && " (billed annually)"}
            </span>
          </div>

          <div className="mb-8 h-px w-full bg-charcoal-black/5" />

          <h4 className="mb-4 font-syne text-sm tracking-wide text-acres-blue uppercase">
            Core features
          </h4>
          <ul className="space-y-4 font-syne text-[0.95rem] text-charcoal-black/80">
            {[
              "1000+ API calls",
              "Unlimited Tenant logging",
              "Tenant invoicing",
              "Accounting reports",
            ].map((feature, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-acres-blue/10 text-acres-blue">
                  <Check className="h-3.5 w-3.5 stroke-3" />
                </div>
                {feature}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </section>
  );
}
