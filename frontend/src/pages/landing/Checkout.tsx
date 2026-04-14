import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { fetchApi } from "@/utils/api";
import { toast } from "sonner";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const plan = searchParams.get("plan") || "Unlimited Fall Pass";
  const cost = searchParams.get("cost") || "125";
  const discount = searchParams.get("discount") || "0";
  const originalCost = parseInt(cost) + parseInt(discount);

  const [contactInfo, setContactInfo] = useState({ name: "", email: "" });
  const [phone, setPhone] = useState("");

  const checkoutMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetchApi("/api/v1/payment/intouchpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("An error occurred during checkout.");
      return res;
    },
    onSuccess: () => {
      toast.success("Payment Initiated", {
        description:
          "Please check your phone to confirm the payment transaction.",
      });
      setTimeout(() => navigate("/"), 2000);
    },
    onError: (err: any) => {
      toast.error("Payment Failed", {
        description: err.message || "An error occurred during checkout.",
      });
    },
  });

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    checkoutMutation.mutate({
      plan,
      amount: cost,
      contact: contactInfo,
      phoneNumber: phone,
    });
  };

  return (
    <div className="min-h-screen bg-off-white flex flex-col md:flex-row">
      {/* Left Column - Plan Summary */}
      {/* <div className="flex-1 bg-off-white p-6 md:p-12 lg:px-24 pt-12 md:pt-24 border-r border-charcoal-black/5">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-syne text-charcoal-black/60 hover:text-charcoal-black mb-12"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to pricing
        </Link>

        <div className="flex-1 flex items-center justify-center w-full max-w-sm mx-auto mt-12 rounded-2xl overflow-hidden bg-charcoal-black/5 border border-charcoal-black/10 aspect-[3/4]">
          <img
            src="/dashboard.png"
            alt="Acres Platform"
            className="w-full h-full object-cover"
          />
        </div>
      </div> */}

      {/* Right Column - Payment Form */}
      <div className="flex-1 bg-white p-6 md:p-12 lg:px-24 pt-12 md:pt-24 flex flex-col justify-center">
        <Link
          to="/#pricing"
          className="inline-flex items-center text-sm font-syne text-charcoal-black/60 hover:text-charcoal-black mb-12"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to pricing
        </Link>
        <form onSubmit={handleCheckout} className="max-w-md w-full mx-auto">
          {/* Checkout Header & Summary */}
          <div className="mb-8">
            <h2 className="font-bricolage text-3xl font-bold text-charcoal-black mb-4">
              Checkout
            </h2>
          </div>

          <Label className="text-charcoal-black/60 font-syne mb-2 block">
            Select Payment Method
          </Label>

          {/* Mobile Payment Methods */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border border-charcoal-black/20 rounded-lg py-4 px-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-yellow-400 hover:bg-yellow-400/5 transition-all shadow-xs">
              <img
                src="/mtn.png"
                alt="MTN MoMo"
                className="w-14 h-14 object-cover"
              />
            </div>

            <div className="border border-charcoal-black/20 rounded-lg py-4 px-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-red-500 hover:bg-red-500/5 transition-all shadow-xs">
              <img
                src="/airtel.png"
                alt="Airtel Money"
                className="w-12 h-12 object-cover"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="text-charcoal-black/60 font-syne mb-2 block">
                Contact details
              </Label>
              <div className="border border-charcoal-black/10 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-acres-blue focus-within:border-acres-blue transition-all">
                <Input
                  required
                  type="text"
                  placeholder="Full Name"
                  value={contactInfo.name}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, name: e.target.value })
                  }
                  className="border-0 border-b border-charcoal-black/10 rounded-none shadow-none focus-visible:ring-0 px-4 py-6"
                />
                <Input
                  required
                  type="email"
                  placeholder="Email address"
                  value={contactInfo.email}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, email: e.target.value })
                  }
                  className="border-0 rounded-none shadow-none focus-visible:ring-0 px-4 py-6"
                />
              </div>
            </div>

            <div>
              <Label className="text-charcoal-black/60 font-syne mb-2 block">
                Phone
              </Label>
              <div className="border border-charcoal-black/10 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-acres-blue focus-within:border-acres-blue transition-all">
                <Input
                  required
                  type="tel"
                  placeholder="Phone number (e.g. 078...)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-0 rounded-none shadow-none focus-visible:ring-0 px-4 py-6 font-medium"
                />
              </div>
            </div>

            <div className="bg-charcoal-black/5 text-charcoal-black p-5 rounded-xl border border-charcoal-black/10">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bricolage font-medium text-lg">
                  {plan}
                </span>
                <span className="font-syne text-charcoal-black">
                  RWF {originalCost.toLocaleString()}
                </span>
              </div>
              {parseInt(discount) > 0 && (
                <div className="flex justify-between items-center mb-3 text-charcoal-black/40 font-syne text-sm">
                  <span>Yearly Discount Applied</span>
                  <span>- RWF {parseInt(discount).toLocaleString()}</span>
                </div>
              )}
              <div className="h-px w-full bg-charcoal-black/10 my-3"></div>
              <div className="flex justify-between items-center font-bricolage font-bold text-xl">
                <span>Total</span>
                <span>RWF {parseInt(cost).toLocaleString()}</span>
              </div>
            </div>

            <Button
              type="submit"
              className="bg-acres-blue w-full text-acres-surface"
              disabled={checkoutMutation.isPending}
            >
              {checkoutMutation.isPending
                ? "Processing..."
                : "Complete Payment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
