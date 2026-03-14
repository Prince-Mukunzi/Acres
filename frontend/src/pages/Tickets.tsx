"use client";

import { seedTickets } from "../lib/seed/tickets";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TicketList } from "@/components/features/tickets/TicketCard";

export default function Tickets() {
  return (
    <div className="flex flex-col space-y-8">
      <SiteHeader title="Maintenance Tickets" />

      <div className="p-4 grid grid-col-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <TicketList tickets={seedTickets} />
      </div>
    </div>
  );
}
