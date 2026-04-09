import { motion } from "framer-motion";
import {
  AnalyticsDemo,
  TicketDemo,
  TenantsDemo,
  CommunicationsDemo,
} from "./FeatureDemos";

export default function Features() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <section
      id="features"
      className="relative mx-auto max-w-7xl px-4 md:px-6 z-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <span className="font-syne text-xs tracking-widest text-charcoal-black/40 uppercase">
          Sneak Peek
        </span>
        <h2 className="mt-2 font-bricolage text-4xl font-bold text-charcoal-black md:text-5xl">
          Core Features
        </h2>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        {/* Analytics Overview - 8 col */}
        <motion.div
          variants={item}
          className="landing-glass-panel bg-white/40 md:col-span-8 rounded-2xl p-6 md:p-8 flex flex-col xl:flex-row gap-6 shadow-sm border border-white/60"
        >
          <div className="flex flex-col gap-2 xl:w-1/3">
            <div className="inline-flex items-center rounded-md bg-acres-blue/10 border border-acres-blue/20 px-4 py-1.5 mb-4 w-fit">
              <span className="font-syne text-[0.65rem] font-bold text-acres-blue uppercase tracking-wider">
                Analytics
              </span>
            </div>
            <h3 className="font-bricolage text-2xl font-semibold text-charcoal-black">
              Portfolio Overview
            </h3>
            <p className="font-syne text-sm text-charcoal-black/50 leading-relaxed mt-1">
              Gain instant visibility into your entire operation. Track unit
              occupancy, rent collections, and overdue accounts in real-time.
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center -m-4 md:m-0">
            <AnalyticsDemo />
          </div>
        </motion.div>

        {/* Smart Ticketing - 4 col */}
        <motion.div
          variants={item}
          className="landing-glass-panel bg-white/40 md:col-span-4 rounded-2xl p-6 md:p-8 flex flex-col shadow-sm border border-white/60"
        >
          <div className="flex flex-col gap-2 mb-6">
            <div className="inline-flex items-center rounded-md bg-acres-blue/10 border border-acres-blue/20 px-4 py-1.5 w-fit">
              <span className="font-syne text-[0.65rem] text-acres-blue uppercase tracking-wider">
                Maintenance
              </span>
            </div>
            <h3 className="font-bricolage text-2xl font-semibold text-charcoal-black">
              Smart Ticketing
            </h3>
            <p className="font-syne text-sm text-charcoal-black/50 mt-1">
              Resolve issues faster with centralized maintenance requests.
            </p>
          </div>
          <div className="w-full flex-1 flex items-end justify-center -mx-4 -mb-4">
            <TicketDemo />
          </div>
        </motion.div>

        {/* Communications - 4 col */}
        <motion.div
          variants={item}
          className="landing-glass-panel bg-white/40 md:col-span-4 rounded-2xl p-6 md:p-8 flex flex-col shadow-sm border border-white/60"
        >
          <div className="flex flex-col gap-2 mb-6">
            <div className="inline-flex items-center rounded-md bg-acres-blue/10 border border-acres-blue/20 px-4 py-1.5 w-fit">
              <span className="font-syne text-[0.65rem] text-acres-blue uppercase tracking-wider">
                Broadcasts
              </span>
            </div>
            <h3 className="font-bricolage text-2xl font-semibold text-charcoal-black">
              Communications
            </h3>
            <p className="font-syne text-sm text-charcoal-black/50 mt-1">
              Instantly reach all tenants with bulk email or SMS announcements.
            </p>
          </div>
          <div className="w-full flex-1 flex items-end justify-center -mx-4 -mb-4">
            <CommunicationsDemo />
          </div>
        </motion.div>
        {/* Tenant Directory - 8 col */}
        <motion.div
          variants={item}
          className="landing-glass-panel bg-white/40 md:col-span-8 rounded-2xl p-6 md:p-8 flex flex-col shadow-sm border border-white/60"
        >
          <div className="flex flex-col gap-2 mb-6 max-w-xl">
            <div className="inline-flex items-center rounded-md bg-acres-blue/10 border border-acres-blue/20 px-4 py-1.5 w-fit">
              <span className="font-syne text-[0.65rem] text-acres-blue uppercase tracking-wider">
                Management
              </span>
            </div>
            <h3 className="font-bricolage text-2xl font-semibold text-charcoal-black">
              Tenant Directory
            </h3>
            <p className="font-syne text-sm text-charcoal-black/50 mt-1">
              Manage leases, automate rent collection, and keep track of payment
              statuses all from a single, powerful table.
            </p>
          </div>
          <div className="w-full flex-1 rounded-4xl overflow-hidden -mx-2 -mb-2">
            <TenantsDemo />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
