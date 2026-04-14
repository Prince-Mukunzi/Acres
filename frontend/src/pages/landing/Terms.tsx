import { motion } from "framer-motion";

export default function Terms() {
  return (
    <div className="flex flex-col items-start w-full mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full mb-12"
      >
        <span className="font-syne text-xs tracking-widest text-acres-blue uppercase font-bold">
          Legal Agreement
        </span>
        <h1 className="font-bricolage text-4xl font-bold text-charcoal-black md:text-5xl tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-4 font-syne text-charcoal-black/60 text-lg max-w-2xl">
          Last updated on 1st of April, 2026
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="w-full font-syne text-charcoal-black/80 text-[1.05rem] leading-[1.8] space-y-12 pb-24 max-w-3xl"
      >
        <p>
          Please carefully review these rules before utilizing the Acres Property Management Platform. By using our service, you agree to these expectations and acknowledge the obligations structured herein.
        </p>

        {/* Section 1 */}
        <section>
          <h2 className="font-bricolage text-2xl font-bold mb-4 text-charcoal-black">
            Acceptance of Terms
          </h2>
          <p className="mb-4">
            By accessing and using Acres ("the Platform", "we", "us"), operated and provided to you, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree with any part of these Terms, you may not use our services.
          </p>
          <p>
            Acres provides software intended strictly for property lords, property managers, and authorized real estate stakeholders to manage their tenants, invoices, properties, and maintenance workflows seamlessly.
          </p>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="font-bricolage text-2xl font-bold mb-4 text-charcoal-black">
            User Obligations & Warranties
          </h2>
          <p className="mb-4">
            When you register an account and add properties/units to Acres, you warrant that you are the lawful owner, or explicitly authorized manager, of those listed real estate assets. You agree to:
          </p>
          <ul className="list-disc list-outside ml-6 space-y-2 mb-4 text-charcoal-black/80">
            <li>Provide accurate and complete information about the properties and tenants you manage.</li>
            <li>Maintain the confidentiality of your login credentials securely, utilizing integrations such as Google OAuth where provided.</li>
            <li>Use the Platform solely for lawful purposes, adhering to local real estate, eviction, and data protection legislation.</li>
          </ul>
          <p>
            You are exclusively responsible for resolving all disputes, lease agreements, and financial discrepancies directly with your tenants. Acres relies exclusively on the inputs you provide and acts merely as an administrative tool.
          </p>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="font-bricolage text-2xl font-bold mb-4 text-charcoal-black">
            Subscriptions & Payments
          </h2>
          <p className="mb-4">
            Certain features of Acres are subject to billing tiers based on the volume of units you actively manage. Our "Pay as you grow" structure incurs billing calculations based on your total unit allotment.
          </p>
          <p>
            All fees are non-refundable unless legally mandated otherwise. By providing payment information to our authorized third-party processors (such as MTN MoMo or Airtel Money), you authorize us to charge you for all agreed subscription periods (monthly or annually). We reserve the right to suspend accounts with outstanding, overdue balances.
          </p>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="font-bricolage text-2xl font-bold mb-4 text-charcoal-black">
            Communications Tool
          </h2>
          <p className="mb-4">
            Acres includes automated functionality permitting you to communicate with your tenants via email or short message service (SMS). You are solely responsible for acquiring the explicit consent of your tenants prior to engaging these communication pathways.
          </p>
          <p>
            You agree not to use the Platform to transmit spam, unsolicited marketing material, or harassing communications.
          </p>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="font-bricolage text-2xl font-bold mb-4 text-charcoal-black">
            Limitation of Liability
          </h2>
          <p className="mb-4">
            To the maximum extent permitted by applicable law, Acres and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from or related to your use of the Platform.
          </p>
          <p>
            Because we are fundamentally a SaaS provider, we cannot guarantee constant uninterrupted access to the platform, and cannot be held liable for rental losses, eviction disputes, or data interruptions resulting from external contingencies outside our control.
          </p>
        </section>
      </motion.div>
    </div>
  );
}
