"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSession } from "@/context/session/useSession";
import type { ListSessionsWorker } from "@/workers/list-sessions-worker";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { releaseProxy, wrap, type Remote } from "comlink";
import { useEffect, useState } from "react";

type Option = {
  value: string;
  label: string;
};

export default function SessionCombobox() {
  const { sessionId, onSessionChange } = useSession();
  const [options, setOptions] = useState<Option[]>([]);
  const [open, setOpen] = useState(false);

  const [value, setValue] = useState("");

  useEffect(() => {
    const worker = new Worker(
      new URL("@/workers/list-sessions-worker.ts", import.meta.url),
      {
        type: "module",
        name: "ListSessionsWorker",
      },
    );

    const listSessionsFn: Remote<ListSessionsWorker> =
      wrap<ListSessionsWorker>(worker);

    const getSessions = async () => {
      const sessions = await listSessionsFn();
      setOptions(
        sessions.map((session) => ({ value: session, label: session })),
      );
    };

    getSessions();

    return () => {
      listSessionsFn[releaseProxy]();
      worker.terminate();
    };
  }, []);

  return (
    <div className="flex items-center space-x-4">
      <Popover
        open={open}
        onOpenChange={setOpen}
      >
        <PopoverTrigger asChild>
          <div className="flex min-w-max items-center justify-between">
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-start"
            >
              {value
                ? options.find((option) => option.value === value)?.label
                : sessionId}
              <CaretSortIcon className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="start"
          side="bottom"
        >
          <Command>
            <CommandInput
              className="focus-within:ring-0 focus:shadow-none focus:outline-none focus:outline-offset-0"
              placeholder="Search sessions..."
            />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                      onSessionChange(currentValue);
                    }}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
