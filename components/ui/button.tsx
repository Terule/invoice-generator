import type * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
};

export function Button({
  className,
  variant = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50",
        variant === "default" &&
          "bg-primary text-primary-foreground shadow-soft hover:-translate-y-0.5 hover:opacity-90",
        variant === "outline" &&
          "border border-border bg-card text-foreground hover:-translate-y-0.5 hover:bg-secondary",
        variant === "ghost" && "text-foreground hover:-translate-y-0.5 hover:bg-secondary",
        className
      )}
      type={type}
      {...props}
    />
  );
}
