import { useState } from "react";
import { useCommunicationForm } from "@/hooks/useCommunication";
import { useTenants, useAdminUsers } from "@/hooks/useApiQueries";
import { useAdminSendCommunication } from "@/hooks/useApiMutations";
import type { Communication } from "@/types/communication";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type CommunicationDialogProps = {
  communication: Communication;
  isAdmin?: boolean;
};

export function CommunicationDialog({
  communication,
  isAdmin = false,
}: CommunicationDialogProps) {
  const {
    isOpen,
    setIsOpen,
    selectedTenants,
    setSelectedTenants,
    messageBody,
    setMessageBody,
    handleSend,
    handleCancel,
  } = useCommunicationForm(communication.message);

  const anchor = useComboboxAnchor();
  const adminAnchor = useComboboxAnchor();

  const { data: tenants = [] } = useTenants();
  const { data: adminUsers = [] } = useAdminUsers();
  const adminSend = useAdminSendCommunication();

  const [channel, setChannel] = useState<"email" | "sms">("email");
  const [audience, setAudience] = useState("all");
  const [selectedLandlord, setSelectedLandlord] = useState<string | null>(null);

  const tenantItems = tenants.map(
    (tenant) => `${tenant.name} — ${tenant.unit}`,
  );

  const landlordItems = adminUsers.map(
    (user: any) => `${user.name} — ${user.email}`,
  );

  const handleAdminSend = () => {
    let resolvedAudience = audience;
    if (audience === "landlord" && selectedLandlord) {
      const match = adminUsers.find(
        (u: any) => `${u.name} — ${u.email}` === selectedLandlord,
      );
      if (match) {
        resolvedAudience = `landlord:${match.id}`;
      } else {
        toast.error("Please select a valid user");
        return;
      }
    }

    adminSend.mutate(
      {
        audience: resolvedAudience,
        title: communication.title,
        body: messageBody,
        channel,
      },
      {
        onSuccess: (data: any) => {
          toast.success(data.message || "Communication sent");
          setIsOpen(false);
          setMessageBody(communication.message);
          setSelectedLandlord(null);
          setAudience("all");
        },
        onError: () => toast.error("Failed to send communication"),
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size={"sm"}
          onClick={() => communication.onEdit?.(communication)}
        >
          send
          <Send />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle>{communication.title}</DialogTitle>
          <DialogDescription>
            {isAdmin
              ? "Send a platform-wide communication to landlords"
              : "Please fill the required field to send communication"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {isAdmin ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="audience">Audience</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="plan:Free">Free Plan Users</SelectItem>
                    <SelectItem value="plan:Pro">Pro Plan Users</SelectItem>
                    <SelectItem value="plan:Enterprise">
                      Enterprise Plan Users
                    </SelectItem>
                    <SelectItem value="landlord">Specific Landlord</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {audience === "landlord" && (
                <div className="grid gap-2">
                  <Label htmlFor="landlord">Select Landlord</Label>
                  <Combobox
                    id="landlord"
                    autoHighlight
                    items={landlordItems}
                    value={selectedLandlord}
                    onValueChange={(val) => setSelectedLandlord(val)}
                  >
                    <ComboboxChips ref={adminAnchor} className="w-full">
                      <ComboboxValue>
                        {(values) => (
                          <>
                            {values.map((value: string) => (
                              <ComboboxChip key={value}>{value}</ComboboxChip>
                            ))}
                            <ComboboxChipsInput placeholder="Search users..." />
                          </>
                        )}
                      </ComboboxValue>
                    </ComboboxChips>

                    <ComboboxContent anchor={adminAnchor}>
                      <ComboboxEmpty>No users found.</ComboboxEmpty>
                      <ComboboxList>
                        {(item) => (
                          <ComboboxItem key={item} value={item}>
                            {item}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
              )}
            </>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="tenants">Recipients</Label>
              <Combobox
                id="tenants"
                required
                multiple
                autoHighlight
                items={tenantItems}
                value={selectedTenants}
                onValueChange={setSelectedTenants}
              >
                <ComboboxChips ref={anchor} className="w-full">
                  <ComboboxValue>
                    {(values) => (
                      <>
                        {values.map((value: string) => (
                          <ComboboxChip key={value}>{value}</ComboboxChip>
                        ))}
                        <ComboboxChipsInput placeholder="Select tenants..." />
                      </>
                    )}
                  </ComboboxValue>
                </ComboboxChips>

                <ComboboxContent anchor={anchor}>
                  <ComboboxEmpty>No tenants found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item} value={item}>
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="channel">Send via</Label>
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
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              placeholder="Type your message here..."
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="min-h-30"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>

          {isAdmin ? (
            <Button
              onClick={handleAdminSend}
              disabled={adminSend.isPending}
            >
              {adminSend.isPending ? "Sending..." : "Send Message"}{" "}
              <Send />
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (selectedTenants.length > 0) {
                  handleSend(communication.title, tenants);
                }
              }}
            >
              Send Message <Send />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
