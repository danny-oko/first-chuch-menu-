import { cn } from "@/lib/utils";

type CartBadgeProps = {
  count: number;
  className?: string;
  ringClassName?: string;
};

export function CartBadge({ count, className, ringClassName }: CartBadgeProps) {
  if (count <= 0) {
    return null;
  }

  const label = count > 99 ? "99+" : String(count);

  return (
    <span
      className={cn(
        "pointer-events-none absolute flex items-center justify-center rounded-full bg-red-500 font-bold text-white",
        ringClassName,
        className
      )}
      aria-hidden
    >
      {label}
    </span>
  );
}
