import { DashboardStats } from "@/components/layout/Stats";

import { ChartAreaDefault } from "@/components/ui/area-chart";
import { MaintenanceTickets } from "@/components/layout/Tickets";
import { seedTickets } from "@/lib/seed/tickets";
import Communication from "@/components/layout/communication";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import { SiteHeader } from "@/components/layout/site-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { tenants, StatusBadge } from "@/pages/Tenants";

const DASHBOARD_STATS = {
  totalUnits: 12,
  totalTenants: 11,
  collected: "RF 13,100,000",
  overdue: "RF 900,000",
};

const communications = [
  {
    id: "comm-1",
    title: "Payment Reminder",
    message:
      "Hello, [tenant_name] We hope this message find you well! This is a kind reminder to complete your rent pay...",
  },
  {
    id: "comm-3",
    title: "Lease Renewal",
    message:
      "Dear [tenant_name], your lease is set to expire in 60 days. Please let us know if you intend to renew by clicking below.",
  },
  {
    id: "comm-2",
    title: "Maintenance Update",
    message:
      "Hi there! We wanted to let you know that the scheduled elevator maintenance is now complete. Thank you for your patience.",
  },
  {
    id: "comm-3",
    title: "Lease Renewal",
    message:
      "Dear [tenant_name], your lease is set to expire in 60 days. Please let us know if you intend to renew by clicking below.",
  },
];

export default function Dashboard() {
  const handleEdit = (id: string) => {
    console.log(`Editing communication: ${id}`);
  };

  const handleSend = (id: string) => {
    console.log(`Sending communication: ${id}`);
  };
  return (
    <div className="flex flex-col space-y-8">
      <SiteHeader title="Dashboard" />

      {/* main content */}
      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Stats window cards - Column 1 */}
        <div className="flex flex-col gap-4">
          <DashboardStats
            totalUnits={DASHBOARD_STATS.totalUnits}
            totalTenants={DASHBOARD_STATS.totalTenants}
            collected={DASHBOARD_STATS.collected}
            overdue={DASHBOARD_STATS.overdue}
          />

          {/* Chart Area */}
          <div className="flex-1">
            <ChartAreaDefault />
          </div>
        </div>

        {/* Column 2 - Message Templates and Occupancy */}

        <Card>
          <CardHeader>
            <CardTitle>Communications</CardTitle>
          </CardHeader>
          <ScrollArea className="h-150">
            <CardContent className="flex flex-col gap-4">
              {communications.map((item) => (
                <Communication
                  key={item.id}
                  title={item.title}
                  message={item.message}
                  onEdit={() => handleEdit(item.id)}
                  onSend={() => handleSend(item.id)}
                />
              ))}
            </CardContent>
          </ScrollArea>
        </Card>

        {/* <div className="flex-1"><ChartPieDonutActive /></div> */}
        {/* Column 3 - Maintenance Tickets */}
        <MaintenanceTickets tickets={seedTickets} />

        {/* Full width - Recent Transactions */}
        <div className="flex flex-col xl:col-span-3 lg:col-span-2 space-y-4">
          <CardTitle>Recent Transactions</CardTitle>
          <Card className="p-0 overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-secondary">
                  <TableRow>
                    <TableHead className="font-semibold text-foreground">
                      Tenant Name
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Unit Name
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.slice(0, 5).map((tenant, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">
                        {tenant.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {tenant.unit}
                      </TableCell>
                      <TableCell>{tenant.amount}</TableCell>
                      <TableCell>
                        <StatusBadge status={tenant.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {tenant.date}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
