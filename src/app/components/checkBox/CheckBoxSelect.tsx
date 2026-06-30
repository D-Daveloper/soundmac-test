"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface CheckboxSelectProps {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  title?: string;
}

const CheckboxSelect: React.FC<CheckboxSelectProps> = React.memo(
  ({ options, selected, onChange, placeholder = "Search...", title = "Select Options" }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const selectAllRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");

    const uniqueSelected = useMemo(() => {
      const seen = new Set<string>();
      return selected.filter((v) => {
        if (seen.has(v)) return false;
        seen.add(v);
        return true;
      });
    }, [selected]);

    const filteredOptions = useMemo(() => {
      return options.filter((opt) =>
        opt.label.toLowerCase().includes(query.toLowerCase())
      );
    }, [options, query]);

    const allSelected = uniqueSelected.length === options.length && options.length > 0;
    const someSelected = uniqueSelected.length > 0 && !allSelected;

    useEffect(() => {
      if (selectAllRef.current) {
        selectAllRef.current.indeterminate = someSelected;
      }
    }, [someSelected]);

    const toggleSelectAll = () => {
      if (allSelected) onChange([]);
      else onChange(options.map((o) => o.value));
    };

    const toggleOption = (value: string) => {
      if (uniqueSelected.includes(value)) {
        onChange(uniqueSelected.filter((v) => v !== value));
      } else {
        onChange([...uniqueSelected, value]);
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
          className={
            "p-[0.66em] px-3 w-full flex justify-between items-center outline-1 rounded-lg hover:cursor-pointer line-clamp-1 truncate overflow-x-auto remove-scrollbar " +
            (uniqueSelected.length
              ? ""
              : "text-gray-400 font-extralight font-(family-name:--font-figtree)")
          }
        >
          {uniqueSelected.join(", ") || placeholder}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-5 h-5 text-gray-500 transition-transform shrink-0 ${
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

        {open && (
          <div className="p-3 absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-80 overflow-auto">
            <div className="relative mb-2">
              <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-sm focus:ring-1 focus:ring-gray-300 focus:outline-none"
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
              {filteredOptions.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-md"
                >
                  <input
                    type="checkbox"
                    checked={uniqueSelected.includes(opt.value)}
                    onChange={() => toggleOption(opt.value)}
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

export default CheckboxSelect;