import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToggleTenantStatus } from "@/hooks/useApiMutations";
import { PaymentReceiptDialog } from "./PaymentReceiptDialog";

export function MarkAsPaidDialog({
  open,
  onOpenChange,
  tenant,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: any;
}) {
  const [generateReceipt, setGenerateReceipt] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Mobile Money");
  const toggleMutation = useToggleTenantStatus();

  // If receipt is shown, do not render the Mark as Paid dialog contents as it creates stacking/z-index complications if we just open another dialog. We will transition views or let receipt handle the presentation.
  // Actually, Shadcn dialogs can stack, but it's cleaner to swap if possible, or just render it outside.

  const handleConfirm = () => {
    if (!tenant) return;

    const nameParts = (tenant.name || "").split(" ");
    toggleMutation.mutate({
      id: tenant.id,
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      status: "Paid",
      paymentMethod: paymentMethod,
    });

    if (generateReceipt) {
      setShowReceipt(true);
    } else {
      onOpenChange(false); // Close parent
    }
  };

  const amountString = `RWF ${(tenant?.amount || 0).toLocaleString()}`;

  return (
    <>
      <Dialog open={open && !showReceipt} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Mark as Paid
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Context Card */}
            <div className="bg-secondary p-4 rounded-lg border border-border">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Tenant
              </div>
              <div className="font-semibold text-base">{tenant?.name}</div>
              <div className="text-sm text-muted-foreground mb-4">
                {tenant?.unit || tenant?.unitName}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm font-medium text-muted-foreground">
                  Amount Due
                </span>
                <span className="font-bold text-lg">{amountString}</span>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-3 p-1">
              <Label className="text-sm font-medium text-foreground">
                Payment Method
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select method..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 border rounded-md p-4 bg-muted/50 border-border">
              <Checkbox
                id="receipt"
                checked={generateReceipt}
                onCheckedChange={(c) => setGenerateReceipt(c as boolean)}
                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <Label
                htmlFor="receipt"
                className="flex items-center gap-2 cursor-pointer text-sm font-medium leading-none"
              >
                Generate & preview receipt
              </Label>
            </div>
          </div>

          <DialogFooter className="mt-6 flex sm:justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={toggleMutation.isPending}>
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Embedded receipt generation state */}
      {showReceipt && tenant && (
        <PaymentReceiptDialog
          open={showReceipt}
          onOpenChange={(val: boolean) => {
            setShowReceipt(val);
            if (!val) onOpenChange(false); // Cascade close
          }}
          tenant={tenant}
          paymentMethod={paymentMethod}
        />
      )}
    </>
  );
}
