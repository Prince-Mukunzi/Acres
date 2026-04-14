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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={Building2} title="Total Units" value={totalUnits} />
      <StatCard
        icon={UsersRoundIcon}
        title="Total Tenants"
        value={totalTenants}
      />
      <StatCard icon={CircleCheckBig} title="Collected" value={collected} />
      <StatCard icon={CircleAlert} title="Overdue" value={overdue} />
    </div>
  );
}
