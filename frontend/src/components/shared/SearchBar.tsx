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
    <InputGroup className="w-xs md:w-md">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>

      <InputGroupInput
        placeholder={placeholder}
        onChange={(e) => onSearchChange?.(e.target.value)}
      />

      {onAdd && (
        <Button variant="outline" size="icon" onClick={onAdd}>
          <Plus />
        </Button>
      )}
    </InputGroup>
  );
}
