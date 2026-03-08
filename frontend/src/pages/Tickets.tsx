"use client";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { seedTickets } from "../lib/seed/tickets";
import { SiteHeader } from "../components/layout/site-header";
import { Eye } from "lucide-react";

export default function Tickets() {
  return (
    <div className="flex flex-col space-y-8">
      <SiteHeader title="Maintenance Tickets" />
      <div className="px-4 pb-4">
        <div className="grid grid-col-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {seedTickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>{ticket.unit}</span>
                  <CardDescription>
                    {ticket.createdDate.toLocaleDateString("en-Us", {
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
                <Button variant={"outline"} className="w-full">
                  <Eye />
                  {ticket.status}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
