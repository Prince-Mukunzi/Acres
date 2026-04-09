export interface Feedback {
  id: string;
  type: "BUG" | "FEATURE" | "GENERAL";
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt?: string;
  submittedBy?: string;
  submitterEmail?: string;
}
