export interface Ticket {
  id: number;
  issuer: string;
  unit: string;
  issue: string;
  createdDate: Date;
  status: TicketStatus;
}
type TicketStatus = "view";

export const seedTickets: Ticket[] = [
  {
    id: 1,
    issuer: "Jane Smith",
    unit: "KH – F1D4",
    issue:
      "The dishwasher is leaking significantly from the bottom during the rinse cycle. The kitchen floor is getting wet, and I have to manually mop up water after every use. I've tried cleaning the filter, but the problem persists. This needs urgent attention to prevent water damage to the cabinets and the unit below.",
    createdDate: new Date("2025-11-15"),
    status: "view",
  },
  {
    id: 2,
    issuer: "Robert Jones",
    unit: "KH – F3D2",
    issue:
      "There is a persistent, loud dripping noise coming from inside the wall behind the main bathroom shower faucet. It sounds like a slow leak, and I'm concerned it could lead to mold or structural damage. The water pressure also seems lower than usual in the shower since the noise started about three days ago.",
    createdDate: new Date("2025-11-28"),
    status: "view",
  },
  {
    id: 3,
    issuer: "Maria Rodriguez",
    unit: "KH – F5D1",
    issue:
      "The main breaker for the living room and kitchen outlets trips constantly, even when only a few small appliances are plugged in. This has happened five times today alone. I believe the circuit might be overloaded or there's a short somewhere in the wiring. Could a licensed electrician please inspect the panel and the circuit to resolve this safety concern?",
    createdDate: new Date("2025-12-05"),
    status: "view",
  },
];
