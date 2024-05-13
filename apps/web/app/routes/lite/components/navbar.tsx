import { MoreVertical } from "lucide-react";
import NavBar from "~/components/navbar";
import ModeToggle from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import Sources from "./sources";

export default function Nav() {
  return (
    <NavBar>
      <div className="ml-auto flex w-full items-center space-x-4 sm:justify-end">
        <ModeToggle />
        <Separator
          orientation="vertical"
          className="h-8"
        />
        <DataSources />
      </div>
    </NavBar>
  );
}

function DataSources() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
        >
          <MoreVertical size={16} />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Datasources</SheetTitle>
          <SheetDescription>
            Add a new datasource to your project.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <Sources />
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
