import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  cornerRadius?: "tl" | "tr" | "bl" | "br" | "none";
  className?: string;
}

export function StatCard({
  icon: Icon,
  title,
  value,
  className,
}: StatCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex gap-2 items-center text-sm font-normal">
          <Icon strokeWidth={1.5} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <span className="text-xl font-semibold">{value}</span>
      </CardContent>
    </Card>
  );
}
