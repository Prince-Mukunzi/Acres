import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useProperties, useUnits } from "@/hooks/useApiQueries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QRCodeCanvas } from "qrcode.react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Label } from "@/components/ui/label";
import { jsPDF } from "jspdf";

export function BulkQrCodesDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: properties = [] } = useProperties(1, "");
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [downloading, setDownloading] = useState(false);

  if (!selectedProperty && properties.length > 0) {
    setSelectedProperty(properties[0].id);
  }

  const { data: units = [], isLoading } = useUnits(selectedProperty);

  const activePropertyName =
    properties.find((p) => p.id === selectedProperty)?.name || "";

  const handleDownload = async () => {
    const element = document.getElementById("qr-print-area");
    if (!element) return;
    setDownloading(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(20, 20, 20);
      pdf.text(`${activePropertyName} - Unit QR Codes`, margin, margin);

      const canvases = element.querySelectorAll("canvas");
      const unitNames = element.querySelectorAll("span.font-semibold");

      let x = margin;
      let y = margin + 18;
      const size = 45;
      const spacing = 15;

      canvases.forEach((canvas, index) => {
        const unitNameText = unitNames[index]?.textContent || `Unit`;

        if (x + size > pdfWidth - margin) {
          x = margin;
          y += size + spacing + 10;
        }

        if (y + size > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          y = margin + 10;
          x = margin;
        }

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text(unitNameText, x + size / 2, y - 3, { align: "center" });
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", x, y, size, size);

        x += size + spacing;
      });

      const fileName = `${activePropertyName.replace(/\s+/g, "_") || "property"}_qr_codes.pdf`;
      pdf.save(fileName);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Unit QR Codes</DialogTitle>
          <DialogDescription>
            Generate and download portal access QR codes for units.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-2 border-b border-border">
          <div className="flex-1 flex items-center gap-4">
            <Label className="whitespace-nowrap">Filter by Property:</Label>
            <Select
              value={selectedProperty}
              onValueChange={setSelectedProperty}
            >
              <SelectTrigger className="w-[250px]">
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
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={downloading || units.length === 0}
            className="gap-2 shrink-0"
          >
            <Download className="h-4 w-4" />
            {downloading ? "Downloading..." : "Download PDF"}
          </Button>
        </div>

        <ScrollArea className="flex-1 mt-4 -mx-2 px-2" id="qr-print-area">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading units...
            </div>
          ) : units.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No units found in this property.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pb-6">
              {units.map((unit) => {
                const url = `${window.location.origin}/${encodeURIComponent(activePropertyName)}/submit-ticket/${encodeURIComponent(unit.name)}`;
                return (
                  <div
                    key={unit.id}
                    className="flex flex-col items-center justify-center p-4 border border-border rounded-lg bg-card"
                  >
                    <span className="font-semibold text-center mb-1 text-sm">
                      {unit.name}
                    </span>
                    <span className="text-xs text-muted-foreground text-center mb-3 line-clamp-1">
                      {activePropertyName}
                    </span>
                    <div className="bg-white p-2 rounded-md">
                      <QRCodeCanvas
                        value={url}
                        size={120}
                        level="H"
                        imageSettings={{
                          src: "/acres_dark.svg",
                          height: 24,
                          width: 24,
                          excavate: true,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
