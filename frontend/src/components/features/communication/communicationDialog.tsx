import { useCommunicationForm } from "@/hooks/useCommunication";
import { useTenants } from "@/hooks/useApiQueries";
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
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CommunicationDialogProps = {
  communication: Communication;
};

export function CommunicationDialog({
  communication,
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

  const { data: tenants = [] } = useTenants();

  // Convert tenants into searchable items
  const tenantItems = tenants.map(
    (tenant) => `${tenant.name} — ${tenant.unit}`,
  );

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
            Please fill the required field to send communication
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Recipients */}
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

          {/* Body */}
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

          <Button
            onClick={() => {
              if (selectedTenants.length > 0) {
                handleSend(communication.title, tenants);
              }
            }}
          >
            Send Message <Send />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
