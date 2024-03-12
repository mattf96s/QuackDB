import { ExternalLink, InfoIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";

export default function AboutModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
        >
          <InfoIcon size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] lg:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>About</DialogTitle>
          <DialogDescription>QuackDB</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-full">
          <p>
            {`QuackDB is a user-friendly, open-source online DuckDB SQL playground and editor. Designed for efficient prototyping, data tasks, and data visualization, it respects your privacy with a no-tracking policy.`}
          </p>
          <p className="py-4">
            Code available on{" "}
            <a
              target="_blank"
              href="https://github.com/mattf96s/QuackDB"
              rel="noreferrer"
              className="text-primary-500 inline-flex items-center gap-1 hover:underline"
            >
              GitHub
              <ExternalLink size={16} />
            </a>
            .
          </p>
        </ScrollArea>
        <DialogFooter>
          <DialogClose>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
