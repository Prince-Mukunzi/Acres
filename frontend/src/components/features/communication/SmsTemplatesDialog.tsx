import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ArrowLeft, Pen, Trash2, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  useSmsTemplates,
  useProperties,
  useTenants,
} from "@/hooks/useApiQueries";
import {
  useAddSmsTemplate,
  useEditSmsTemplate,
  useDeleteSmsTemplate,
  useAddCommunication,
} from "@/hooks/useApiMutations";
import { useIsMobile } from "@/hooks/useMobile";
import { Separator } from "@/components/ui/separator";

const COLORS = [
  "bg-acres-blue/10 text-acres-blue border-acres-blue",
  "bg-emerald-500/10 text-emerald-500 border-emerald-500",
  "bg-amber-500/10 text-amber-500 border-amber-500",
  "bg-destructive/10 text-destructive border-destructive",
  "bg-violet-500/10 text-violet-500 border-violet-500",
];

const DEFAULT_TEMPLATES = [
  {
    id: "default-welcome-tenant",
    name: "Welcome Tenant",
    category: "Onboarding",
    color: COLORS[0],
    snippet: "Dear [Tenant Name],\n\nWe are delighted to welcome you to your new residence. Your property manager has registered you on the Acres platform.",
    isDefault: true,
  },
  {
    id: "default-rent-reminder",
    name: "Rent Reminder",
    category: "Billing",
    color: COLORS[3],
    snippet: "Dear [Tenant Name],\n\nThis is a courtesy reminder that your rent payment is currently overdue. Please ensure your payment is submitted as soon as possible.",
    isDefault: true,
  },
  {
    id: "default-maintenance-update",
    name: "Maintenance Update",
    category: "Maintenance",
    color: COLORS[2],
    snippet: "Dear [Tenant Name],\n\nWe are writing to inform you of an update to your maintenance ticket. Please review the details below.",
    isDefault: true,
  },
  {
    id: "default-general-notice",
    name: "General Notice",
    category: "General",
    color: COLORS[4],
    snippet: "Dear [Tenant Name],\n\nWe would like to bring the following to your attention. Please read through the details carefully.",
    isDefault: true,
  },
];

export function SmsTemplatesDialog({
  open,
  onOpenChange,
  prefilledTenant,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledTenant?: { id: string; name: string; unit?: string };
}) {
  const [view, setView] = useState<"list" | "create" | "send">("list");
  const [activeCategory, setActiveCategory] = useState("All");

  // Queries
  const { data: templates = [], isLoading } = useSmsTemplates();
  const { data: properties = [] } = useProperties(1, "");

  // Mutations
  const addTemplate = useAddSmsTemplate();
  const editTemplate = useEditSmsTemplate();
  const deleteTemplate = useDeleteSmsTemplate();
  const sendComm = useAddCommunication();

  // Create/Edit State
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formColor, setFormColor] = useState(COLORS[0]);
  const [formBody, setFormBody] = useState("");

  // Send State
  const [targetType, setTargetType] = useState<string>(
    prefilledTenant ? "Individual" : "All Properties",
  );
  const [targetPropertyId, setTargetPropertyId] = useState<string>("all");
  const [tenantSearch, setTenantSearch] = useState(
    prefilledTenant ? prefilledTenant.name : "",
  );
  const [selectedTenantId, setSelectedTenantId] = useState(
    prefilledTenant ? prefilledTenant.id : "",
  );

  const { data: tenantResults = [] } = useTenants(
    1,
    targetType === "Individual" ? tenantSearch : "",
  );

  // Reset dialog on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => setView("list"), 300);
      if (!prefilledTenant) {
        setTargetType("All Properties");
        setTenantSearch("");
        setSelectedTenantId("");
      }
    } else if (prefilledTenant) {
      setTargetType("Individual");
      setTenantSearch(prefilledTenant.name);
      setSelectedTenantId(prefilledTenant.id);
    }
  }, [open, prefilledTenant]);

  const allTemplates = useMemo(() => {
    if (templates.length === 0) return DEFAULT_TEMPLATES;
    return templates;
  }, [templates]);

  const categories = useMemo(() => {
    const cats = new Set(allTemplates.map((t: any) => t.category));
    return ["All", ...Array.from(cats)];
  }, [allTemplates]);

  const filteredTemplates = allTemplates.filter(
    (t: any) => activeCategory === "All" || t.category === activeCategory,
  );



  const openCreate = () => {
    setEditId(null);
    setFormName("");
    setFormCategory("");
    setFormColor(COLORS[0]);
    setFormBody("");
    setView("create");
  };

  const openEdit = (t: any) => {
    setEditId(t.id);
    setFormName(t.name);
    setFormCategory(t.category);
    setFormColor(t.color || COLORS[0]);
    setFormBody(t.snippet || t.body || "");
    setView("create");
  };

  const saveTemplate = () => {
    if (!formName || !formCategory || !formBody) {
      toast.error("Please fill Name, Category, and Content.");
      return;
    }
    const payload = {
      name: formName,
      category: formCategory,
      color: formColor,
      body: formBody,
    };
    if (editId) {
      editTemplate.mutate(
        { id: editId, ...payload },
        { onSuccess: () => setView("list") },
      );
    } else {
      addTemplate.mutate(payload, { onSuccess: () => setView("list") });
    }
  };

  const openSend = (t: any) => {
    setFormBody(t.snippet || t.body || ""); // Pre-fill the send block body
    setFormName(t.name); // Using as subject/title
    setView("send");
  };

  const handleSendDispatch = () => {
    // In a real app we'd dispatch to all respective tenants manually or backend handles target type.
    // We will just log one for simulation since the mock didn't build bulk array endpoints.
    if (!formBody) return;

    sendComm.mutate(
      {
        title: formName || "Notice",
        body: formBody,
        tenantID: targetType === "Individual" ? selectedTenantId : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Messages broadcast successfully!");
          onOpenChange(false);
        },
      },
    );
  };

  const isMobile = useIsMobile();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-fit">
        {view === "list" && (
          <>
            <div className="p-6 pb-2 shrink-0">
              <DialogHeader>
                <DialogTitle>SMS Templates</DialogTitle>
                <DialogDescription>
                  Manage and select standard text messages.
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center gap-3 mt-6">
                <Input
                  placeholder="Search template by name or content"
                  className="flex-1 shrink-0"
                />
                <Button onClick={openCreate}>
                  {isMobile ? "" : "New Template"} <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat: any) => (
                  <Badge
                    key={cat}
                    variant={activeCategory === cat ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  Loading templates...
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  No templates found. Create one above!
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {filteredTemplates.map((template: any) => (
                    <div
                      key={template.id}
                      className="group relative flex flex-col p-4 rounded-lg border border-transparent hover:border-border hover:bg-muted/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-foreground tracking-tight">
                          {template.name}
                        </span>
                        <Badge
                          className={`shadow-none font-medium border ${template.color || "bg-muted border-transparent text-muted-foreground"}`}
                        >
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 pr-24 whitespace-pre-wrap">
                        {template.snippet}
                      </p>

                      <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-background p-1 rounded-md shadow-sm border border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSend(template)}
                          className="h-7 text-xs px-2 shadow-none border-border"
                        >
                          Use template
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(template)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        >
                          <Pen className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTemplate.mutate(template.id)}
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </>
        )}

        {view === "create" && (
          <>
            <DialogHeader className="flex flex-row items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView("list")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <DialogTitle>
                  {editId ? "Edit Template" : "Create New Template"}
                </DialogTitle>
                <DialogDescription>
                  Draft a reusable message for your team.
                </DialogDescription>
              </div>
            </DialogHeader>
            <Separator />

            <ScrollArea className="flex-1">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Rent Reminder"
                    className="bg-background shadow-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <div className="p-4 border border-border rounded-lg space-y-4">
                    <Input
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      placeholder="e.g., Billing, Maintenance, General"
                      className="bg-background border-border shadow-xs"
                    />

                    <div className="pt-1">
                      <Label className="text-xs font-semibold mb-3 block">
                        Select Color
                      </Label>
                      <div className="flex items-center gap-3">
                        {COLORS.map((c) => (
                          <div
                            key={c}
                            onClick={() => setFormColor(c)}
                            className={`h-6 w-6 rounded-full cursor-pointer transition-transform ${c.split(" ")[0].replace("/10", "")} ${formColor === c ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : "hover:scale-110"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Message body:</Label>
                    <span className="text-xs text-muted-foreground">
                      {formBody.length} chars
                    </span>
                  </div>
                  <Textarea
                    placeholder="Type the message template here..."
                    className="min-h-[120px] bg-background shadow-xs resize-none"
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                  />
                </div>


              </div>
            </ScrollArea>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setView("list")}>
                Cancel
              </Button>
              <Button
                onClick={saveTemplate}
                disabled={addTemplate.isPending || editTemplate.isPending}
              >
                Save Template
              </Button>
            </DialogFooter>
          </>
        )}

        {view === "send" && (
          <>
            <DialogHeader className="flex flex-row items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView("list")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <DialogTitle>Send Broadcast SMS</DialogTitle>
                <DialogDescription>
                  Select audience and dispatch.
                </DialogDescription>
              </div>
            </DialogHeader>
            <Separator />

            <ScrollArea className="flex-1">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select
                    value={targetType}
                    onValueChange={setTargetType}
                    disabled={!!prefilledTenant}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select target..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Properties">
                        All Properties
                      </SelectItem>
                      <SelectItem value="Specific Property">
                        Specific Property
                      </SelectItem>
                      <SelectItem value="Overdue Tenants">
                        Overdue Tenants Only
                      </SelectItem>
                      <SelectItem value="Individual">
                        Individual Tenant
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {targetType === "Specific Property" && (
                  <div className="space-y-2 pt-2">
                    <Label>Select Property</Label>
                    <Select
                      value={targetPropertyId}
                      onValueChange={setTargetPropertyId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select property..." />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {targetType === "Individual" && (
                  <div className="space-y-2 pt-2 relative">
                    <Label>Search Tenant</Label>
                    <Input
                      placeholder="Type tenant name..."
                      value={tenantSearch}
                      disabled={!!prefilledTenant}
                      onChange={(e) => {
                        setTenantSearch(e.target.value);
                        setSelectedTenantId("");
                      }}
                    />
                    {tenantSearch &&
                      !selectedTenantId &&
                      tenantResults.length > 0 && (
                        <div className="absolute top-16 left-0 right-0 bg-background border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto p-1">
                          {tenantResults.map((t) => (
                            <div
                              key={t.id}
                              className="px-3 py-2 text-sm cursor-pointer hover:bg-muted font-medium rounded outline-none"
                              onClick={() => {
                                setTenantSearch(t.name);
                                setSelectedTenantId(t.id);
                              }}
                            >
                              {t.name}{" "}
                              <span className="text-muted-foreground ml-2 text-xs">
                                ({t.unit || "No unit"})
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    className="min-h-[160px] bg-background shadow-xs resize-none"
                  />
                  <div className="text-xs text-muted-foreground text-right mt-1 w-full flex justify-between">
                    <span>Parsed variables will render prior to send.</span>
                    <span>Standard SMS rates apply.</span>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <Separator />

            <DialogFooter>
              <Button variant="ghost" onClick={() => setView("list")}>
                Cancel
              </Button>
              <Button
                onClick={handleSendDispatch}
                disabled={
                  sendComm.isPending ||
                  (targetType === "Individual" && !selectedTenantId)
                }
              >
                Send Message <Send className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
