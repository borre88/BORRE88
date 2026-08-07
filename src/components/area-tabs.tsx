"use client";

import { useState } from "react";

export interface AreaTab {
  key: string;
  label: string;
  content: React.ReactNode;
}

export function AreaTabs({ tabs }: { tabs: AreaTab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <div>
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActive(t.key)}
            className={`-mb-px whitespace-nowrap border-b-2 px-3.5 py-2 text-sm font-medium ${
              active === t.key ? "border-teal text-teal" : "border-transparent text-ink-faint"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.key} className={t.key === active ? "" : "hidden"}>
          {t.content}
        </div>
      ))}
    </div>
  );
}
