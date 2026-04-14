import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useProperties, useUnits } from "@/hooks/useApiQueries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QRCodeCanvas } from "qrcode.react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Printer, QrCode } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/layout/ThemeProvider";

export function BulkQrCodesDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const { data: properties = [] } = useProperties(1, "");
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  
  // Auto-select first property if empty
  if (!selectedProperty && properties.length > 0) {
    setSelectedProperty(properties[0].id);
  }

  const { data: units = [], isLoading } = useUnits(selectedProperty);

  const activePropertyName = properties.find((p) => p.id === selectedProperty)?.name || "";

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Unit QR Codes
          </DialogTitle>
          <DialogDescription>
            Generate and print portal access QR codes for units.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-2 border-b border-border">
          <div className="flex-1 flex items-center gap-4">
            <Label className="whitespace-nowrap">Filter by Property:</Label>
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select property..." />
              </SelectTrigger>
              <SelectContent>
                {properties.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={handlePrint} className="gap-2 shrink-0">
            <Printer className="h-4 w-4" /> Print Sheet
          </Button>
        </div>

        <ScrollArea className="flex-1 mt-4 -mx-2 px-2" id="qr-print-area">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading units...</div>
          ) : units.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No units found in this property.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pb-6">
              {units.map((unit) => {
                const url = `${window.location.origin}/${encodeURIComponent(activePropertyName)}/submit-ticket/${encodeURIComponent(unit.name)}`;
                return (
                  <div key={unit.id} className="flex flex-col items-center justify-center p-4 border border-border rounded-lg bg-card">
                    <span className="font-semibold text-center mb-1 text-sm">{unit.name}</span>
                    <span className="text-xs text-muted-foreground text-center mb-3 line-clamp-1">{activePropertyName}</span>
                    <div className="bg-white p-2 rounded-md">
                      <QRCodeCanvas 
                        value={url} 
                        size={120} 
                        level="H" 
                        imageSettings={{
                          src: isDark ? "/acres_light.svg" : "/acres_dark.svg",
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
