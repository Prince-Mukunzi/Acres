import type { Property } from "@/types/property";

export const properties: Property[] = [
  {
    id: crypto.randomUUID(),
    name: "ALU Hostels",
    address: "KN 123 ST Bumbogo",
    units: 12,
    tenants: 34,
    tickets: 4,
  },
  {
    id: crypto.randomUUID(),
    name: "Kigali Heights",
    address: "KN 123 ST Kacyiru",
    units: 120,
    tenants: 120,
    tickets: 7,
  },
  {
    id: crypto.randomUUID(),
    name: "Chic Building",
    address: "KN 123 ST DownTown",
    units: 260,
    tenants: 249,
    tickets: 23,
  },
  {
    id: crypto.randomUUID(),
    name: "Makuza Building",
    address: "KN 123 ST Town",
    units: 190,
    tenants: 142,
    tickets: 43,
  },
];
