"use client";

import type { LucideIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type NavItem = {
  href: Route;
  label: string;
  icon: LucideIcon;
};

type SidebarNavProps = {
  items: NavItem[];
  pathname: string;
  subtitle?: string | null;
};

export function SidebarNav({ items, pathname, subtitle }: SidebarNavProps) {
  return (
    <Card className="sticky top-4 animate-fade-in-up overflow-hidden p-0">
      <div className="border-b border-border p-6">
        <p className="font-display text-lg font-semibold">Invoice Manager</p>
        <p className="mt-1 text-sm text-foreground/62">{subtitle}</p>
      </div>
      <nav className="space-y-1 p-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition duration-200 hover:bg-secondary",
                active && "bg-secondary text-white"
              )}
              href={item.href}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </Card>
  );
}
