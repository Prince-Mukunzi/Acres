import { motion } from "framer-motion";

export default function Privacy() {
  return (
    <div className="flex flex-col items-start w-full mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full mb-12"
      >
        <span className="font-syne text-xs tracking-widest text-acres-blue uppercase font-bold">
          Data Protection
        </span>
        <h1 className="font-bricolage text-4xl font-bold text-charcoal-black md:text-5xl tracking-tight">
          Privacy Policy
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
          At Acres, your privacy and the security of your tenants' data are our
          paramount concerns. This Privacy Policy applies to services provided
          by us under the product name "Acres" and our web application (the
          App), and explains what information we collect from users, including
          information that may be used to personally identify you, and how we
          use it.
        </p>

        <p>
          Acres does not sell your data or share it with third parties except as
          described in this policy.
        </p>

        {/* Section 1 */}
        <section>
          <h2 className="font-bricolage text-2xl font-bold mb-4 text-charcoal-black">
            Information We Collect
          </h2>
          <p className="mb-4">
            We collect information primarily to operate the Acres platform
            efficiently for you. We gather the following tiers of data:
          </p>
          <ul className="list-disc list-outside ml-6 space-y-2 mb-4 text-charcoal-black/80">
            <li>
              <strong>Landlord Data:</strong> Identification (Google OAuth
              profile data including email and name), contact details, and
              platform subscription payment methods.
            </li>
            <li>
              <strong>Property Data:</strong> Addresses, unit distributions, and
              localized portfolio statistics.
            </li>
            <li>
              <strong>Tenant Data:</strong> Full names, contact information
              (email, phone numbers), structural lease dates, rental amounts,
              and maintenance ticket logs inputted by you.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="font-bricolage text-2xl font-bold mb-4 text-charcoal-black">
            How We Use Your Information
          </h2>
          <p className="mb-4">
            Acres handles your data strictly to enable your property management
            workflows. Specifically, your data is engaged for:
          </p>
          <ul className="list-disc list-outside ml-6 space-y-2 mb-4 text-charcoal-black/80">
            <li>
              Facilitating secure login protocols using standard authorization.
            </li>
            <li>
              Tracking financial metrics, rent collections, and automatically
              generating dynamic invoices.
            </li>
            <li>
              Processing maintenance requests via QR Code portals for your
              tenants directly.
            </li>
            <li>
              Dispatching targeted emails or SMS notifications (via integrators
              like Pindo) at your direct command.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="font-bricolage text-2xl font-bold mb-4 text-charcoal-black">
            Data Security & Storage
          </h2>
          <p className="mb-4">
            Your data is stored utilizing modern PostgreSQL encryptions with
            stringent role-based access mechanisms mapping every unit directly
            back to your authenticated User ID. We deploy standard industry
            techniques (such as robust caching and SSL transit) to resist
            unauthorized intrusions.
          </p>
          <p>
            You retain complete control over your portfolio data and you may
            structurally delete units or tenants from the active dashboard,
            severing their access queues locally.
          </p>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="font-bricolage text-2xl font-bold mb-4 text-charcoal-black">
            Third-Party Integrations
          </h2>
          <p className="mb-4">
            To provide continuous capabilities, Acres integrates with reputable
            third-party tools:
          </p>
          <ul className="list-disc list-outside ml-6 space-y-2 mb-4 text-charcoal-black/80">
            <li>
              <strong>Google Workspace:</strong> For federated identity and
              profile mapping.
            </li>
            <li>
              <strong>Telecom Operators (MTN/Airtel):</strong> For secure
              financial checkouts (operated by Intouchpay). We do not store your
              raw payment details within our database infrastructure.
            </li>
            <li>
              <strong>Pindo SMS API:</strong> Essential phone numbers are
              securely transmitted to trigger prompt communication events.
            </li>
          </ul>
        </section>
      </motion.div>
    </div>
  );
}
