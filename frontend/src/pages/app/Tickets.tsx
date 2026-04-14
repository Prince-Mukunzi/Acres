"use client";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { TicketList } from "@/components/features/tickets/TicketCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { FolderCog } from "lucide-react";
import { useTickets, useProperties, useUnits } from "@/hooks/useApiQueries";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TicketQrDialog } from "@/components/features/tickets/TicketQrDialog";

export default function Tickets() {
  const { data: tickets = [], isLoading } = useTickets(true); // queueOnly = true
  const [showStartDialog, setShowStartDialog] = useState(false);

  return (
    <>
      <div className="flex flex-col space-y-8">
        <SiteHeader title="Maintenance Tickets" />

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? (
            <>
              <Skeleton className="h-42 w-full" />
              <Skeleton className="h-42 w-full" />
              <Skeleton className="h-42 w-full" />
              <Skeleton className="h-42 w-full" />
              <Skeleton className="h-42 w-full" />
              <Skeleton className="h-42 w-full" />
            </>
          ) : tickets.length === 0 ? (
            <div className="col-span-1 md:col-span-2 xl:col-span-3 flex justify-center py-12">
              <Empty>
                <EmptyMedia>
                  <FolderCog className="h-8 w-8 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>All caught up</EmptyTitle>
                <EmptyDescription>
                  No open maintenance tickets.
                </EmptyDescription>
                <Button
                  className="mt-4"
                  onClick={() => setShowStartDialog(true)}
                >
                  Start Accepting Tickets
                </Button>
              </Empty>
            </div>
          ) : (
            <TicketList tickets={tickets} />
          )}
        </div>
      </div>

      <StartAcceptingTicketsDialog
        open={showStartDialog}
        onOpenChange={setShowStartDialog}
      />
    </>
  );
}

function StartAcceptingTicketsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [showQr, setShowQr] = useState(false);

  const { data: properties = [] } = useProperties(1, "");
  const { data: units = [] } = useUnits(selectedPropertyId);

  const selectedUnit = units.find((u) => u.id === selectedUnitId) || null;
  const selectedProperty =
    properties.find((p) => p.id === selectedPropertyId)?.name || "";

  if (showQr && selectedUnit) {
    return (
      <TicketQrDialog
        open={showQr}
        onOpenChange={(val) => {
          setShowQr(val);
          if (!val) {
            onOpenChange(false);
            setSelectedPropertyId("");
            setSelectedUnitId("");
          }
        }}
        unit={selectedUnit}
        propertyName={selectedProperty}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start Accepting Tickets</DialogTitle>
          <DialogDescription>
            Select a property and unit to generate a maintenance request QR
            code.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Property</label>
            <Select
              value={selectedPropertyId}
              onValueChange={(val) => {
                setSelectedPropertyId(val);
                setSelectedUnitId("");
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
            <label className="text-sm font-medium">Unit</label>
            <Select
              value={selectedUnitId}
              onValueChange={setSelectedUnitId}
              disabled={!selectedPropertyId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select unit..." />
              </SelectTrigger>
              <SelectContent>
                {units.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full mt-4"
            disabled={!selectedUnitId}
            onClick={() => setShowQr(true)}
          >
            Generate QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
