"use client";

import { Card, CardTitle } from "../../components/ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { MaintenanceTicketCard } from "../ui/ticket-card";
import type { Ticket } from "../../lib/seed/tickets";

interface MaintenanceTicketsProps {
  tickets: Ticket[];
  onView?: (id: number) => void;
}

export function MaintenanceTickets({
  tickets,
  onView,
}: MaintenanceTicketsProps) {
  return (
    <Card className="p-4 flex flex-col overflow-hidden lg:col-span-2 xl:col-span-1">
      <CardTitle className="mb-4">Maintenance Tickets</CardTitle>
      <ScrollArea className="h-150">
        <div className="flex flex-col gap-4">
          {tickets.map((ticket) => (
            <MaintenanceTicketCard
              key={ticket.id}
              ticket={ticket}
              onView={onView}
            />
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
