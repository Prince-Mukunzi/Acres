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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import type { Ticket } from "@/types/ticket";
import { useToggleTicketStatus } from "@/hooks/useApiMutations";

type TicketCardProps = {
  ticket: Ticket;
  onResolve?: (id: string) => void;
  isAdminView?: boolean;
};

export function TicketCard({ ticket, onResolve, isAdminView }: TicketCardProps) {
  const toggleMutation = useToggleTicketStatus();
  const [isResolved, setIsResolved] = useState(ticket.status === true);

  const handleResolve = async () => {
    toggleMutation.mutate({ id: ticket.id, isResolved: true }, {
      onSuccess: () => {
        setIsResolved(true);
        onResolve?.(ticket.id);
      }
    });
  };

  return (
    <Dialog>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>{ticket.unit}</span>
            <CardDescription>
              {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })}
            </CardDescription>
          </CardTitle>
          <CardDescription>{ticket.tenant}</CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm line-clamp-1">{ticket.body}</p>
        </CardContent>

        <CardFooter>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
          </DialogTrigger>
        </CardFooter>
      </Card>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ticket.unit}</DialogTitle>
          <DialogDescription>{ticket.tenant}</DialogDescription>
          <Separator />
          <p className="text-sm">{ticket.body}</p>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>

          {!isAdminView && (
            <Button onClick={handleResolve} disabled={isResolved}>
              {isResolved ? "Resolved" : "Mark as resolved"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type TicketListProps = {
  tickets: any[]; // Changed from strict Ticket[] to any[] so it can cleanly accept the new DTO from /api/v1/admin/tickets
  onResolve?: (id: string) => void;
  isAdminView?: boolean;
};

export function TicketList({ tickets, onResolve, isAdminView }: TicketListProps) {
  return (
    <>
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={{
          ...ticket, 
          tenant: isAdminView 
            ? `Landlord: ${ticket.tenant?.firstName || ticket.tenant || 'System'} | ${ticket.propertyName || 'N/A'}` 
            : `${ticket.tenant?.firstName || ticket.tenant} ${ticket.tenant?.lastName || ''}`,
          unit: ticket.unitName || ticket.unit || "Unknown Unit"
        } as any} onResolve={onResolve} isAdminView={isAdminView} />
      ))}
    </>
  );
}
