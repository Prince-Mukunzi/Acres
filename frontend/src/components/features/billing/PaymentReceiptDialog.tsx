import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Receipt, Send } from "lucide-react";
import { format } from "date-fns";

export function PaymentReceiptDialog({ 
  open, 
  onOpenChange, 
  tenant, 
  paymentMethod 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  tenant: any; 
  paymentMethod: string;
}) {
  const amountString = `RWF ${(tenant?.amount || 0).toLocaleString()}`;
  const receiptId = `REC-${Math.floor(Math.random() * 90000) + 10000}`;
  const today = format(new Date(), "dd MMMM yyyy");

  const handlePrint = () => {
    // Basic window print trigger
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-background text-foreground p-6 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Receipt className="h-5 w-5 text-primary" />
            Payment Receipt
          </DialogTitle>
        </DialogHeader>

        {/* Scaled Print Container */}
        <div id="receipt-print-area" className="relative bg-white text-zinc-900 rounded-lg p-8 overflow-hidden shadow-lg border border-zinc-200">
          
          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] -rotate-12 pointer-events-none opacity-[0.15] select-none z-0">
            <div className="text-6xl font-black text-success tracking-widest border-[6px] border-success p-4 rounded-xl inline-block">
              PAID
            </div>
          </div>

          <div className="relative z-10 flex flex-col h-full space-y-8">
            {/* Header section */}
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-6 w-6 bg-zinc-900 rounded-sm"></div>
                  <span className="text-2xl font-bold tracking-tight">Acres</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">Property Management</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-zinc-400 tracking-wider">RECEIPT</span>
                <span className="text-sm font-semibold text-zinc-600">{receiptId}</span>
              </div>
            </div>

            <hr className="border-t border-zinc-200" />

            {/* Date Details */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col">
                <span className="text-xs uppercase font-bold text-zinc-400 tracking-widest mb-1">Date Paid</span>
                <span className="text-base font-bold text-zinc-800">{today}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs uppercase font-bold text-zinc-400 tracking-widest mb-1">Received From</span>
                <span className="text-base font-bold text-zinc-800">{tenant?.name}</span>
                <span className="text-sm font-medium text-zinc-500">{tenant?.unit || tenant?.unitName}</span>
              </div>
            </div>

            {/* Totals Box */}
            <div className="bg-zinc-50 rounded-lg p-5 border border-zinc-100 flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-zinc-500">Rent Payment</span>
                <span className="text-base font-semibold text-zinc-800">{amountString}</span>
              </div>
              <hr className="border-t border-zinc-200" />
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-zinc-900">Total Paid</span>
                <span className="text-lg font-black text-zinc-900">{amountString}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col items-center justify-center pt-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest mb-1">Payment Method</span>
              <span className="text-sm font-semibold text-zinc-800">{paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-3 h-12">
          <Button variant="outline" className="flex-1 bg-transparent hover:bg-white/5 border-border" onClick={() => onOpenChange(false)}>
            <Send className="mr-2 h-4 w-4" />
            Text to Tenant
          </Button>
          <Button className="flex-1 bg-white text-zinc-900 hover:bg-zinc-200" onClick={handlePrint}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
