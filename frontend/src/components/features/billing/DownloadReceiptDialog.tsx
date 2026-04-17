import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  useProperties,
  useUnits,
  useTenants,
  useTenantPayments,
} from "@/hooks/useApiQueries";
import { toast } from "sonner";
import { format } from "date-fns";
import { downloadReceiptPdf } from "@/utils/pdfUtils";

export function DownloadReceiptDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [downloading, setDownloading] = useState(false);

  const { data: properties = [] } = useProperties(1, "");
  const { data: units = [] } = useUnits(selectedPropertyId || undefined);
  const { data: tenants = [] } = useTenants(1, "");

  const selectedUnit = units.find((u) => u.id === selectedUnitId);
  const matchedTenant = tenants.find(
    (t: any) => t.unit === selectedUnit?.name || t.unitId === selectedUnitId,
  );

  const { data: payments = [] } = useTenantPayments(
    matchedTenant?.id || undefined,
  );

  const selectedPayment = payments.find((p: any) => p.id === selectedPaymentId);
  const propertyName =
    properties.find((p) => p.id === selectedPropertyId)?.name || "";

  const handleDownload = () => {
    if (!selectedPayment || !matchedTenant) return;
    setDownloading(true);
    try {
      downloadReceiptPdf({
        tenantName: matchedTenant?.name || "Tenant",
        unitName: selectedUnit?.name,
        propertyName,
        paymentMethod: selectedPayment.paymentmethod || "Manual",
        amount: Number(selectedPayment.amount),
        datePaid: selectedPayment.date || format(new Date(), "dd MMMM yyyy"),
        receiptId: selectedPayment.id?.slice(0, 8).toUpperCase() || "N/A",
      });
      toast.success("Receipt downloaded");
    } catch {
      toast.error("Failed to generate receipt");
    } finally {
      setDownloading(false);
    }
  };



  const canDownload =
    selectedPropertyId &&
    selectedUnitId &&
    selectedPaymentId &&
    selectedPayment;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Download Receipt
          </DialogTitle>
          <DialogDescription>
            Select a property, unit, and payment to download its receipt as a
            PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Property</Label>
            <Select
              value={selectedPropertyId}
              onValueChange={(val) => {
                setSelectedPropertyId(val);
                setSelectedUnitId("");
                setSelectedPaymentId("");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select property..." />
              </SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Unit</Label>
            <Select
              value={selectedUnitId}
              onValueChange={(val) => {
                setSelectedUnitId(val);
                setSelectedPaymentId("");
              }}
              disabled={!selectedPropertyId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select unit..." />
              </SelectTrigger>
              <SelectContent>
                {units
                  .filter((u) => u.status !== "Vacant")
                  .map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} {u.tenant ? `- ${u.tenant}` : ""}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {matchedTenant && payments.length > 0 && (
            <div className="space-y-2">
              <Label>Payment</Label>
              <Select
                value={selectedPaymentId}
                onValueChange={setSelectedPaymentId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment..." />
                </SelectTrigger>
                <SelectContent>
                  {payments.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      RWF {Number(p.amount).toLocaleString()} - {p.date} (
                      {p.paymentmethod || "Manual"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {matchedTenant && payments.length === 0 && selectedUnitId && (
            <p className="text-sm text-muted-foreground">
              No payments recorded for this tenant yet.
            </p>
          )}

          {!matchedTenant && selectedUnitId && (
            <p className="text-sm text-muted-foreground">
              No tenant found for this unit.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            disabled={!canDownload || downloading}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {downloading ? "Downloading..." : "Download PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

