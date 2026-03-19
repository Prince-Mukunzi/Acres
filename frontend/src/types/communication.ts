export interface Communication {
  id: string;
  title: string;
  message: string;
  onEdit?: (communication: Communication) => void;
  onDelete?: (id: string) => void;
  onSend?: () => void;
}
