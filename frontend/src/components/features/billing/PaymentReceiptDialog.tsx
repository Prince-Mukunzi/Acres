import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Send } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { downloadReceiptPdf } from "@/utils/pdfUtils";

export function PaymentReceiptDialog({
  open,
  onOpenChange,
  tenant,
  paymentMethod,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: any;
  paymentMethod: string;
}) {
  const amountString = `RWF ${(tenant?.amount || 0).toLocaleString()}`;
  const receiptId = `REC-${Math.floor(Math.random() * 90000) + 10000}`;
  const today = format(new Date(), "dd MMMM yyyy");
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    try {
      downloadReceiptPdf({
        tenantName: tenant?.name || "Tenant",
        unitName: tenant?.unit || tenant?.unitName,
        propertyName: tenant?.propertyName || tenant?.property?.name,
        paymentMethod,
        amount: tenant?.amount || 0,
        datePaid: today,
        receiptId,
      });
    } finally {
      setDownloading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-background text-foreground p-6 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-2 text-foreground">
            Payment Receipt
          </DialogTitle>
        </DialogHeader>

        <div
          id="receipt-print-area"
          className="relative bg-white rounded-xl p-8 overflow-hidden shadow-lg"
        >
          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] -rotate-12 pointer-events-none opacity-[0.15] select-none z-0">
            <div className="text-6xl font-black text-green-600 tracking-widest border-[6px] border-green-600 p-4 rounded-xl inline-block">
              PAID
            </div>
          </div>

          <div className="relative z-10 flex flex-col h-full space-y-8">
            {/* Header section */}
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500">Property</span>
                <span className="text-base font-semibold text-zinc-900">
                  {tenant?.propertyName || tenant?.property?.name || "N/A"}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-zinc-500">Receipt</span>
                <span className="text-sm font-medium text-zinc-900">
                  {receiptId}
                </span>
              </div>
            </div>

            <Separator className="bg-zinc-200" />

            {/* Date Details */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500">
                  Date Paid
                </span>
                <span className="text-base font-medium text-zinc-900">
                  {today}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-xs text-zinc-500">
                  Received From
                </span>
                <span className="text-base font-medium text-zinc-900">
                  {tenant?.name}
                </span>
                <span className="text-sm font-medium text-zinc-500">
                  {tenant?.unit || tenant?.unitName}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500">
                  Payment Method
                </span>
                <span className="text-base font-medium text-zinc-900">
                  {paymentMethod}
                </span>
              </div>
            </div>

            {/* Totals */}
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">
                  Rent Payment
                </span>
                <span className="text-base font-semibold text-zinc-900">
                  {amountString}
                </span>
              </div>
              <Separator className="bg-zinc-200" />
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-zinc-900">
                  Total Paid
                </span>
                <span className="text-lg font-black text-zinc-900">
                  {amountString}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col space-y-2 items-center justify-center pt-2">
              <img src="/acres_dark.svg" alt="acres_logo" className="size-5" />
              <span className="text-xs text-zinc-500">
                Powered by Acres
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-3 h-12">
          <Button
            variant="outline"
            className="flex-1 bg-transparent hover:bg-white/5 border-border"
            onClick={() => onOpenChange(false)}
          >
            <Send className="mr-2 h-4 w-4" />
            Text to Tenant
          </Button>
          <Button
            className="flex-1 bg-white text-zinc-900 hover:bg-zinc-200"
            onClick={handleDownload}
            disabled={downloading}
          >
            <Download className="mr-2 h-4 w-4" />
            {downloading ? "Downloading..." : "Download PDF"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
