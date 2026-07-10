import type { LucideIcon } from "lucide-react";

type SectionHeaderProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  compact?: boolean;
};

export function SectionHeader({
  icon: Icon,
  title,
  description,
  compact = false
}: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`rounded-2xl bg-secondary p-3 ${compact ? "" : ""}`}>
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <div>
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
        {description ? (
          <p className="text-sm text-foreground/68">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
