import * as React from "react";

import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass-panel rounded-[28px] border border-border bg-card p-6 shadow-soft transition duration-300 hover:border-white/15",
        className
      )}
      {...props}
    />
  );
}
