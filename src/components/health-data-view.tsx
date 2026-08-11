"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AreaTabs, type AreaTab } from "@/components/area-tabs";

export function HealthDataView({
  reportContent,
  pillarTabs,
  hasReport,
}: {
  reportContent: React.ReactNode;
  pillarTabs: AreaTab[];
  hasReport: boolean;
}) {
  const [view, setView] = useState<"report" | "aree">(hasReport ? "report" : "aree");

  return (
    <div>
      <div className="no-scrollbar mb-5 inline-flex overflow-x-auto rounded-full border border-line bg-surface p-1">
        <button
          type="button"
          onClick={() => setView("report")}
          className={`no-lift whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            view === "report" ? "bg-teal text-white" : "text-ink-soft"
          }`}
        >
          Report
        </button>
        <button
          type="button"
          onClick={() => setView("aree")}
          className={`no-lift whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            view === "aree" ? "bg-teal text-white" : "text-ink-soft"
          }`}
        >
          Dettaglio aree
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {view === "report" ? reportContent : <AreaTabs tabs={pillarTabs} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
