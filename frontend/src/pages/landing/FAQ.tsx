import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQ() {
  const faqs = [
    {
      question: "Do my tenants need to download an app?",
      answer:
        "No, your tenants can easily access the portal through a secure web link, directly from their mobile browser without downloading any apps.",
    },
    {
      question: "How does QR code maintenance work?",
      answer:
        "Each unit is assigned a unique QR code. Tenants simply scan the code with their smartphone camera to instantly open a pre-filled maintenance request form.",
    },
    {
      question: "Can I scale or downgrade my unit count?",
      answer:
        "Absolutely. Acres is designed to grow with your business. You can add or remove units at any time, and your billing will be prorated automatically.",
    },
    {
      question: "Is Acres Rwanda only?",
      answer:
        "While we started in Rwanda, Acres is a global platform built to support property managers and landlords anywhere in the world.",
    },
    {
      question: "What is the cost of setup?",
      answer:
        "Setup and onboarding is completely free. We also provide dedicated support to help you migrate your existing data seamlessly.",
    },
  ];

  return (
    <section id="faq" className="mx-auto  max-w-7xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <span className="font-syne text-xs tracking-widest text-charcoal-black/40 uppercase">
          Got questions?
        </span>
        <h2 className="mt-2 font-bricolage text-3xl font-bold text-charcoal-black md:text-4xl">
          Frequently Asked Questions
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="landing-glass-panel rounded-2xl bg-off-white/40 p-6 md:p-10 divide-y divide-charcoal-black/5 shadow-sm border border-white/60"
      >
        {faqs.map((faq, i) => (
          <FAQItem key={i} faq={faq} index={i} />
        ))}
      </motion.div>
    </section>
  );
}

function FAQItem({
  faq,
  index,
}: {
  faq: { question: string; answer: string };
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      className="py-5 first:pt-0 last:pb-0 overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group gap-4 outline-none"
      >
        <span className="font-syne text-[1.1rem] font-semibold text-charcoal-black group-hover:text-acres-blue transition-colors">
          {faq.question}
        </span>
        <div className="shrink-0 w-8 h-8 rounded-full bg-charcoal-black/5 flex items-center justify-center text-charcoal-black/60 group-hover:bg-acres-blue/10 group-hover:text-acres-blue transition-colors">
          {isOpen ? (
            <Minus className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="pt-4 pb-2">
              <p className="font-syne text-charcoal-black/60 leading-relaxed text-[0.95rem] m-0">
                {faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
