import type { Ticket } from "@/types/ticket";

export const seedTickets: Ticket[] = [
  {
    id: crypto.randomUUID(),
    tenant: "Jane Smith",
    unit: "KH – F1D4",
    body: "The dishwasher is leaking significantly from the bottom during the rinse cycle...",
    createdAt: new Date("2025-11-15"),
    status: false,
  },
  {
    id: crypto.randomUUID(),
    tenant: "Robert Jones",
    unit: "KH – F3D2",
    body: "There is a persistent, loud dripping noise coming from inside the wall...",
    createdAt: new Date("2025-11-28"),
    status: false,
  },
  {
    id: crypto.randomUUID(),
    tenant: "Maria Rodriguez",
    unit: "KH – F5D1",
    body: "The main breaker for the living room and kitchen outlets trips constantly...",
    createdAt: new Date("2025-12-05"),
    status: false,
  },
];
