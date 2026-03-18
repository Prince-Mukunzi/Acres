import {
  Building2,
  CircleAlert,
  CircleCheckBig,
  UsersRoundIcon,
} from "lucide-react";
import { StatCard } from "../ui/stat-card";

interface DashboardStatsProps {
  totalUnits: number;
  totalTenants: number;
  collected: string;
  overdue: string;
}

export function DashboardStats({
  totalUnits,
  totalTenants,
  collected,
  overdue,
}: DashboardStatsProps) {
  return (
    <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2">
      <StatCard
        icon={Building2}
        title="Total Units"
        value={totalUnits}
        cornerRadius="tl"
      />
      <StatCard
        icon={UsersRoundIcon}
        title="Total Tenants"
        value={totalTenants}
        cornerRadius="tr"
      />
      <StatCard
        icon={CircleCheckBig}
        title="Collected"
        value={collected}
        cornerRadius="bl"
      />
      <StatCard
        icon={CircleAlert}
        title="Overdue"
        value={overdue}
        cornerRadius="br"
      />
    </div>
  );
}
