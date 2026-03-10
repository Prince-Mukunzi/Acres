import { Pencil, Send } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import type { Communication } from "@/types/communication";

type CommunicationProps = {
  communication: Communication;
};

export default function CommunicationCard({
  communication,
}: CommunicationProps) {
  return (
    <Card className="w-fill h-fit gap-2">
      <CardHeader>
        <CardTitle>{communication.title}</CardTitle>
      </CardHeader>

      <CardContent>
        <CardDescription className="line-clamp-2">
          {communication.message}
        </CardDescription>
      </CardContent>

      <CardFooter>
        <CardAction className="flex space-x-4">
          {/* Dark Edit Button */}
          <Button size={"sm"} onClick={communication.onEdit}>
            Edit <Pencil className="w-5 h-5" />
          </Button>

          {/* Outline Send Button */}
          <Button size={"sm"} variant="outline" onClick={communication.onSend}>
            Send <Send className="w-5 h-5" />
          </Button>
        </CardAction>
      </CardFooter>
    </Card>
  );
}

type CommunicationListProps = {
  communications: Communication[];
};
export function CommunicationList({ communications }: CommunicationListProps) {
  return (
    <div className="flex flex-col space-y-4">
      {communications.map((comm) => (
        <CommunicationCard key={comm.id} communication={comm} />
      ))}
    </div>
  );
}
