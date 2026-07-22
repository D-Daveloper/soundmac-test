"use client";

import { useRef } from "react";



export default function ScrollableTabs({
  active = 0,
  onChange,
  tabs
}: {
    tabs:{label:string,query:string,}[];
  active?: number;
  onChange?: (i: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Mouse drag-to-scroll
  const drag = useRef({ down: false, startX: 0, scrollLeft: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    drag.current = {
      down: true,
      startX: e.pageX - ref.current!.offsetLeft,
      scrollLeft: ref.current!.scrollLeft,
    };
    ref.current!.style.cursor = "grabbing";
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag.current.down) return;
    e.preventDefault();
    const x = e.pageX - ref.current!.offsetLeft;
    const walk = x - drag.current.startX;
    ref.current!.scrollLeft = drag.current.scrollLeft - walk;
  };

  const stopDrag = () => {
    drag.current.down = false;
    if (ref.current) ref.current.style.cursor = "grab";
  };

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      className="flex flex-wrap gap-2 overflow-x-auto scroll-smooth px-3 lg:px-0 py-1 cursor-grab select-none
        scrollbar-hide
        [-webkit-overflow-scrolling:touch]"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {tabs.map((tab, i) => (
        <button
          key={i}
          onClick={() => onChange?.(i)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold 
            whitespace-nowrap border-2 transition-all duration-200 capitalize 
            ${
              active === i
                ? "bg-main-icon-color text-white"
                : "bg-white text-text-disable border-neutral-400 hover:text-primary-300"
            }`}
        >
          {/* <span className="text-[0.85rem]">{tab.icon}</span> */}
          {tab.label}
        </button>
      ))}
    </div>
  );
}