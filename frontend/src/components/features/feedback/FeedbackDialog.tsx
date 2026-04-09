import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bug, Lightbulb, MessageSquare, Send, Loader2 } from "lucide-react";
import { useSubmitFeedback } from "@/hooks/useApiMutations";

const feedbackTypes = [
  {
    value: "BUG",
    label: "Bug Report",
    icon: Bug,
    description: "Something isn't working correctly",
    color: "text-destructive",
  },
  {
    value: "FEATURE",
    label: "Feature Request",
    icon: Lightbulb,
    description: "Suggest a new feature or improvement",
    color: "text-warning",
  },
  {
    value: "GENERAL",
    label: "General Feedback",
    icon: MessageSquare,
    description: "Share your thoughts with us",
    color: "text-success",
  },
] as const;

const severityOptions = [
  {
    value: "LOW",
    label: "Low",
    description: "Minor issue, no impact on usage",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    description: "Noticeable but workaround exists",
  },
  { value: "HIGH", label: "High", description: "Major feature affected" },
  { value: "CRITICAL", label: "Critical", description: "System is unusable" },
] as const;

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: "BUG" | "FEATURE" | "GENERAL";
}

export function FeedbackDialog({
  open,
  onOpenChange,
  defaultType = "GENERAL",
}: FeedbackDialogProps) {
  const [type, setType] = useState<"BUG" | "FEATURE" | "GENERAL">(defaultType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<
    "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  >("MEDIUM");
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useSubmitFeedback();

  const reset = () => {
    setType(defaultType);
    setTitle("");
    setDescription("");
    setSeverity("MEDIUM");
    setSubmitted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    submitMutation.mutate(
      { type, title: title.trim(), description: description.trim(), severity },
      {
        onSuccess: () => {
          setSubmitted(true);
          setTimeout(() => {
            reset();
            onOpenChange(false);
          }, 2000);
        },
      },
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) reset();
    onOpenChange(newOpen);
  };

  const selectedType = feedbackTypes.find((t) => t.value === type)!;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
              <div className="relative bg-green-500/10 border border-green-500/30 rounded-full p-4">
                <Send className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Thank you for your feedback!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                We'll review it and get back to you if needed.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-xl">Send Feedback</DialogTitle>
              <DialogDescription>
                Help us improve Acres by reporting bugs, requesting features, or
                sharing your thoughts.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 py-5">
              {/* Type selector cards */}
              <div className="grid grid-cols-3 gap-2">
                {feedbackTypes.map((ft) => {
                  const Icon = ft.icon;
                  const isSelected = type === ft.value;
                  return (
                    <button
                      key={ft.value}
                      type="button"
                      onClick={() =>
                        setType(ft.value as "BUG" | "FEATURE" | "GENERAL")
                      }
                      className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all hover:bg-accent/50 cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${isSelected ? ft.color : "text-muted-foreground"}`}
                      />
                      <span
                        className={`text-xs font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {ft.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Title */}
              <div className="grid gap-2">
                <Label htmlFor="feedback-title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="feedback-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    type === "BUG"
                      ? "e.g. Dashboard chart not loading"
                      : type === "FEATURE"
                        ? "e.g. Add bulk tenant import"
                        : "e.g. Great platform overall!"
                  }
                  required
                />
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="feedback-description">Description</Label>
                <Textarea
                  id="feedback-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    type === "BUG"
                      ? "Steps to reproduce: 1) Go to... 2) Click... 3) See error..."
                      : type === "FEATURE"
                        ? "Describe the feature and how it would help you..."
                        : "Tell us what's on your mind..."
                  }
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Severity — Only for bugs */}
              {type === "BUG" && (
                <div className="grid gap-2">
                  <Label htmlFor="feedback-severity">Severity</Label>
                  <Select
                    value={severity}
                    onValueChange={(v) =>
                      setSeverity(v as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL")
                    }
                  >
                    <SelectTrigger id="feedback-severity" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {severityOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                s.value === "CRITICAL"
                                  ? "destructive"
                                  : s.value === "HIGH"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="text-[10px] px-1.5 py-0"
                            >
                              {s.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {s.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || submitMutation.isPending}
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>Submit</>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
