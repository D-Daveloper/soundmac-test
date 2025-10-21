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
  classname1?: string;
  classname2?:string
}
export function SelectOption2({ promotionPackage,setValue,value,placeholder,classname1,classname2 }: selectOptionProps) {
  const [open, setOpen] = React.useState(false)
  // const [value, setValue] = React.useState("")

  return (
    <Popover open={open} onOpenChange={setOpen} >
        
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={classname2}
        >
          {value? value
            : placeholder+"..."}
          <ChevronsUpDown className={classname1}/>
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
