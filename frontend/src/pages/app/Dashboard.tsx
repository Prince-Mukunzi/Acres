import { DashboardStats } from "../../components/shared/Stats";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useApiQueries";
import { FileText, QrCode, Send } from "lucide-react";
import { useState } from "react";
import { RentCollectionTable } from "@/components/features/dashboard/RentCollectionTable";
import { DownloadReportDialog } from "@/components/features/dashboard/DownloadReportDialog";
import { BulkQrCodesDialog } from "@/components/features/dashboard/BulkQrCodesDialog";
import { SmsTemplatesDialog } from "@/components/features/communication/SmsTemplatesDialog";

export default function Dashboard() {
  const {
    data: stats = {
      totalUnits: 0,
      totalTenants: 0,
      collected: 0,
      overdue: 0,
    },
    isLoading: statsLoading,
  } = useDashboardStats();

  // Dialog states for Quick Actions
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [showSmsDialog, setShowSmsDialog] = useState(false);

  return (
    <div className="flex flex-col space-y-6">
      <SiteHeader title="Dashboard" />

      <div className="p-4 flex flex-col space-y-8">
        {/* Top Stats */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <DashboardStats
            totalUnits={stats.totalUnits}
            totalTenants={stats.totalTenants}
            collected={`RWF ${Number(stats.collected).toLocaleString()}`}
            overdue={`RWF ${Number(stats.overdue).toLocaleString()}`}
          />
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            className="hover:border-primary/50 cursor-pointer transition-colors"
            onClick={() => setShowReportDialog(true)}
          >
            <CardContent className="flex items-center gap-4">
              <div className="p-3 bg-secondary rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">
                  Download Report
                </span>
                <span className="text-sm text-muted-foreground">
                  Export PDF summary
                </span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="hover:border-primary/50 cursor-pointer transition-colors"
            onClick={() => setShowQrDialog(true)}
          >
            <CardContent className="flex items-center gap-4">
              <div className="p-3 bg-secondary rounded-lg">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">QR Codes</span>
                <span className="text-sm text-muted-foreground">
                  Print portal links
                </span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="hover:border-primary/50 cursor-pointer transition-colors"
            onClick={() => setShowSmsDialog(true)}
          >
            <CardContent className="flex items-center gap-4">
              <div className="p-3 bg-secondary rounded-lg">
                <Send className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">
                  Broadcast SMS
                </span>
                <span className="text-sm text-muted-foreground">
                  Message all tenants
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rent Collection Table */}
        <div className="flex flex-col space-y-4">
          <RentCollectionTable />
        </div>
      </div>

      <DownloadReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
      />
      <BulkQrCodesDialog open={showQrDialog} onOpenChange={setShowQrDialog} />
      <SmsTemplatesDialog
        open={showSmsDialog}
        onOpenChange={setShowSmsDialog}
      />
    </div>
  );
}
