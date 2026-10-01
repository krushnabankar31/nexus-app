import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ─── CVA Variants ────────────────────────────────────────────────────────────
const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5 font-semibold leading-none",
    "rounded-full border transition-colors duration-150",
    "select-none",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-[hsl(var(--bg-overlay))] text-[hsl(var(--text-secondary))]",
          "border-[hsl(var(--border-subtle))]",
        ],
        primary: [
          "bg-[hsl(var(--brand-500)/0.15)] text-[hsl(var(--brand-400,239_84%_67%))]",
          "border-[hsl(var(--brand-500)/0.3)]",
        ],
        success: ["bg-emerald-500/15 text-emerald-400", "border-emerald-500/30"],
        warning: ["bg-amber-500/15 text-amber-400", "border-amber-500/30"],
        danger: ["bg-red-500/15 text-red-400", "border-red-500/30"],
        outline: [
          "bg-transparent text-[hsl(var(--text-primary))]",
          "border-[hsl(var(--border-default))]",
        ],
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const dotColorMap: Record<string, string> = {
  default: "bg-[hsl(var(--text-muted))]",
  primary: "bg-[hsl(var(--brand-500))]",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-red-400",
  outline: "bg-[hsl(var(--text-primary))]",
};

// ─── Types ───────────────────────────────────────────────────────────────────
export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotColor?: string;
  icon?: React.ReactNode;
}

// ─── Badge ───────────────────────────────────────────────────────────────────
const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = "default",
      size,
      dot = false,
      dotColor,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const resolvedDotColor =
      dotColor ?? dotColorMap[variant ?? "default"] ?? dotColorMap.default;

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "inline-block rounded-full shrink-0",
              size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
              resolvedDotColor
            )}
            aria-hidden="true"
          />
        )}
        {icon && (
          <span className="shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

// ─── CommunityBadge ──────────────────────────────────────────────────────────
export interface CommunityBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  color?: string;
  textColor?: string;
  label: string;
  size?: "sm" | "md";
}

const CommunityBadge = React.forwardRef<HTMLSpanElement, CommunityBadgeProps>(
  (
    { color = "#6366f1", textColor, label, size = "md", className, ...props },
    ref
  ) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 font-semibold rounded-full border select-none",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
      style={{
        backgroundColor: `${color}26`,
        borderColor: `${color}4D`,
        color: textColor ?? color,
      }}
      {...props}
    >
      {label}
    </span>
  )
);

CommunityBadge.displayName = "CommunityBadge";

export { Badge, CommunityBadge, badgeVariants };
