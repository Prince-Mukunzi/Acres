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
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useProperties } from "@/hooks/useApiQueries";
import { toast } from "sonner";
import { fetchApi } from "@/utils/api";

export function DownloadReportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [downloading, setDownloading] = useState(false);
  const { data: properties = [], isLoading } = useProperties(1, "");

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const url =
        selectedProperty === "all"
          ? "/api/v1/tenant?page=1&limit=500"
          : `/api/v1/unit?propertyId=${selectedProperty}`;

      const res = await fetchApi(url);
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();

      let csvContent: string;

      if (selectedProperty === "all") {
        const headers = [
          "Tenant Name",
          "Unit",
          "Rent Amount",
          "Status",
          "Due Date",
        ];
        const rows = data.map((t: any) => [
          `"${t.name || ""}"`,
          `"${t.unit || ""}"`,
          `"${t.amount || 0}"`,
          `"${t.status || ""}"`,
          `"${t.dueDate || ""}"`,
        ]);
        csvContent = [
          headers.join(","),
          ...rows.map((r: string[]) => r.join(",")),
        ].join("\n");
      } else {
        const headers = ["Unit Name", "Rent Amount", "Status", "Tenant"];
        const rows = data.map((u: any) => [
          `"${u.name || ""}"`,
          `"${u.rentAmount || 0}"`,
          `"${u.status || ""}"`,
          `"${u.tenant || "None"}"`,
        ]);
        csvContent = [
          headers.join(","),
          ...rows.map((r: string[]) => r.join(",")),
        ].join("\n");
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const propName =
        selectedProperty === "all"
          ? "all_properties"
          : properties
              .find((p) => p.id === selectedProperty)
              ?.name?.replace(/\s+/g, "_") || "property";
      link.setAttribute("href", blobUrl);
      link.setAttribute("download", `${propName}_report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success("Report downloaded successfully");
      onOpenChange(false);
    } catch {
      toast.error("Failed to download report");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Report</DialogTitle>
          <DialogDescription>
            Export a CSV summary of rent collection, occupancy, and tenant data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Property</Label>
            <Select
              value={selectedProperty}
              onValueChange={setSelectedProperty}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select property..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {!isLoading &&
                  properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {downloading ? "Exporting..." : "Export CSV"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
