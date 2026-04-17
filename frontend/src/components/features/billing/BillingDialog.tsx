import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useDashboardStats } from "@/hooks/useApiQueries";
import { CheckCircle2, Zap, Building2 } from "lucide-react";
import { toast } from "sonner";

// ─── Plan definitions ─────────────────────────────────────────────────────────
// TODO: Replace `onUpgrade` stubs with real payment gateway integration
//       (e.g. Stripe Checkout, IntouchPay, etc.) once billing is configured.
//       Each plan's `priceId` should map to a product in your payment provider.
// ─────────────────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "free",
    name: "Free",
    priceId: null, // TODO: No payment required
    description: "For landlords just getting started",
    monthlyRwf: 0,
    unitLimit: 3,
    features: [
      "Up to 3 units",
      "Basic tenant management",
      "QR maintenance tickets",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceId: "price_pro_monthly", // TODO: Replace with real payment provider price ID
    description: "For growing portfolios",
    monthlyRwf: 10_000,
    unitLimit: 10,
    features: [
      "Up to 10 units",
      "All Free features",
      "SMS notifications",
      "Payment receipts",
      "Analytics dashboard",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceId: "price_enterprise_monthly", // TODO: Replace with real payment provider price ID
    description: "For large property managers",
    monthlyRwf: 20_000,
    unitLimit: Infinity,
    features: [
      "Unlimited units",
      "All Pro features",
      "Priority support",
      "Custom integrations",
      "Dedicated account manager",
    ],
  },
];

function getCurrentPlan(propertyCount: number): string {
  if (propertyCount <= 1) return "free";
  if (propertyCount <= 3) return "pro";
  return "enterprise";
}

export function BillingDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: stats } = useDashboardStats();
  const totalUnits = (stats?.totalProperties ?? 0);
  const currentPlanId = getCurrentPlan(totalUnits);

  // TODO: Wire this to your actual payment gateway (Stripe, IntouchPay, etc.)
  //       When a user clicks "Upgrade", redirect to your checkout flow or open a payment modal.
  //       For Stripe: use `loadStripe` + `redirectToCheckout` with the plan's priceId.
  const handleUpgrade = (_planId: string, planName: string) => {
    // MOCK: Show a toast for now until payment gateway is integrated
    toast.info(
      `Upgrading to ${planName} — connect your payment gateway to enable this.`,
      { duration: 5000 }
    );
    // TODO: Example Stripe integration:
    // const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    // await stripe?.redirectToCheckout({ lineItems: [{ price: plan.priceId, quantity: 1 }], mode: 'subscription', ... });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Billing & Plans</DialogTitle>
          <DialogDescription>
            Choose the plan that fits your portfolio size.
          </DialogDescription>
        </DialogHeader>

        {/* Current usage summary */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
          <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Current usage</p>
            <p className="text-xs text-muted-foreground">
              {totalUnits} propert{totalUnits === 1 ? "y" : "ies"} on the{" "}
              <span className="capitalize font-semibold text-foreground">
                {currentPlanId}
              </span>{" "}
              plan
            </p>
          </div>
          <Badge
            variant={
              currentPlanId === "enterprise"
                ? "default"
                : currentPlanId === "pro"
                  ? "secondary"
                  : "outline"
            }
            className="shadow-none font-normal capitalize shrink-0"
          >
            {currentPlanId}
          </Badge>
        </div>

        <Separator />

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLANS.map((plan) => {
            const isActive = plan.id === currentPlanId;
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-xl border p-4 gap-3 transition-all ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card"
                }`}
              >
                {isActive && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}

                <div>
                  <p className="font-semibold text-sm">{plan.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {plan.description}
                  </p>
                </div>

                <div>
                  <span className="text-xl font-bold">
                    {plan.monthlyRwf === 0
                      ? "Free"
                      : `RWF ${plan.monthlyRwf.toLocaleString()}`}
                  </span>
                  {plan.monthlyRwf > 0 && (
                    <span className="text-xs text-muted-foreground">/mo</span>
                  )}
                </div>

                <ul className="space-y-1.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  size="sm"
                  variant={isActive ? "outline" : "default"}
                  disabled={isActive}
                  className="w-full mt-1 gap-1.5"
                  onClick={() => handleUpgrade(plan.id, plan.name)}
                >
                  {isActive ? (
                    "Active"
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5" />
                      Upgrade
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Need a custom plan?{" "}
          <a
            href="mailto:support@acres.rw"
            className="underline hover:text-foreground transition-colors"
          >
            Contact support
          </a>
        </p>
      </DialogContent>
    </Dialog>
  );
}
