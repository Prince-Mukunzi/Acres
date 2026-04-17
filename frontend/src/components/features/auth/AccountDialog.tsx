import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateProfile } from "@/hooks/useApiMutations";
import { useDashboardStats } from "@/hooks/useApiQueries";
import { toast } from "sonner";
import { UserRound, Mail, Building2 } from "lucide-react";

function getPlanLabel(propertyCount: number): string {
  if (propertyCount === 0) return "Free";
  if (propertyCount <= 1) return "Free";
  if (propertyCount <= 3) return "Pro";
  return "Enterprise";
}

function getPlanVariant(plan: string): "outline" | "secondary" | "default" {
  if (plan === "Enterprise") return "default";
  if (plan === "Pro") return "secondary";
  return "outline";
}

export function AccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user, login } = useAuth();
  const [editName, setEditName] = useState(user?.name || "");
  const updateProfile = useUpdateProfile();
  const { data: stats } = useDashboardStats();

  const plan = getPlanLabel(stats?.totalProperties ?? 0);

  const initials = (user?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleSave = async () => {
    if (!editName.trim()) return;
    updateProfile.mutate(
      { name: editName.trim() },
      {
        onSuccess: (data) => {
          // Update local auth state so the sidebar reflects the new name immediately
          if (user && data?.user) {
            login({ ...user, name: data.user.name });
          } else if (user) {
            login({ ...user, name: editName.trim() });
          }
          toast.success("Profile updated");
          onOpenChange(false);
        },
        onError: () => {
          toast.error("Failed to update profile. Please try again.");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>My Account</DialogTitle>
          <DialogDescription>
            Manage your profile information.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 py-2">
          <Avatar className="h-20 w-20 ring-2 ring-border">
            <AvatarImage src={user?.picture || ""} alt={user?.name} />
            <AvatarFallback className="text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <Badge variant={getPlanVariant(plan)} className="shadow-none font-normal">
            {plan} Plan
          </Badge>
        </div>

        <Separator />

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <UserRound className="h-3.5 w-3.5" />
              Display Name
            </Label>
            <Input
              id="account-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Mail className="h-3.5 w-3.5" />
              Email Address
            </Label>
            <Input
              id="account-email"
              value={user?.email || ""}
              disabled
              className="bg-muted text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Email is managed by your Google account.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Building2 className="h-3.5 w-3.5" />
              Properties
            </Label>
            <Input
              value={stats?.totalProperties ?? "—"}
              disabled
              className="bg-muted text-muted-foreground"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              updateProfile.isPending ||
              !editName.trim() ||
              editName.trim() === user?.name
            }
          >
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
