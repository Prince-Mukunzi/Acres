import { Trash2 } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Button } from "../../ui/button";
import type { Communication } from "@/types/communication";
import { CommunicationDialog } from "./communicationDialog";

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
        <CardAction className="w-full flex justify-between">
          {/* Dark Edit Button */}

          {/* Outline Send Button */}
          <CommunicationDialog communication={communication} />
          <Button
            size={"sm"}
            variant={"link"}
            onClick={communication.onEdit}
            className="hover:text-destructive"
          >
            Delete <Trash2 className="w-5 h-5" />
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
