import { Button } from "../ui/button";
import { Plus, Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";

type SearchBarProps = {
  placeholder?: string;
  onSearchChange?: (value: string) => void;
  onAdd?: () => void;
};

export function SearchBar({
  placeholder = "Search...",
  onSearchChange,
  onAdd,
}: SearchBarProps) {
  return (
    <InputGroup className="border-r-0 w-xs w-full">
      <InputGroupAddon>
        <Search className="h-4 w-4 text-muted-foreground" />
      </InputGroupAddon>

      <InputGroupInput
        placeholder={placeholder}
        onChange={(e) => onSearchChange?.(e.target.value)}
      />

      {onAdd && (
        <Button variant="outline" size="icon" onClick={onAdd}>
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </InputGroup>
  );
}
