import { QRCodeCanvas } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Download } from "lucide-react";
import { useState } from "react";
import type { Unit } from "@/types/unit";
import { useTheme } from "@/components/layout/ThemeProvider";

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
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (!unit) return null;

  const url = `${window.location.origin}/${encodeURIComponent(
    propertyName
  )}/submit-ticket/${encodeURIComponent(unit.name)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const canvas = document.getElementById("ticket-qr-canvas") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `ticket-qr-${unit.name}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
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
          <QRCodeCanvas 
            id="ticket-qr-canvas"
            value={url} 
            size={200} 
            level="H" 
            imageSettings={{
              src: isDark ? "/acres_light.svg" : "/acres_dark.svg",
              height: 48,
              width: 48,
              excavate: true,
            }}
          />
        </div>

        <div className="flex w-full items-center gap-2 mt-4">
          <div className="flex-1 bg-muted p-2 rounded-md text-xs truncate border select-all">
            {url}
          </div>
          <Button size="icon" variant="outline" onClick={handleCopy}>
            {copied ? <Check /> : <Copy />}
          </Button>
        </div>

        <div className="flex gap-2 w-full mt-2">
          <Button className="flex-1" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> Download QR
          </Button>
          <Button className="flex-1" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
