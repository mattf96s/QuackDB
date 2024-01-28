"use client"

import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
import  { type PopoverProps } from "@radix-ui/react-popover"

import { useNavigate } from "@tanstack/react-router"
import * as React from "react"
import  { type Preset } from "./types"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"


interface PresetSelectorProps extends PopoverProps {
    presets: Preset[]
}

export default function PresetSelector({ presets, ...props }: PresetSelectorProps) {
    const [open, setOpen] = React.useState(false)
    const [selectedPreset, setSelectedPreset] = React.useState<Preset>()
    const navigate = useNavigate()
    return (
        <Popover open={open} onOpenChange={setOpen} {...props}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-label="Load a preset..."
                    aria-expanded={open}
                    className="flex-1 justify-between md:max-w-[200px] lg:max-w-[300px]"
                >
                    {selectedPreset ? selectedPreset.name : "Load a preset..."}
                    <CaretSortIcon className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="Search presets..." />
                    <CommandEmpty>No presets found.</CommandEmpty>
                    <CommandGroup heading="Examples">
                        {presets.map((preset) => (
                            <CommandItem
                                key={preset.id}
                                onSelect={() => {
                                    setSelectedPreset(preset)
                                    setOpen(false)
                                }}
                            >
                                {preset.name}
                                <CheckIcon
                                    className={cn(
                                        "ml-auto size-4",
                                        selectedPreset?.id === preset.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                    )}
                                />
                            </CommandItem>
                        ))}
                    </CommandGroup>
                    <CommandGroup className="pt-0">
                        <CommandItem onSelect={() => navigate({
                            to: "/presets"
                        })}>
                            More examples
                        </CommandItem>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}