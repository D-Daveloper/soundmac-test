"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface selectOptionProps {
  promotionPackage?: {
    value: string;
    label: string;
  }[];
  setValue: (value: string) => void;
  value: string;
  placeholder:string;
}

export function SelectOption({ promotionPackage,setValue,value,placeholder }: selectOptionProps) {
  const [open, setOpen] = React.useState(false)
  // const [value, setValue] = React.useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={"w-full max-w-[180px] flex truncate px-5 justify-between" + (value? " line-clamp-1 truncate" : " w-[180px]" )}
        >
          {value
            ? promotionPackage?.find((framework) => framework.value === value)?.label
            : placeholder+"..."}
          <ChevronsUpDown className={"opacity-50" +(value?" hidden":"")}/>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={"Search package..."} className="h-9" />
          <CommandList>
            <CommandEmpty>No Package found.</CommandEmpty>
            <CommandGroup>
              {promotionPackage?.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue) => {                    
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  {framework.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === framework.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
