"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface CheckboxSelectProps {
  options: { label: string; value: number }[];
  selected: { label: string; value: number }[];
  onChange: (selected: { label: string; value: number }[]) => void;
  placeholder?: string;
  title?: string;
}

const CheckboxSelectDsp: React.FC<CheckboxSelectProps> = React.memo(
  ({
    options,
    selected,
    onChange,
    placeholder = "Search...",
    title = "Select Options",
  }) => {
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const selectAllRef = useRef<HTMLInputElement>(null);   // ← New
    const [query, setQuery] = useState("");

    const uniqueSelected = useMemo(() => {
      const seen = new Set<number>();
      return selected.filter((item) => {
        if (seen.has(item.value)) return false;
        seen.add(item.value);
        return true;
      });
    }, [selected]);

    const filteredOptions = useMemo(() => {
      return options.filter((opt) =>
        opt.label.toLowerCase().includes(query.toLowerCase())
      );
    }, [options, query]);

    const allSelected = uniqueSelected.length === options.length;
    const someSelected = uniqueSelected.length > 0 && !allSelected;

    // Update indeterminate state
    useEffect(() => {
      if (selectAllRef.current) {
        selectAllRef.current.indeterminate = someSelected;
      }
    }, [someSelected]);

    const toggleSelectAll = () => {
      if (allSelected) {
        onChange([]);
      } else {
        onChange([...options]);
      }
    };

    const toggleOption = (opt: { label: string; value: number }) => {
      const isSelected = uniqueSelected.some((item) => item.value === opt.value);

      if (isSelected) {
        onChange(uniqueSelected.filter((item) => item.value !== opt.value));
      } else {
        onChange([...uniqueSelected, opt]);
      }
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div ref={ref} className="w-full relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="p-[0.66em] px-3 w-full flex items-center gap-2 outline-1 rounded-lg hover:cursor-pointer"
        >
          <div className="flex-1 overflow-x-auto whitespace-nowrap remove-scrollbar">
            {uniqueSelected.length > 0 ? (
              <div className="flex gap-1 w-max">
                {uniqueSelected.map((item) => (
                  <span
                    key={item.value}
                    className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-700 shrink-0"
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-gray-400 font-extralight">
                {placeholder}
              </span>
            )}
          </div>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-5 h-5 text-gray-500 transition-transform shrink-0 ${
              open ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="p-3 absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-80 overflow-auto">
            <div className="relative mb-2">
              <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-sm focus:ring-1 focus:ring-gray-300"
              />
            </div>

            <label className="flex items-center gap-2 mb-2 cursor-pointer">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="cursor-pointer"
              />
              <span className="text-sm text-gray-700">Select All</span>
            </label>

            <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin">
              {filteredOptions.map((opt, index) => (
                <label
                  key={index}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-md"
                >
                  <input
                    type="checkbox"
                    checked={uniqueSelected.some((item) => item.value === opt.value)}
                    onChange={() => toggleOption(opt)}
                    className="cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}

              {filteredOptions.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-2">
                  No results found
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default CheckboxSelectDsp;