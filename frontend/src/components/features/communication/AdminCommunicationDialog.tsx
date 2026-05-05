import { useState } from "react";
import { useAdminUsers } from "@/hooks/useApiQueries";
import { useAdminSendCommunication } from "@/hooks/useApiMutations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Send, Mail, MessageSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type AdminCommunicationDialogProps = {
  trigger?: React.ReactNode;
};

export function AdminCommunicationDialog({
  trigger,
}: AdminCommunicationDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState<"email" | "sms">("email");
  const [audience, setAudience] = useState("all");

  const { data: adminUsers = [] } = useAdminUsers();
  const adminSend = useAdminSendCommunication();

  const resetForm = () => {
    setTitle("");
    setBody("");
    setChannel("email");
    setAudience("all");
  };

  const handleSend = () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message are required");
      return;
    }

    adminSend.mutate(
      {
        audience,
        title: title.trim(),
        body: body.trim(),
        channel,
      },
      {
        onSuccess: () => {
          setOpen(false);
          resetForm();
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetForm();
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Send className="h-4 w-4 mr-2" />
            Send Communication
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Communication</DialogTitle>
          <DialogDescription>
            Send a message to users on the platform
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="admin-audience">Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger id="admin-audience">
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="allTenants">All Tenants</SelectItem>
                <SelectItem value="plan:Free">Free Plan Users</SelectItem>
                <SelectItem value="plan:Pro">Pro Plan Users</SelectItem>
                <SelectItem value="plan:Enterprise">
                  Enterprise Plan Users
                </SelectItem>
                {adminUsers.map((user: any) => (
                  <SelectItem key={user.id} value={`landlord:${user.id}`}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="admin-channel">Send via</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={channel === "email" ? "default" : "outline"}
                onClick={() => setChannel("email")}
                className="flex-1"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
              <Button
                type="button"
                size="sm"
                variant={channel === "sms" ? "default" : "outline"}
                onClick={() => setChannel("sms")}
                className="flex-1"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                SMS
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="admin-title">Subject</Label>
            <Input
              id="admin-title"
              placeholder="Enter subject..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="admin-body">Message</Label>
            <Textarea
              id="admin-body"
              placeholder="Type your message here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-30"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={adminSend.isPending}>
            {adminSend.isPending ? "Sending..." : "Send Message"}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
