import { DashboardStats } from "../components/layout/Stats";

import { ChartAreaDefault } from "../components/ui/area-chart";
import { seedTickets } from "../lib/seed/tickets";
import { CommunicationList } from "../components/layout/comms";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Card,
  CardTitle,
  CardContent,
  CardHeader,
} from "../components/ui/card";
import { SiteHeader } from "../components/layout/site-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { StatusBadge } from "../pages/Tenants";
import { tenants } from "@/lib/seed/tenants";

import { TicketList } from "@/components/layout/ticket";
import { communications } from "@/lib/seed/comms";
import { DASHBOARD_STATS } from "@/lib/seed/stats";

export default function Dashboard() {
  const openTickets = seedTickets.filter((t) => !t.status).slice(0, 3);

  return (
    <div className="flex flex-col space-y-4">
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
            <CardContent>
              <CommunicationList communications={communications} />
            </CardContent>
          </ScrollArea>
        </Card>

        {/* <div className="flex-1"><ChartPieDonutActive /></div> */}

        {/* Column 3 - Maintenance Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Tickets</CardTitle>
          </CardHeader>
          <ScrollArea className="h-150">
            <CardContent className="flex flex-col gap-4">
              <TicketList tickets={openTickets} />
            </CardContent>
          </ScrollArea>
        </Card>

        {/* Full width - Recent Transactions */}
        <div className="flex flex-col xl:col-span-3 lg:col-span-2 space-y-4 mt-8">
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
