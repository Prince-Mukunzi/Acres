import { useState, useMemo } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { TicketList } from "@/components/features/tickets/TicketCard";
import { FolderCog, Search } from "lucide-react";
import { useAdminTickets } from "@/hooks/useApiQueries";

export default function TicketFeed() {
  const { data: tickets = [], isLoading } = useAdminTickets();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTickets = useMemo(() => {
    if (!searchTerm) return tickets;
    const lower = searchTerm.toLowerCase();
    return tickets.filter((t: any) => {
      const propMatch = t.propertyName?.toLowerCase().includes(lower);
      const unitMatch = t.unitName?.toLowerCase().includes(lower);
      return propMatch || unitMatch;
    });
  }, [tickets, searchTerm]);

  return (
    <div className="p-6 flex flex-col space-y-8">
      <SiteHeader title="Maintenance Feed" />

      <div className="px-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Filter by Property or Unit..."
            className="pl-8 bg-background shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="px-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-42 w-full" />
            <Skeleton className="h-42 w-full" />
            <Skeleton className="h-42 w-full" />
            <Skeleton className="h-42 w-full" />
          </>
        ) : filteredTickets.length === 0 ? (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 flex justify-center py-12">
            <Empty className="border-none w-full flex flex-col items-center justify-center py-6 bg-card rounded-md shadow-sm">
              <EmptyMedia>
                <FolderCog className="h-8 w-8 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>No tickets found</EmptyTitle>
              <EmptyDescription>
                We couldn't find any global tickets matching your filter
                criteria.
              </EmptyDescription>
            </Empty>
          </div>
        ) : (
          <TicketList tickets={filteredTickets} isAdminView={true} />
        )}
      </div>
    </div>
  );
}
