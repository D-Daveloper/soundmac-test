"use client";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

export default function Select({
  options,
  placeholder = "Select an option",
  selected,
  setSelected
}: {
  options: string[];
  placeholder?: string;
  selected: any;
  setSelected: Dispatch<SetStateAction<any>>;
}) {
  const [open, setOpen] = useState(false);
  const [opt, setopt] = useState(options);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const ref = useRef<HTMLDivElement>(null);

  const handleSelect = (option: string) => {
    console.log(option);
    setopt(options);
    
    setSelected((prev: any) => ({ ...prev,country: option }));
    setOpen(false);
  };

  // 🔹 Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

//   🔹 Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : options.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(options[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  };
  const handleChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
    const query = e.target.value.toLowerCase();
    setopt(options.filter(option => option.toLocaleLowerCase().includes(query)))
  }

  return (
    <div ref={ref} className="relative w-full text-lg sm:text-sm">
      {/* Trigger button */}
      <button
      type="button"
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
        className={" p-[0.66em] px-3 w-full flex justify-between items-center outline-1 rounded-lg hover:cursor-pointer line-clamp-1 truncate " +(selected.country? "" : "text-gray-400 font-extralight font-(family-name:--font-figtree)")}
      >
        {selected.country || placeholder}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-5 h-5 text-gray-500 transition-transform ${
            open ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown options */}
      {open && (
        <div className="absolute mt-2 w-full bg-white/50 border border-gray-200 rounded-lg shadow-lg z-10 transition-all duration-200 ease-in-out overflow-y-auto max-h-60 text-sm">
          <input type="search" className="w-full p-1" onChange={handleChange} placeholder="Search...."/>
          {opt.map((option, index) => (
            <button
            type="button"
              key={option}
              onClick={() => handleSelect(option)}
              className={`block w-full text-left px-4 py-2 
                ${index === highlightedIndex? "bg-blue-100": (typeof selected === "string" ? selected === option : selected?.country === option)? "bg-blue-50 text-primary"
                    : "text-p"
                } 
                hover:bg-blue-100`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
