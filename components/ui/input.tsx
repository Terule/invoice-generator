import * as React from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-foreground/35 focus:border-accent",
        className
      )}
      {...props}
    />
  );
}
