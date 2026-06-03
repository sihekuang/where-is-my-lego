import { cn } from "@/lib/utils";
import { StudRow } from "./StudRow";

const ACCENT: Record<string, string> = {
  confirmed: "border-t-confirmed text-confirmed",
  allegation: "border-t-allegation text-allegation",
  reported: "border-t-reported text-reported",
  blue: "border-t-brick-blue text-brick-blue",
  red: "border-t-brick-red text-brick-red",
  green: "border-t-brick-green text-brick-green",
  orange: "border-t-brick-orange text-brick-orange",
  yellow: "border-t-brick-yellow text-brick-yellow",
};

export type BrickVariant = keyof typeof ACCENT;

export function BrickCard({
  variant = "blue",
  studs = 3,
  className,
  children,
}: {
  variant?: BrickVariant;
  studs?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("brick-card", ACCENT[variant], className)}>
      <StudRow count={studs} />
      {/* reset text color for content (StudRow inherits the accent above) */}
      <div className="text-card-foreground">{children}</div>
    </div>
  );
}
