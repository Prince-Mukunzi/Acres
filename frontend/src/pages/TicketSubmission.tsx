import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { CheckCheck } from "lucide-react";
export default function SubmitTicket() {
  const { propertyName, unitName } = useParams();
  const [issue, setIssue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitName: decodeURIComponent(unitName || ""),
          title: `Issue from ${decodeURIComponent(unitName || "unit")}`,
          description: issue,
        }),
      });

      if (res.ok) {
        setIsSubmitted(true);
      } else {
        console.error("Failed to submit ticket");
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-3 rounded-full w-fit mb-4">
              <CheckCheck className="size-10 text-success dark:text-success" />
            </div>
            <CardTitle>Ticket Submitted!</CardTitle>
            <CardDescription>
              Your maintenance request has been received. Our team will look
              into it shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setIsSubmitted(false)}
            >
              Submit Another Issue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Ticket Form</CardTitle>
          <CardDescription>
            Report an issue for your unit. Please be as descriptive as possible.
          </CardDescription>
          {(propertyName || unitName) && (
            <div className="bg-muted px-2 py-1 rounded text-xs font-mono w-fit border flex gap-2">
              <span className="opacity-70">Property:</span>
              <span className="font-bold">
                {decodeURIComponent(propertyName || "")}
              </span>
              <span className="opacity-40">|</span>
              <span className="opacity-70">Unit:</span>
              <span className="font-bold">
                {decodeURIComponent(unitName || "")}
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="issue" className="text-sm font-medium">
                Describe the issue
              </Label>
              <Textarea
                id="issue"
                placeholder="Ex: The kitchen faucet is leaking..."
                className="h-32"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !issue.trim()}
            >
              {isLoading ? "Submitting..." : "Submit Ticket"}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              By submitting, you agree to allow maintenance personnel to enter
              your unit if necessary.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
