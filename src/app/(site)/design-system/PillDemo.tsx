"use client";

import { useState } from "react";
import { FilterPill } from "@/components/ui/FilterPill";

const options = ["All", "Flutter", "Offline-First", "Backend"];

/** Working single-choice group so the pill states can be tried with mouse and keyboard. */
export function PillDemo() {
  const [selected, setSelected] = useState("All");

  return (
    <div role="group" aria-label="Example filters" className="flex flex-wrap gap-2">
      {options.map((option) => (
        <FilterPill
          key={option}
          selected={selected === option}
          onClick={() => setSelected(option)}
        >
          {option}
        </FilterPill>
      ))}
    </div>
  );
}
