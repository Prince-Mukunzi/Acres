import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Unit } from "@/types/unit";

interface TicketQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: Unit | null;
  propertyName: string;
}

export function TicketQrDialog({
  open,
  onOpenChange,
  unit,
  propertyName,
}: TicketQrDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!unit) return null;

  const url = `${window.location.origin}/${encodeURIComponent(
    propertyName
  )}/submit-ticket/${encodeURIComponent(unit.name)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col items-center">
        <DialogHeader>
          <DialogTitle>Ticket QR Code</DialogTitle>
          <DialogDescription>
            Scan this code to submit a maintenance ticket for unit{" "}
            <strong>{unit.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-100 p-2 rounded-lg">
          <QRCodeSVG value={url} size={200} level="H" />
        </div>

        <div className="flex w-full items-center gap-2 mt-4">
          <div className="flex-1 bg-muted p-2 rounded-md text-xs truncate border select-all">
            {url}
          </div>
          <Button size="icon" variant="outline" onClick={handleCopy}>
            {copied ? <Check /> : <Copy />}
          </Button>
        </div>

        <Button className="w-full" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
