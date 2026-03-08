"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export interface Ticket {
  id: number;
  issuer: string;
  unit: string;
  issue: string;
  createdDate: Date;
  status: TicketStatus;
}
type TicketStatus = "view";

interface MaintenanceTicketCardProps {
  ticket: Ticket;
  onView?: (id: number) => void;
}

export function MaintenanceTicketCard({
  ticket,
  onView,
}: MaintenanceTicketCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>{ticket.unit}</span>
          <CardDescription>
            {ticket.createdDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })}
          </CardDescription>
        </CardTitle>
        <CardDescription>{ticket.issuer}</CardDescription>
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-2">
          {ticket.issue}
        </CardDescription>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onView?.(ticket.id)}
        >
          <Eye />
          {ticket.status}
        </Button>
      </CardFooter>
    </Card>
  );
}
