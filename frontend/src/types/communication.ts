export interface Communication {
  id: string;
  title: string;
  message: string;
  onEdit?: () => void;
  onSend?: () => void;
}
