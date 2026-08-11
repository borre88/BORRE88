"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export function HubCard({
  href,
  icon,
  title,
  subtitle,
  stat,
  delay = 0,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  stat?: string;
  delay?: number;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      <Link
        href={href}
        className="group relative block overflow-hidden rounded-card border border-line bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-teal hover:shadow-lg"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-soft to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <div className="relative">
          <div className="mb-3.5 flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-soft text-teal transition-colors duration-300 group-hover:bg-teal group-hover:text-white">
              {icon}
            </span>
            <div className="font-display text-base font-bold">{title}</div>
            <ChevronRight
              size={15}
              className="ml-auto shrink-0 text-ink-faint transition-transform duration-300 group-hover:translate-x-1 group-hover:text-teal"
            />
          </div>

          <p className="text-[12.5px] text-ink-faint">{subtitle}</p>

          {(stat || children) && (
            <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 group-hover:grid-rows-[1fr]">
              <div className="overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {stat && (
                  <p className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-teal">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-teal" />
                    {stat}
                  </p>
                )}
                {children}
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
