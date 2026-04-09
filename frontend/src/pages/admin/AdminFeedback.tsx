import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bug,
  Search,
  Eye,
  Lightbulb,
  MessageSquare,
  Trash2,
  Loader2,
  User,
  Calendar,
} from "lucide-react";
import { useAdminFeedback } from "@/hooks/useApiQueries";
import {
  useUpdateFeedbackStatus,
  useDeleteFeedback,
} from "@/hooks/useApiMutations";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import type { Feedback } from "@/types/feedback";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const typeIcons: Record<string, typeof Bug> = {
  BUG: Bug,
  FEATURE: Lightbulb,
  GENERAL: MessageSquare,
};

const typeColors: Record<string, string> = {
  BUG: "text-red-500",
  FEATURE: "text-amber-500",
  GENERAL: "text-blue-500",
};

const severityVariants: Record<
  string,
  "destructive" | "secondary" | "outline"
> = {
  CRITICAL: "destructive",
  HIGH: "destructive",
  MEDIUM: "secondary",
  LOW: "outline",
};

const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  OPEN: "default",
  IN_PROGRESS: "secondary",
  RESOLVED: "outline",
  CLOSED: "outline",
};

export default function AdminFeedback() {
  const { data: feedback = [], isLoading } = useAdminFeedback();
  const updateStatus = useUpdateFeedbackStatus();
  const deleteFeedback = useDeleteFeedback();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewItem, setViewItem] = useState<Feedback | null>(null);

  const filteredFeedback = useMemo(() => {
    if (!searchTerm) return feedback;
    const lower = searchTerm.toLowerCase();
    return feedback.filter((f: Feedback) => {
      return (
        f.title?.toLowerCase().includes(lower) ||
        f.type?.toLowerCase().includes(lower) ||
        f.submittedBy?.toLowerCase().includes(lower) ||
        f.severity?.toLowerCase().includes(lower) ||
        f.status?.toLowerCase().includes(lower)
      );
    });
  }, [feedback, searchTerm]);

  const columns = useMemo<ColumnDef<Feedback>[]>(
    () => [
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const Icon = typeIcons[row.original.type] || MessageSquare;
          const color =
            typeColors[row.original.type] || "text-muted-foreground";
          return (
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-xs font-medium capitalize">
                {row.original.type === "BUG"
                  ? "Bug"
                  : row.original.type === "FEATURE"
                    ? "Feature"
                    : "General"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <span className="font-medium truncate max-w-[200px] block">
            {row.original.title}
          </span>
        ),
      },
      {
        accessorKey: "submittedBy",
        header: "Submitted By",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm">
              {row.original.submittedBy || "Unknown"}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.original.submitterEmail || ""}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "severity",
        header: "Severity",
        cell: ({ row }) => (
          <Badge
            variant={severityVariants[row.original.severity] || "secondary"}
          >
            {row.original.severity}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Select
            value={row.original.status}
            onValueChange={(v) =>
              updateStatus.mutate({
                id: row.original.id,
                status: v as Feedback["status"],
              })
            }
          >
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => {
          const date = row.original.createdAt;
          if (!date) return "N/A";
          return (
            <span className="text-xs text-muted-foreground">
              {format(new Date(date), "PPp")}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewItem(row.original)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteFeedback.mutate(row.original.id)}
              disabled={deleteFeedback.isPending}
            >
              {deleteFeedback.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 text-destructive" />
              )}
            </Button>
          </div>
        ),
      },
    ],
    [updateStatus, deleteFeedback],
  );

  return (
    <div className="p-6 flex flex-col space-y-4">
      <SiteHeader title="Feedback & Bug Reports" />

      <div className="px-4 pt-2">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search feedback..."
            className="pl-8 bg-background shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="p-4 space-y-6 pt-2">
        <Card className="p-0 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <Table>
                <TableHeader className="bg-secondary">
                  <TableRow>
                    {[
                      "Type",
                      "Title",
                      "Submitted By",
                      "Severity",
                      "Status",
                      "Date",
                      "Actions",
                    ].map((h) => (
                      <TableHead
                        key={h}
                        className="font-semibold text-foreground"
                      >
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-5 w-24" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <DataTable
                columns={columns}
                data={filteredFeedback}
                noDataChildren={
                  <Empty className="border-none w-full flex flex-col items-center justify-center py-6">
                    <EmptyMedia>
                      <Bug className="h-8 w-8 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>No feedback yet</EmptyTitle>
                    <EmptyDescription>
                      No feedback or bug reports have been submitted.
                    </EmptyDescription>
                  </Empty>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <DialogContent className="max-w-2xl bg-card border shadow-xl">
          {viewItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  {(() => {
                    const Icon = typeIcons[viewItem.type] || MessageSquare;
                    const color = typeColors[viewItem.type] || "";
                    return (
                      <>
                        <Icon className={`h-5 w-5 ${color}`} />
                        <DialogTitle className="text-xl">
                          {viewItem.title}
                        </DialogTitle>
                      </>
                    );
                  })()}
                </div>
                <DialogDescription className="space-y-4 text-sm mt-1">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <strong>{viewItem.submittedBy || "Unknown"}</strong>
                    {viewItem.submitterEmail && (
                      <> ({viewItem.submitterEmail})</>
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />{" "}
                    {format(new Date(viewItem.createdAt), "PPpp")}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 p-4 rounded-md bg-secondary/30 border border-muted text-sm whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
                {viewItem.description || (
                  <span className="text-muted-foreground italic">
                    No description provided.
                  </span>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
