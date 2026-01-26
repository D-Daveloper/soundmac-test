"use client";
import React, { JSX, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
// import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addWeeks, isAfter, isBefore, startOfDay, subWeeks } from "date-fns";
interface Calendar22Props {
  setDate: (date: Date | undefined) => void;
  value: Date | undefined;
  disabled: boolean;
  type?: "first" | "second";
  releaseDate?: Date | undefined;
  fromYear?: Date | undefined;
  toYear?: Date | undefined;
  canBePast?: boolean;
}
export const SelectDate = React.memo(
  ({
    setDate,
    value,
    disabled,
    type,
    releaseDate,
    fromYear,
    toYear,
  }: Calendar22Props): JSX.Element => {
    const [open, setOpen] = useState(false);
  // Calculate disabled days based on type
  // const disabledDays = (date: Date) => {
  //   const today = new Date();
  //   const minUpload = addWeeks(today, 2); // 2 weeks after upload
  //   const minPreSave = addWeeks(today, 3); // 3 weeks after upload
  //   const oneWeekBeforeRelease = releaseDate ? addWeeks(releaseDate, -1) : null;

  //   // Common rule: no past dates
  //   if (canBePast == false){
  //     if (isBefore(date, today)){
  //       return true;
  //     }
  //   }
  //   if (type === "first") {
  //     // Release date must be at least 2 weeks after upload
  //     return isBefore(date, minUpload);
  //   }

  //   if (type === "second") {
  //     // Presave date must be at least 3 weeks after upload
  //     // AND at least 1 week before release date
  //     if (!releaseDate) return true; // can’t pick if release not chosen
  //     return isBefore(date, minPreSave) || isAfter(date, oneWeekBeforeRelease!);
  //   }

  //   return false;
  // };

    return (
      <div className="flex flex-col gap-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <Button
              variant="outline"
              id="date"
              className={
                "w-full justify-between font-normal px-3 rounded-lg border-2 p-[19px] outline-1 border-neutral-100 gap-3 mt-2 sm:text-sm text-[16px] " +
                (disabled ? " bg-disable" : " bg-transparent")
              }
            >
              {value != undefined? new Date(value).toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0 bg-white"
            align="start"
          >
            <Calendar
              // disabled={disabledDays}
              mode="single"
              selected={value}
              captionLayout="dropdown"
              onSelect={(date) => {
                setDate(date);
                setOpen(false);
              }}
              // startMonth={fromYear}
              endMonth={toYear}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

// import { CalendarIcon } from "lucide-react";
// import { format } from "date-fns";
// import { DayPicker } from "react-day-picker";
// import "react-day-picker/dist/style.css";

// interface SelectDateProps {
//   label?: string;
//   value?: Date;
//   onChange: (date: Date | undefined) => void;
//   placeholder?: string;
//   minDate?: Date;
//   maxDate?: Date;
//   required?: boolean;
// }

// export const PickDate: React.FC<SelectDateProps> = ({
//   label,
//   value,
//   onChange,
//   placeholder = "Select a date",
//   minDate,
//   maxDate,
//   required = false,
// }) => {
//   const [open, setOpen] = useState(false);

//   const handleDayClick = (date?: Date) => {
//     onChange(date);
//     setOpen(false);
//   };

//   return (
//     <div className="w-full">
//       {label && (
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           {label}
//           {required && <span className="text-red-500 ml-1">*</span>}
//         </label>
//       )}

//       <div className="relative">
//         <button
//           type="button"
//           onClick={() => setOpen(!open)}
//           className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-left text-sm text-gray-700 focus:ring-2 focus:ring-gray-300 focus:outline-none"
//         >
//           <span>
//             {value ? format(value, "dd/MM/yyyy") : (
//               <span className="text-gray-400">{placeholder}</span>
//             )}
//           </span>
//           <CalendarIcon className="w-4 h-4 text-gray-500" />
//         </button>

//         {open && (
//           <div className="absolute z-50 bg-white border rounded-lg shadow-md mt-2 p-2">
//             <DayPicker
//               mode="single"
//               selected={value}
//               onSelect={handleDayClick}
//               fromDate={minDate}
//               toDate={maxDate}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SelectDate;
