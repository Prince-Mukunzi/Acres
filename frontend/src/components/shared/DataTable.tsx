"use client";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { z } from "zod";

import { useIsMobile } from "@/hooks/useMobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CircleCheckIcon,
  LoaderIcon,
  EllipsisVerticalIcon,
} from "lucide-react";
import { toast } from "sonner";

export const schema = z.object({
  id: z.number(),
  tenant: z.string(),
  unit: z.string(),
  status: z.string(),
  amount: z.string(),
  due: z.string(),
});

type Communication = z.infer<typeof schema>;

const columns: ColumnDef<Communication>[] = [
  {
    id: "number",
    header: "#",
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-xs">
        {row.index + 1}
      </span>
    ),
  },
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value: boolean) =>
          table.toggleAllPageRowsSelected(!!value)
        }
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "tenant",
    header: "Tenant",
    cell: ({ row }) => <TableCellViewer item={row.original} />,
  },
  {
    accessorKey: "unit",
    header: () => <div className="text-right">Unit</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium text-muted-foreground">
        {row.original.unit}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const isDone = row.original.status === "Done";
      return (
        <Badge
          variant={isDone ? "success" : "secondary"}
          className="gap-1 px-1.5 font-normal"
        >
          {isDone ? (
            <CircleCheckIcon className="size-3" />
          ) : (
            <LoaderIcon className="size-3 animate-spin" />
          )}
          {row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => (
      <div className="text-right font-semibold">{row.original.amount}</div>
    ),
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8" size="icon">
            <EllipsisVerticalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

// --- Simplified Headerless Row ---

export function DataTable({ data }: { data: Communication[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full">
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs uppercase tracking-wider font-semibold"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function TableCellViewer({ item }: { item: Communication }) {
  const isMobile = useIsMobile();
  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="p-0 h-auto text-foreground font-medium hover:no-underline"
        >
          {item.tenant}
        </Button>
      </DrawerTrigger>
      <DrawerContent
        className={!isMobile ? "h-full w-[400px] ml-auto rounded-l-xl" : ""}
      >
        <DrawerHeader>
          <DrawerTitle>{item.tenant}</DrawerTitle>
          <DrawerDescription>
            Unit {item.unit} details and history.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Tenant Name</Label>
            <Input defaultValue={item.tenant} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Unit</Label>
              <Input defaultValue={item.unit} />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Amount Due</Label>
              <Input defaultValue={item.amount} />
            </div>
          </div>
        </div>
        <DrawerFooter className="border-t">
          <Button onClick={() => toast.success("Changes saved")}>
            Update Details
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
