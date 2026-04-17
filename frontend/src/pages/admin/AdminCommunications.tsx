import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Eye,
  MessageCircle,
  TrendingUp,
  Users2,
  Send,
} from "lucide-react";
import {
  useAdminCommunications,
  useAdminCommunicationStats,
} from "@/hooks/useApiQueries";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { BarChart, Bar, XAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const monthlyChartConfig = {
  count: { label: "Messages", color: "var(--chart-1)" },
};

export default function AdminCommunications() {
  const { data: communications = [], isLoading } = useAdminCommunications();
  const { data: stats, isLoading: statsLoading } = useAdminCommunicationStats();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewBody, setViewBody] = useState<any>(null);

  const filteredCommunications = useMemo(() => {
    if (!searchTerm) return communications;
    const lower = searchTerm.toLowerCase();
    return communications.filter((c: any) => {
      return (
        c.propertyName?.toLowerCase().includes(lower) ||
        c.senderName?.toLowerCase().includes(lower) ||
        c.tenantName?.toLowerCase().includes(lower) ||
        c.title?.toLowerCase().includes(lower)
      );
    });
  }, [communications, searchTerm]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "senderName",
        header: "Sender",
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.senderName || "System"}
          </span>
        ),
      },
      {
        accessorKey: "propertyName",
        header: "Property",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.propertyName || "Platform"}
          </span>
        ),
      },
      {
        accessorKey: "tenantName",
        header: "Recipient",
        cell: ({ row }) => row.original.tenantName || "N/A",
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.title}</span>
        ),
      },
      {
        accessorKey: "channel",
        header: "Channel",
        cell: ({ row }) => {
          const ch = row.original.channel || "email";
          return (
            <Badge
              variant={ch === "sms" ? "outline" : "secondary"}
              className="capitalize shadow-none font-normal"
            >
              {ch === "sms" ? "SMS" : "Email"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Sent",
        cell: ({ row }) => {
          const date = row.original.createdAt;
          if (!date) return "N/A";
          return (
            <span className="text-muted-foreground text-sm">
              {formatDistanceToNow(new Date(date), { addSuffix: true })}
            </span>
          );
        },
      },
      {
        accessorKey: "view",
        header: "",
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewBody(row.original)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="p-6 flex flex-col space-y-6">
      <SiteHeader title="Communications Monitor" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex gap-2">
              <Send className="h-4 w-4 text-muted-foreground" />
              Total Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold">{stats?.total ?? 0}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold">{stats?.thisMonth ?? 0}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex gap-2">
              <Users2 className="h-4 w-4 text-muted-foreground" />
              Top Sender
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-xl font-semibold truncate">
                {stats?.topSender ?? "N/A"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Activity Chart */}
      {stats?.monthly && stats.monthly.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Activity</CardTitle>
            <CardDescription>
              Communication volume over the past 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={monthlyChartConfig} className="h-48 w-full">
              <BarChart data={stats.monthly} margin={{ left: -20, right: 10 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={12}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="count"
                  fill="var(--chart-1)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Search + Table */}
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by sender, recipient, title, or property..."
            className="pl-8 bg-background shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Card className="p-0 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <Table>
                <TableHeader className="bg-secondary">
                  <TableRow>
                    <TableHead className="font-semibold text-foreground">
                      Sender
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Property
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Recipient
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Title
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Channel
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Sent
                    </TableHead>
                    <TableHead className="font-semibold text-foreground"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-14" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <DataTable
                columns={columns}
                data={filteredCommunications}
                noDataChildren={
                  <Empty className="border-none w-full flex flex-col items-center justify-center py-6">
                    <EmptyMedia>
                      <MessageCircle className="h-8 w-8 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>No communications found</EmptyTitle>
                    <EmptyDescription>
                      {searchTerm
                        ? "No results match your search. Try a different query."
                        : "No communications have been sent on the platform yet."}
                    </EmptyDescription>
                  </Empty>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!viewBody} onOpenChange={(o) => !o && setViewBody(null)}>
        <DialogContent className="max-w-2xl bg-card border shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{viewBody?.title}</DialogTitle>
            <DialogDescription className="text-sm mt-1">
              Sent by <strong>{viewBody?.senderName}</strong>
              {viewBody?.tenantName && (
                <>
                  {" "}
                  to <strong>{viewBody?.tenantName}</strong>
                </>
              )}
              {viewBody?.propertyName && (
                <>
                  {" "}
                  at <strong>{viewBody?.propertyName}</strong>
                </>
              )}
              {viewBody?.channel && (
                <Badge
                  variant="outline"
                  className="ml-2 capitalize shadow-none font-normal"
                >
                  {viewBody.channel === "sms" ? "SMS" : "Email"}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 rounded-md bg-secondary/30 border border-muted text-sm whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
            {viewBody?.body || (
              <span className="text-muted-foreground italic">
                Message body empty or suppressed.
              </span>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
