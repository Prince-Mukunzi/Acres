import type { Unit } from "@/types/unit";

export const units: Unit[] = [
  {
    id: crypto.randomUUID(),
    name: "Apt 1",
    rentAmount: "RF 500,000",
    status: "Vacant",
    tenant: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Apt 2",
    rentAmount: "RF 500,000",
    status: "Occupied",
    tenant: "Mary Jane",
  },
  {
    id: crypto.randomUUID(),
    name: "Apt 3",
    rentAmount: "RF 600,000",
    status: "Vacant",
    tenant: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Apt 4",
    rentAmount: "RF 700,000",
    status: "Occupied",
    tenant: "Alice Smith",
  },
  {
    id: crypto.randomUUID(),
    name: "Apt 5",
    rentAmount: "RF 800,000",
    status: "Vacant",
    tenant: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Apt 6",
    rentAmount: "RF 900,000",
    status: "Occupied",
    tenant: "Bob Johnson",
  },
  {
    id: crypto.randomUUID(),
    name: "Apt 7",
    rentAmount: "RF 1,000,000",
    status: "Vacant",
    tenant: null,
  },
  {
    id: crypto.randomUUID(),
    name: "Apt 8",
    rentAmount: "RF 1,100,000",
    status: "Occupied",
    tenant: "Charlie Brown",
  },
];
