import { DashboardStats } from "../../components/shared/Stats";

import { PieChartDefault } from "@/components/ui/area-chart";
import { CommunicationList } from "@/components/features/communication/CommunicationCard";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Card,
  CardTitle,
  CardContent,
  CardHeader,
  CardAction,
  CardDescription,
} from "../../components/ui/card";
import { SiteHeader } from "@/components/layout/SiteHeader";

import { TicketList } from "@/components/features/tickets/TicketCard";
import { TenantsTable } from "@/components/shared/TenantTable";
import { AddCommunicationDialog } from "@/components/features/communication/AddCommunicationDialog";
import type { Communication } from "@/types/communication";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { FolderCog, MessageCircle } from "lucide-react";
import {
  useDashboardStats,
  useDashboardChart,
  useTickets,
  useCommunications,
} from "@/hooks/useApiQueries";
import { useAddCommunication } from "@/hooks/useApiMutations";

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
  const { data: tickets = [], isLoading: ticketsLoading } = useTickets();
  const { data: communicationsList = [], isLoading: commsLoading } =
    useCommunications();
  const {
    data: chartData = { occupied: 0, vacant: 0 },
    isLoading: chartLoading,
  } = useDashboardChart();

  const isLoading =
    statsLoading || ticketsLoading || commsLoading || chartLoading;

  const openTickets = tickets.filter((t) => !t.status).slice(0, 3);

  const addCommunicationMutation = useAddCommunication();

  const handleAddCommunication = async (newComm: Communication) => {
    addCommunicationMutation.mutate(newComm);
  };

  return (
    <div className="flex flex-col space-y-4">
      <SiteHeader title="Dashboard" />

      {/* main content */}
      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Stats window cards - Column 1 */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2">
              <Skeleton className="h-42 w-full" />
              <Skeleton className="h-42 w-full" />
              <Skeleton className="h-42 w-full" />
              <Skeleton className="h-42 w-full" />
            </div>
          ) : (
            <DashboardStats
              totalUnits={stats.totalUnits}
              totalTenants={stats.totalTenants}
              collected={`RWF ${Number(stats.collected).toLocaleString()}`}
              overdue={`RWF ${Number(stats.overdue).toLocaleString()}`}
            />
          )}

          {/* Chart Area */}
          <div className="flex-1">
            {isLoading ? (
              <Skeleton className="h-[430px] w-full" />
            ) : (
              <PieChartDefault
                occupied={chartData.occupied}
                vacant={chartData.vacant}
              />
            )}
          </div>
        </div>

        {/* Column 2 - Message Templates and Occupancy */}

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span className="flex flex-col gap-2">
                <CardDescription className="font-normal">
                  Recent
                </CardDescription>
                Communications Templates
              </span>
              <CardAction>
                <AddCommunicationDialog onAdd={handleAddCommunication} />
              </CardAction>
            </CardTitle>
          </CardHeader>
          <ScrollArea className="h-150">
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col gap-4">
                  <Skeleton className="h-42 w-full" />
                  <Skeleton className="h-42 w-full" />
                  <Skeleton className="h-42 w-full" />
                </div>
              ) : communicationsList.length === 0 ? (
                <Empty>
                  <EmptyMedia>
                    <MessageCircle className="h-8 w-8 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>No templates</EmptyTitle>
                  <EmptyDescription>
                    Create a communication template to get started.
                  </EmptyDescription>
                </Empty>
              ) : (
                <CommunicationList communications={communicationsList} />
              )}
            </CardContent>
          </ScrollArea>
        </Card>

        {/* <div className="flex-1"><ChartPieDonutActive /></div> */}

        {/* Column 3 - Maintenance Tickets */}
        <Card>
          <CardHeader>
            <CardDescription>Open</CardDescription>
            <CardTitle>Maintenance Tickets</CardTitle>
          </CardHeader>
          <ScrollArea className="h-150">
            <CardContent className="flex flex-col gap-4">
              {isLoading ? (
                <div className="flex flex-col gap-4">
                  <Skeleton className="h-42 w-full" />
                  <Skeleton className="h-42 w-full" />
                  <Skeleton className="h-42 w-full" />
                </div>
              ) : openTickets.length === 0 ? (
                <Empty>
                  <EmptyMedia>
                    <FolderCog className="h-8 w-8 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>All caught up</EmptyTitle>
                  <EmptyDescription>
                    No open maintenance tickets.
                  </EmptyDescription>
                </Empty>
              ) : (
                <TicketList tickets={openTickets} />
              )}
            </CardContent>
          </ScrollArea>
        </Card>

        {/* Full width - Recent Transactions */}
        <div className="flex flex-col xl:col-span-3 lg:col-span-2 space-y-4 mt-8">
          <CardTitle>Overdue Tenants</CardTitle>
          <Card className="p-0 overflow-hidden">
            {isLoading ? (
              <div className="p-4 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <TenantsTable filterStatus="Overdue" />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
