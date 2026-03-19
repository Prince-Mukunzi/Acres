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

type TicketCardProps = {
  ticket: Ticket;
  onResolve?: (id: string) => void;
};

export function TicketCard({ ticket, onResolve }: TicketCardProps) {
  const [isResolved, setIsResolved] = useState(ticket.status === true);

  const handleResolve = async () => {
    try {
      await fetch(`/api/v1/ticket/${ticket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isResolved: true }),
      });
      setIsResolved(true);
      onResolve?.(ticket.id);
    } catch (error) {
      console.error("Failed to resolve ticket:", error);
    }
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
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button onClick={handleResolve} disabled={isResolved}>
            {isResolved ? "Resolved ✓" : "Mark as resolved"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type TicketListProps = {
  tickets: Ticket[];
  onResolve?: (id: string) => void;
};

export function TicketList({ tickets, onResolve }: TicketListProps) {
  return (
    <>
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} onResolve={onResolve} />
      ))}
    </>
  );
}
