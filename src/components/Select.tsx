"use client";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

export default function Select({
  options,
  placeholder = "Select an option",
  selected,
  setSelected,
  name,
  isDisabled
}: {
  isDisabled?:boolean;
  name:string
  options: string[];
  placeholder?: string;
  selected: string;
  setSelected: (text:string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [opt, setopt] = useState(options);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const ref = useRef<HTMLDivElement>(null);

  const handleSelect = (option: string) => {
    console.log(option);
    setopt(options);
    console.log(name);
    

    setSelected(option);
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setopt(
      options.filter((option) => option.toLocaleLowerCase().includes(query))
    );
  };

  return (
    <div ref={ref} className="relative w-full text-[16px] sm:text-sm">
      {/* Trigger button */}
      <button
      disabled={isDisabled}
        type="button"
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
        className={
          " p-[0.66em] px-3 w-full flex justify-between items-center outline-1 rounded-lg hover:cursor-pointer line-clamp-1 truncate " +
          (selected
            ? ""
            : "text-gray-400 font-extralight font-(family-name:--font-figtree) ") + (isDisabled && " text-text-disable bg-neutral-50")
        }
      >
        {selected || placeholder}
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
        <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 transition-all duration-200 ease-in-out overflow-y-auto max-h-39 text-sm max-xs:max-h-60">
          <div className="flex p-2 outline-1 m-2 rounded-lg mb-5">
            <Image
            priority={true}
              src="/search-normal.svg"
              alt="search icon"
              width={20}
              height={20}
            />
            <input
              type="search"
              className="w-full p-1 text-[16px] sm:text-sm outline-0"
              onChange={handleChange}
              placeholder="Search"
            />
          </div>
          {opt.map((option, index) => (
            <button
              type="button"
              key={index}
              onClick={() => handleSelect(option)}
              className={`block w-full text-left px-4 py-3 border-b-2 
                ${
                  index === highlightedIndex
                    ? "bg-blue-100"
                    : selected === option
                    ? "bg-blue-50 text-primary"
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
