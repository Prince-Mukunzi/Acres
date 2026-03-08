import { Pencil, Send } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DynamicReminderProps {
  title: string;
  message: string;
  onEdit?: () => void;
  onSend?: () => void;
}

export default function Communication({
  title,
  message,
  onEdit,
  onSend,
}: DynamicReminderProps) {
  return (
    <Card className="w-fill h-fit gap-2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <CardDescription className="line-clamp-2">{message}</CardDescription>
      </CardContent>

      <CardFooter>
        <CardAction className="flex space-x-4">
          {/* Dark Edit Button */}
          <Button size={"sm"} onClick={onEdit}>
            Edit <Pencil className="w-5 h-5" />
          </Button>

          {/* Outline Send Button */}
          <Button size={"sm"} variant="outline" onClick={onSend}>
            Send <Send className="w-5 h-5" />
          </Button>
        </CardAction>
      </CardFooter>
    </Card>
  );
}
