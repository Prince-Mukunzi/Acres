import { useState } from "react";
import { useTenants } from "@/hooks/useApiQueries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkAsPaidDialog } from "../billing/MarkAsPaidDialog";
import { Skeleton } from "@/components/ui/skeleton";

export function RentCollectionTable() {
  const { data: tenants = [], isLoading } = useTenants(1, "");
  const [activeTab, setActiveTab] = useState<"overdue" | "dueSoon">("overdue");
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  const overdueTenants = tenants
    .filter((t) => t.status === "Overdue")
    .sort((a, b) => (b.daysOverdue ?? 0) - (a.daysOverdue ?? 0)); // Descending: 7 days late BEFORE 2 days late

  const dueSoonTenants = tenants
    .filter((t) => t.status !== "Overdue" && (t.daysOverdue ?? 0) >= -7)
    .sort((a, b) => {
      const aDays = a.daysOverdue ?? 0;
      const bDays = b.daysOverdue ?? 0;
      
      // If one is due soon (<= 0) and the other is Paid/Upcoming (> 0), put due soon first
      if (aDays <= 0 && bDays > 0) return -1;
      if (bDays <= 0 && aDays > 0) return 1;

      // If both are due soon, order by closest to 0 (e.g., -1 before -7)
      if (aDays <= 0 && bDays <= 0) return bDays - aDays;
      
      // If both are Paid/Upcoming, order them normally
      return aDays - bDays;
    });

  const displayedTenants =
    activeTab === "overdue" ? overdueTenants : dueSoonTenants;

  const getDueBadge = (tenant: any) => {
    const days = tenant.daysOverdue ?? 0;
    if (activeTab === "overdue") {
      if (days > 0) {
        return `${days} day${days === 1 ? "" : "s"} late`;
      }
      return "Overdue";
    }
    if (days < 0) {
      const absDays = Math.abs(days);
      return `Due in ${absDays} day${absDays === 1 ? "" : "s"}`;
    }
    if (days === 0) return "Due today";
    return "Upcoming";
  };

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-[200px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="mt-4">
      <div className="flex sm:flex-row flex-col items-start sm:items-center py-4 md:py-0 justify-between space-y-4">
        <div className="space-y-1">
          <CardTitle>Rent Collection</CardTitle>
          <CardDescription>
            Manage pending and upcoming payments.
          </CardDescription>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="w-60"
        >
          <TabsList>
            <TabsTrigger
              value="overdue"
              className=" data-[state=active]:bg-primary/10"
            >
              Overdue{" "}
              <Badge variant="destructive">{overdueTenants.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="dueSoon" className="">
              Due Soon <Badge variant="warning">{dueSoonTenants.length}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <Card className="p-0 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="pl-6">Tenant</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedTenants.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No {activeTab === "overdue" ? "overdue" : "upcoming"}{" "}
                    payments found.
                  </TableCell>
                </TableRow>
              ) : (
                displayedTenants.map((tenant) => (
                  <TableRow
                    key={tenant.id}
                    className="hover:bg-muted/50 border-b-border/30"
                  >
                    <TableCell className="font-semibold text-foreground pl-6">
                      {tenant.name}
                    </TableCell>
                    <TableCell>{tenant.unit || tenant.unitName}</TableCell>
                    <TableCell className={`font-medium`}>
                      RWF {(tenant.amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          activeTab === "overdue" ? "destructive" : "warning"
                        }
                      >
                        {getDueBadge(tenant)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTenant(tenant)}
                          className="bg-background"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4 text-muted-foreground" />
                          Mark as Paid
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 bg-background"
                        >
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        <MarkAsPaidDialog
          open={!!selectedTenant}
          onOpenChange={(open) => !open && setSelectedTenant(null)}
          tenant={selectedTenant}
        />
      </Card>
    </section>
  );
}
