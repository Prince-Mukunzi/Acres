import { motion } from "framer-motion";

export default function Partners() {
  const logos = [
    "Kigali Heights",
    "CHIC building",
    "Mplaza",
    "T2000 building",
    "Centenary House",
    "Grand Pension Plaza",
  ];
  const repeatedLogos = [...logos, ...logos, ...logos];

  return (
    <section className="w-full py-16 md:py-24 overflow-hidden bg-transparent">
      <div className="flex flex-col items-center justify-center">
        <span className="font-syne text-[0.75rem] font-medium tracking-[0.2em] text-charcoal-black/40 uppercase mb-10">
          Trusted by
        </span>

        <div className="relative w-full overflow-hidden flex items-center before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-25 before:bg-linear-to-r before:from-off-white before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-25 after:bg-linear-to-l after:from-off-white after:to-transparent">
          <motion.div
            animate={{ x: ["0%", "-33.333333%"] }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            className="flex flex-nowrap items-center gap-16 md:gap-24 w-max px-8"
          >
            {repeatedLogos.map((logo, i) => (
              <span
                key={i}
                className="font-bricolage text-xl md:text-2xl font-medium text-charcoal-black/30 transition-colors uppercase whitespace-nowrap"
              >
                {logo}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
