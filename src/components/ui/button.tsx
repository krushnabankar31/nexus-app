import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ─── Spinner ────────────────────────────────────────────────────────────────
const Spinner = ({ className }: { className?: string }) => (
  <svg
    className={cn("animate-spin", className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// ─── CVA Variants ────────────────────────────────────────────────────────────
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 font-semibold",
    "rounded-xl border border-transparent",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-500))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg-base))]",
    "disabled:pointer-events-none disabled:opacity-40 disabled:select-none",
    "select-none cursor-pointer",
    "whitespace-nowrap",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-r from-[hsl(var(--brand-500))] to-[hsl(var(--brand-600,239_68%_55%))]",
          "text-white shadow-lg shadow-[hsl(var(--brand-500)/0.35)]",
          "hover:scale-[1.01] hover:shadow-xl hover:shadow-[hsl(var(--brand-500)/0.5)]",
          "active:scale-[0.99]",
        ],
        secondary: [
          "bg-[hsl(var(--bg-overlay))] text-[hsl(var(--text-primary))]",
          "border-[hsl(var(--border-subtle))]",
          "hover:bg-[hsl(var(--bg-raised))] hover:border-[hsl(var(--border-default))]",
          "active:scale-[0.99]",
        ],
        ghost: [
          "bg-transparent text-[hsl(var(--text-secondary))]",
          "hover:bg-[hsl(var(--bg-overlay))] hover:text-[hsl(var(--text-primary))]",
          "active:scale-[0.99]",
        ],
        danger: [
          "bg-gradient-to-r from-red-600 to-red-500",
          "text-white shadow-lg shadow-red-900/30",
          "hover:scale-[1.01] hover:shadow-xl hover:shadow-red-900/50",
          "active:scale-[0.99]",
        ],
        outline: [
          "bg-transparent text-[hsl(var(--brand-400,239_84%_67%))]",
          "border-[hsl(var(--brand-500))]",
          "hover:bg-[hsl(var(--brand-500)/0.1)]",
          "active:scale-[0.99]",
        ],
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-lg",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base rounded-2xl",
        icon: "h-10 w-10 p-0 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// ─── Types ───────────────────────────────────────────────────────────────────
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────────────
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const spinnerSize =
      size === "sm"
        ? "h-3.5 w-3.5"
        : size === "lg"
        ? "h-5 w-5"
        : "h-4 w-4";

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <Spinner className={spinnerSize} />
        ) : leftIcon ? (
          <span className="shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}

        {size !== "icon" && children && <span>{children}</span>}

        {size === "icon" && !isLoading && children}

        {!isLoading && rightIcon && (
          <span className="shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
