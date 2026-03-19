"use client";



import { TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";

export const description = "A donut chart with text";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  occupied: {
    label: "Occupied",
    color: "var(--chart-1)",
  },
  vacant: {
    label: "Vacant",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

interface PieChartProps {
  occupied?: number;
  vacant?: number;
}

export function PieChartDefault({ occupied = 0, vacant = 0 }: PieChartProps) {
  const chartData = [
    { browser: "occupied", visitors: occupied, fill: "var(--color-occupied)" },
    { browser: "vacant", visitors: vacant, fill: "var(--color-vacant)" },
  ];

  const totalUnits = occupied + vacant;

  if (totalUnits === 0) {
    return (
      <Card className="flex flex-col h-full min-h-[430px] justify-center">
        <Empty>
          <EmptyMedia>
            <PieChartIcon className="h-8 w-8 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>No unit data</EmptyTitle>
          <EmptyDescription>
            Add units to see occupancy records.
          </EmptyDescription>
        </Empty>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full min-h-[430px]">
      <CardHeader className="items-center pb-0">
        <CardTitle>Occupied vs Vacant</CardTitle>
        <CardDescription>Unit Trend</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
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
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalUnits.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Units
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {occupied} occupied, {vacant} vacant <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Live data from database
        </div>
      </CardFooter>
    </Card>
  );
}

