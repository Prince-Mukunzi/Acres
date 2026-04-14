import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

import {
  MessageSquare,
  ReceiptText,
  CalendarIcon,
  Banknote,
  PenBox,
} from "lucide-react";
import { useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { useTenantPayments } from "@/hooks/useApiQueries";
import { SmsTemplatesDialog } from "../communication/SmsTemplatesDialog";
import { MarkAsPaidDialog } from "../billing/MarkAsPaidDialog";
import { EditTenantSheet } from "./EditTenantSheet"; // Keep the original just to show it when "Edit" is clicked
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

type TenantData = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  unit?: string;
  startDate?: string;
  date?: string; // Due date or lease end date
  amount?: number;
  status: string;
};

export function TenantProfileSheet({
  tenant,
  open,
  onOpenChange,
  onRefresh,
}: {
  tenant: TenantData;
  open: boolean;
  onOpenChange: (val: boolean) => void;
  onRefresh: () => void;
}) {
  const { isMobile } = useSidebar();
  const [showSms, setShowSms] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const { data: payments = [], isLoading: loadingPayments } = useTenantPayments(
    open ? tenant.id : undefined,
  );

  const amountString = `RWF ${(tenant.amount || 0).toLocaleString()}`;
  const isOverdue = tenant.status === "Overdue";

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side={isMobile ? "bottom" : "right"}>
          <SheetHeader className="flex flex-row space-x-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col text-left">
                <SheetTitle>{tenant.name}</SheetTitle>
                <SheetDescription>
                  {tenant.unit || "No Unit Assigned"}
                </SheetDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEdit(true)}
            >
              <PenBox className="h-4 w-4" />
            </Button>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scrollbar-none">
            {/* LEASE SUMMARY */}
            <div className="space-y-4">
              <SheetDescription>Lease Summary</SheetDescription>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent>
                    <CardDescription>Rent Amount</CardDescription>
                    <CardTitle className=" font-semibold">
                      {amountString}
                    </CardTitle>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <CardDescription>Next Due Date</CardDescription>
                    <CardTitle className=" font-semibold">
                      {tenant.date || "Not set"}
                    </CardTitle>
                  </CardContent>
                </Card>
              </div>

              {isOverdue && (
                <div className="bg-destructive/10 border border-destructive p-4 rounded-xl flex items-center justify-between mt-4">
                  <div className="flex flex-col">
                    <span className="text-destructive text-xs mb-1">
                      Outstanding Balance
                    </span>
                    <span className="text-destructive font-semibold text-lg">
                      {amountString}
                    </span>
                  </div>
                  <Badge variant={"destructive"}>Unpaid</Badge>
                </div>
              )}
            </div>

            {/* RECENT PAYMENTS */}
            <div className="space-y-4 pt-4 border-t ">
              <SheetDescription>Recent Payments</SheetDescription>
              <div className="pt-2 pl-4 border-l space-y-8 relative">
                {loadingPayments ? (
                  <span className="text-sm block pb-4">Loading history...</span>
                ) : payments.length === 0 ? (
                  <span className="text-sm  block pb-4">
                    No payments recorded yet.
                  </span>
                ) : (
                  payments.map((p) => (
                    <div key={p.id} className="relative">
                      <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-success ring-1 ring-foreground" />
                      <div className="flex justify-between items-start pr-4">
                        <div className="flex flex-col gap-1">
                          <span className=" font-medium">
                            RWF {Number(p.amount).toLocaleString()}
                          </span>
                          <span className="text-sm  flex items-center gap-1.5">
                            <Banknote className="h-3 w-3" />{" "}
                            {p.paymentmethod || "Manual"} •{" "}
                            <span className="text-success text-xs">Paid</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5  text-sm">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          {p.date}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <SheetFooter>
            <Button onClick={() => setShowPayment(true)}>
              <ReceiptText className="h-4 w-4" /> Record Payment
            </Button>
            <Button variant={"secondary"} onClick={() => setShowSms(true)}>
              <MessageSquare className="h-4 w-4" /> Message
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {showSms && (
        <SmsTemplatesDialog
          open={showSms}
          onOpenChange={setShowSms}
          prefilledTenant={{
            id: tenant.id,
            name: tenant.name,
            unit: tenant.unit,
          }}
        />
      )}

      {showPayment && (
        <MarkAsPaidDialog
          open={showPayment}
          onOpenChange={(val) => {
            setShowPayment(val);
            if (!val) onRefresh(); // Refresh payments/status when closing
          }}
          tenant={tenant}
        />
      )}

      {showEdit && (
        <EditTenantSheet
          open={showEdit}
          onOpenChange={(val) => {
            setShowEdit(val);
            if (!val) onRefresh();
          }}
          tenant={{
            id: tenant.id,
            name: tenant.name,
            phone: tenant.phone,
            email: tenant.email,
            unitName: tenant.unit,
            startDate: tenant.startDate,
            endDate: tenant.date,
          }}
          onSave={() => {
            setShowEdit(false);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
