"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="hostvia-glow-card divide-y divide-white/5 overflow-hidden">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div key={item.question} className="px-6 py-5">
            <h2 className="text-base font-semibold text-white">
              <button
                type="button"
                className="flex w-full items-start justify-between gap-4 text-left"
                onClick={() => setOpenIndex(open ? null : index)}
                aria-expanded={open}
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0 text-zinc-500 transition",
                    open && "rotate-180"
                  )}
                />
              </button>
            </h2>
            <div
              className={cn(
                "grid transition-all duration-200",
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <p className="pt-4 text-sm leading-relaxed text-zinc-400">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
