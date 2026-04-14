import type { Property } from "@/types/property";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Download,
  FolderCog,
  MoreHorizontalIcon,
  Pencil,
  SquaresUnite,
  Trash2Icon,
  Users2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type PropertyCardProps = {
  property: Property;
  isActive?: boolean;
  onSelect?: (property: Property) => void;
  onEdit?: (property: Property) => void;
  onDownload?: (property: Property) => void;
  onDelete?: (property: Property) => void;
  isAdminView?: boolean;
};

export function PropertyCard({
  property,
  isActive,
  onSelect,
  onEdit,
  onDownload,
  onDelete,
  isAdminView,
}: PropertyCardProps) {
  const { isMobile } = useSidebar();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <Card
        onClick={() => onSelect?.(property)}
        className={cn(
          "cursor-pointer hover:bg-accent transition-colors",
          isActive && "bg-accent border-primary/20 shadow-sm",
        )}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{property.name}</CardTitle>
              <CardDescription>{property.address}</CardDescription>
              {isAdminView && property.owner_name && (
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  Landlord: {property.owner_name}
                </CardDescription>
              )}
            </div>
          </div>
          {!isAdminView && (
            <CardAction>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={"outline"} size={"icon-xs"}>
                    <MoreHorizontalIcon />
                    <span className="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(property);
                    }}
                  >
                    <Pencil />
                    <span>Edit Property</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload?.(property);
                    }}
                  >
                    <Download />
                    <span>Download Report</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2Icon />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardAction>
          )}
        </CardHeader>
        <CardContent className="flex space-x-2">
          <CardDescription className="flex space-x-2">
            <SquaresUnite size={16} />
            <p className="text-xs">{property.units} units</p>
          </CardDescription>
          <CardDescription className="flex space-x-2">
            <Users2 size={16} />
            <p className="text-xs">{property.tenants} tenants</p>
          </CardDescription>
          <CardDescription className="flex space-x-2">
            <FolderCog size={16} />
            <p className="text-xs">{property.tickets} tickets</p>
          </CardDescription>
        </CardContent>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "<strong>{property.name}</strong>"
              and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(property);
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete Property
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

type PropertyListProps = {
  properties: Property[];
  activeId?: string;
  onSelect?: (property: Property) => void;
  onEdit?: (property: Property) => void;
  onDownload?: (property: Property) => void;
  onDelete?: (property: Property) => void;
  isAdminView?: boolean;
};

export function PropertyList({
  properties,
  activeId,
  onSelect,
  onEdit,
  onDownload,
  onDelete,
  isAdminView,
}: PropertyListProps) {
  return (
    <div className="flex flex-col gap-4">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          isActive={property.id === activeId}
          onSelect={onSelect}
          onEdit={onEdit}
          onDownload={onDownload}
          onDelete={onDelete}
          isAdminView={isAdminView}
        />
      ))}
    </div>
  );
}
