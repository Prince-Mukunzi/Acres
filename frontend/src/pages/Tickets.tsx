"use client";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { TicketList } from "@/components/features/tickets/TicketCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { FolderCog } from "lucide-react";
import { useTickets } from "@/hooks/useApiQueries";

export default function Tickets() {
  const { data: tickets = [], isLoading } = useTickets(true); // queueOnly = true

  return (
    <div className="flex flex-col space-y-8">
      <SiteHeader title="Maintenance Tickets" />

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-42 w-full" />
            <Skeleton className="h-42 w-full" />
            <Skeleton className="h-42 w-full" />
            <Skeleton className="h-42 w-full" />
            <Skeleton className="h-42 w-full" />
            <Skeleton className="h-42 w-full" />
          </>
        ) : tickets.length === 0 ? (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 flex justify-center py-12">
            <Empty>
              <EmptyMedia>
                <FolderCog className="h-8 w-8 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>All caught up</EmptyTitle>
              <EmptyDescription>
                No open maintenance tickets.
              </EmptyDescription>
            </Empty>
          </div>
        ) : (
          <TicketList tickets={tickets} />
        )}
      </div>
    </div>
  );
}
