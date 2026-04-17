import { useMemo } from "react";
import {
  Card,
  CardTitle,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Send,
  Ban,
  KeyRound,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useAdminOverviewStats } from "@/hooks/useApiQueries";
import { useImpersonateUser, useToggleSuspend } from "@/hooks/useApiMutations";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Label,
  Rectangle,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { ColumnDef } from "@tanstack/react-table";
import { format, formatDistanceToNow } from "date-fns";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const chartConfig = {
  users: {
    label: "Platform Users:",
    color: "var(--chart-1)",
  },
  properties: {
    label: "Active Properties",
    color: "var(--chart-2)",
  },
};

const pieChartConfig = {
  pindo: { label: "Pindo SMS", color: "var(--chart-1)" },
  resend: { label: "Resend Emails", color: "var(--chart-5)" },
};
const subsChartConfig = {
  Enterprise: { label: "Enterprise", color: "var(--success)" },
  Pro: { label: "Pro", color: "var(--warning)" },
  Free: { label: "Free", color: "var(--chart-1)" },
};

export default function AdminOverview() {
  const { data, isLoading } = useAdminOverviewStats();
  const toggleSuspend = useToggleSuspend();
  const impersonateUser = useImpersonateUser();
  const { user: currentUser, login } = useAuth();

  const handleToggleSuspend = (id: string, name: string) => {
    if (id === currentUser?.id) {
      toast.error("You cannot suspend yourself.");
      return;
    }
    toggleSuspend.mutate(id, {
      onSuccess: () => toast.success(`Toggled suspension for ${name}`),
      onError: () => toast.error("Failed to update suspension status"),
    });
  };

  const handleImpersonate = (id: string, name: string) => {
    if (id === currentUser?.id) {
      toast.error("You are already this user.");
      return;
    }
    const loadingToast = toast.loading(
      `Generating secure session for ${name}...`,
    );
    impersonateUser.mutate(id, {
      onSuccess: (res: any) => {
        toast.dismiss(loadingToast);
        toast.success(`Successfully impersonating ${name}`);
        login(res.user);
        window.location.href = "/dashboard";
      },
      onError: () => {
        toast.dismiss(loadingToast);
        toast.error("Failed to generate impersonation session");
      },
    });
  };

  const TopStatCard = ({
    title,
    value,
    percentage,
    positive,
  }: {
    title: string;
    value: number;
    percentage: string;
    positive: boolean;
  }) => (
    <Card>
      <CardHeader className="flex-1 flex justify-between space-y-0.5">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between text-3xl font-bold text-foreground">
        <span>{value.toLocaleString()}</span>
        <Badge
          className="text-xs"
          variant={positive ? "success" : "destructive"}
        >
          {positive ? (
            <TrendingUp className="mr-1 h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="mr-1 h-3.5 w-3.5" />
          )}
          {percentage}
        </Badge>
      </CardContent>
    </Card>
  );

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.email}
          </span>
        ),
      },
      {
        accessorKey: "plan",
        header: "Plan",
        cell: ({ row }) => {
          const plan = row.original.plan;
          const variant =
            plan === "Enterprise"
              ? "success"
              : plan === "Pro"
                ? "default"
                : "outline";
          return (
            <Badge
              variant={variant as any}
              className="font-normal capitalize shadow-none"
            >
              {plan}
            </Badge>
          );
        },
      },
      {
        accessorKey: "infrastructure",
        header: "Infrastructure",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.infrastructure}
          </span>
        ),
      },
      {
        accessorKey: "joined",
        header: "Joined",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.joined
              ? format(new Date(row.original.joined), "MMM d, yyyy")
              : "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "lastLogin",
        header: "Last Login",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.lastLogin
              ? formatDistanceToNow(new Date(row.original.lastLogin), {
                  addSuffix: true,
                })
              : "Never"}
          </span>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => {
          const u = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    toast("Messaging system not yet integrated", { icon: "💬" })
                  }
                >
                  <Send className="mr-2 h-4 w-4 text-muted-foreground" />
                  Send communication
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleImpersonate(u.id, u.name)}
                >
                  <KeyRound className="mr-2 h-4 w-4 text-muted-foreground" />
                  Impersonate user
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleToggleSuspend(u.id, u.name)}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  {u.isSuspended ? "Unsuspend User" : "Suspend User"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [currentUser?.id],
  );

  if (isLoading || !data) {
    return (
      <div className="flex flex-col p-6 space-y-8 bg-background/50 min-h-screen">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>

        {/* Stat Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6 space-y-3">
              <div className="flex justify-between items-start">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 h-80 flex flex-col space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="flex-1 w-full" />
          </Card>
          <Card className="p-6 h-80 flex flex-col items-center justify-center space-y-4">
            <Skeleton className="h-5 w-40 self-start" />
            <Skeleton className="h-48 w-48 rounded-full" />
          </Card>
          <Card className="p-6 h-80 flex flex-col space-y-4">
            <Skeleton className="h-5 w-24" />
            <div className="flex items-end justify-center space-x-3 flex-1">
              <Skeleton className="h-[40%] w-20" />
              <Skeleton className="h-[60%] w-20" />
              <Skeleton className="h-[80%] w-20" />
            </div>
          </Card>
        </div>

        {/* Table Skeleton */}
        <div className="space-y-4 pt-4">
          <Skeleton className="h-6 w-48" />
          <Card className="overflow-hidden p-0">
            <Table>
              <TableHeader className="bg-secondary">
                <TableRow>
                  <TableHead className="font-semibold text-foreground">
                    Name
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Email
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Plan
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Infrastructure
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Joined
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Last Login
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
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
          </Card>
        </div>
      </div>
    );
  }

  const {
    topCards,
    trends,
    growthData,
    communications,
    subscriptions,
    recentUsers,
  } = data;

  const subsData = [
    {
      plan: "Enterprise",
      count: subscriptions.enterprise || 0,
      fill: "var(--success)",
    },
    { plan: "Pro", count: subscriptions.pro || 0, fill: "var(--warning)" },
    {
      plan: "Free",
      count: subscriptions.free || 0,
      fill: "var(--secondary)",
    },
  ];
  const ACTIVE_INDEX = 0;

  const pieData = [
    {
      browser: "pindo",
      visitors: communications.pindo,
      fill: "var(--chart-1)",
    },
    {
      browser: "resend",
      visitors: communications.resend,
      fill: "var(--chart-5)",
    },
  ];

  return (
    <div className="flex flex-col p-6 space-y-8 bg-background/50 min-h-screen">
      <SiteHeader title="Overview" />

      {/* Top Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TopStatCard
          title="Total Properties"
          value={topCards.totalProperties}
          percentage={trends.properties.percentage}
          positive={trends.properties.positive}
        />
        <TopStatCard
          title="Active Landlords"
          value={topCards.activeLandlords}
          percentage={trends.activeLandlords?.percentage ?? "0%"}
          positive={trends.activeLandlords?.positive ?? true}
        />
        <TopStatCard
          title="Total Tenants"
          value={topCards.totalTenants}
          percentage={trends.tenants.percentage}
          positive={trends.tenants.positive}
        />
        <TopStatCard
          title="Total Tickets"
          value={topCards.totalTickets}
          percentage={trends.tickets.percentage}
          positive={trends.tickets.positive}
        />
      </div>

      {/* Triple Grid Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Area Chart */}
        <Card className="col-span-1 shadow-sm border pb-4">
          <CardHeader>
            <CardTitle>Platform Growth</CardTitle>
            <CardDescription>In the past 6 months</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <ChartContainer config={chartConfig} className="h-56 w-full mt-2">
              <AreaChart data={growthData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={12}
                  tickFormatter={(value: number) => `${value}`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <defs>
                  <linearGradient
                    id="fillUsersSplit"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--color-users)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-users)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="var(--color-users)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#fillUsersSplit)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Communication Pie Chart */}
        <Card className="col-span-1 shadow-sm border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Communication Activity
            </CardTitle>
            <CardDescription>Total messages sent</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center pb-4">
            <ChartContainer
              config={pieChartConfig}
              className="mx-auto aspect-square max-h-56 w-full"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Pie
                  data={pieData}
                  dataKey="visitors"
                  nameKey="browser"
                  innerRadius={50}
                  outerRadius={90}
                  strokeWidth={4}
                >
                  <Label
                    content={({ viewBox }: any) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              fontSize={24}
                              fontWeight="bold"
                              fill="currentColor"
                            >
                              {communications.total}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 22}
                              fontSize={11}
                              fill="currentColor"
                              opacity={0.6}
                            >
                              total
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Subscriptions Bar Chart */}
        <Card className="col-span-1 shadow-sm border">
          <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
            <CardDescription>Breakdown by plan tier</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={subsChartConfig}>
              <BarChart accessibilityLayer data={subsData}>
                <XAxis
                  dataKey="plan"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) =>
                    subsChartConfig[value as keyof typeof subsChartConfig]
                      ?.label
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="count"
                  strokeWidth={2}
                  radius={12}
                  shape={({ index, ...props }: any) =>
                    index === ACTIVE_INDEX ? (
                      <Rectangle
                        {...props}
                        fillOpacity={0.8}
                        stroke={props.payload.fill}
                        strokeDasharray={4}
                        strokeDashoffset={4}
                      />
                    ) : (
                      <Rectangle {...props} />
                    )
                  }
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Database Table Section */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Recent Subscriptions
        </h2>
        <Card className="p-0 overflow-hidden">
          <DataTable
            columns={columns}
            data={recentUsers}
            noDataChildren={null}
          />
        </Card>
      </div>
    </div>
  );
}
