import { useState } from "react";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function Pricing() {
  const [units, setUnits] = useState(1);
  const [isYearly, setIsYearly] = useState(false);

  let monthlyPrice = 0;
  if (units <= 3) {
    monthlyPrice = 0;
  } else if (units <= 9) {
    monthlyPrice = 10000;
  } else if (units <= 20) {
    monthlyPrice = 20000;
  }

  const isCustom = units > 20;
  const currentTotal = isCustom
    ? "Custom"
    : (monthlyPrice * (isYearly ? 0.8 : 1)).toLocaleString();

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
        <div className="landing-glass-panel bg-white/40 flex items-center rounded-full p-2 relative shadow-inner">
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
        className="mx-auto w-full"
      >
        <motion.div
          variants={itemVariants}
          className="landing-glass-panel bg-white/40 overflow-hidden rounded-3xl border border-white/80 flex flex-col md:flex-row shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          {/* Left Column: Context & Slider */}
          <div className="flex flex-1 flex-col justify-between p-8 md:p-12 md:w-1/2">
            <div>
              <h3 className="font-bricolage text-2xl font-medium md:text-3xl text-charcoal-black">
                Pay as you grow
              </h3>
              <p className="mt-3 font-syne text-[0.95rem] text-charcoal-black/60 leading-relaxed">
                We believe in simple, transparent pricing. You get access to the
                entire platform—you only pay for the units you actively manage.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-white/60 rounded-2xl p-4 lg:p-5 border border-black/5 shadow-sm">
                  <div className="text-2xl font-bricolage font-bold text-charcoal-black mb-1">
                    0%
                  </div>
                  <div className="text-[0.65rem] font-syne font-bold text-charcoal-black/50 uppercase tracking-widest">
                    Setup fees
                  </div>
                </div>
                <div className="bg-white/60 rounded-2xl p-4 lg:p-5 border border-black/5 shadow-sm">
                  <div className="text-2xl font-bricolage font-bold text-charcoal-black mb-1">
                    24/7
                  </div>
                  <div className="text-[0.65rem] font-syne font-bold text-charcoal-black/50 uppercase tracking-widest">
                    Support
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-charcoal-black/10">
              <div className="mb-6 flex items-end justify-between font-syne">
                <span className="text-sm font-medium text-charcoal-black/70 uppercase tracking-wider">
                  Number of units
                </span>
                <span className="font-bricolage text-5xl font-bold text-charcoal-black">
                  {units}
                </span>
              </div>

              <div className="w-full">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={units}
                  onChange={(e) => setUnits(parseInt(e.target.value))}
                  className="landing-slider w-full cursor-pointer"
                  style={{ "--value": ((units - 1) / 29) * 100 } as React.CSSProperties}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Price & Features */}
          <div className="flex flex-1 flex-col bg-white/50 p-8 md:p-12 md:w-1/2 md:border-l border-t md:border-t-0 border-charcoal-black/10">
            <h3 className="mb-6 font-syne font-semibold tracking-wider text-sm text-acres-blue uppercase">
              Estimated Cost
            </h3>

            <div className="mb-8 flex items-baseline">
              <div className="relative overflow-visible h-16 min-w-[150px]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentTotal}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute font-bricolage text-5xl lg:text-6xl font-bold tracking-tight text-charcoal-black flex items-end gap-2"
                  >
                    {isCustom ? (
                      <span className="text-4xl lg:text-5xl mb-1">Custom</span>
                    ) : (
                      <>
                        {currentTotal}
                        <span className="text-xl font-syne font-medium text-charcoal-black/50 mb-2">
                          RWF
                        </span>
                      </>
                    )}
                  </motion.span>
                </AnimatePresence>
              </div>
              {!isCustom && (
                <span className="ml-[130px] font-syne text-sm text-charcoal-black/50 whitespace-nowrap">
                  / mo {isYearly && <br />} {isYearly && "(billed annually)"}
                </span>
              )}
            </div>

            <div className="mb-8 h-px w-full bg-charcoal-black/10" />

            <h4 className="mb-5 font-syne text-sm font-semibold tracking-widest text-charcoal-black/60 uppercase">
              Core features included
            </h4>
            <ul className="space-y-4 font-syne text-[0.95rem] text-charcoal-black/80 flex-1">
              {(units <= 3
                ? ["Up to 3 units", "Basic Tenant logging", "Manual invoicing"]
                : units <= 9
                  ? [
                      "Up to 9 units",
                      "Unlimited Tenant logging",
                      "Automated invoicing",
                      "Basic reports",
                    ]
                  : units <= 20
                    ? [
                        "Up to 20 units",
                        "Unlimited Tenant logging",
                        "Automated invoicing",
                        "Advanced accounting reports",
                        "Priority support",
                      ]
                    : [
                        "Unlimited everything",
                        "Custom integrations",
                        "24/7 dedicated support",
                        "SLA guarantee",
                      ]
              ).map((feature, i) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-acres-blue/10 text-acres-blue">
                    <Check className="h-3.5 w-3.5 stroke-3" />
                  </div>
                  {feature}
                </motion.li>
              ))}
            </ul>

            <div className="mt-10">
              <Link
                to={
                  isCustom
                    ? "/contact"
                    : `/checkout?plan=${encodeURIComponent(units <= 3 ? "Free Tier" : units <= 9 ? "Starter Tier" : "Growth Tier")}${isYearly ? " (Yearly)" : ""}&cost=${isYearly ? monthlyPrice * 12 : monthlyPrice}&discount=${isYearly ? monthlyPrice * 12 * 0.2 : 0}`
                }
                className="block w-full text-center bg-acres-blue text-white hover:bg-acres-blue/90 font-bricolage py-4 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                {isCustom
                  ? "Contact Enterprise Sales"
                  : units <= 3
                    ? "Get Started for Free"
                    : "Select Plan"}
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
