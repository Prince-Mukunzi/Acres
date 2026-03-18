import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
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
  cornerRadius = "none",
  className,
}: StatCardProps) {
  const radiusClasses = {
    tl: "rounded-none rounded-tl-xl",
    tr: "rounded-none rounded-tr-xl",
    bl: "rounded-none rounded-bl-xl",
    br: "rounded-none rounded-br-xl",
    none: "rounded-none",
  };

  return (
    <Card className={cn(radiusClasses[cornerRadius], className)}>
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
