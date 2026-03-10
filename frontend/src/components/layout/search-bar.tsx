import { Button } from "../ui/button";
import { Plus, Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";

export function SearchBar({ placeholder = "Search..." }) {
  return (
    <InputGroup className="border-r-0 w-xs">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput id="input-button-group" placeholder={placeholder} />

      <Button variant="outline" size={"icon"}>
        <Plus />
      </Button>
    </InputGroup>
  );
}
