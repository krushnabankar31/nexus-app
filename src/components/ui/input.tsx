import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Eye Icons ───────────────────────────────────────────────────────────────
const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// ─── Types ───────────────────────────────────────────────────────────────────
type InputVariant = "default" | "filled";

interface BaseInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  variant?: InputVariant;
}

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    BaseInputProps {}

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    BaseInputProps {}

// ─── Shared sub-components ───────────────────────────────────────────────────
const FieldLabel = ({
  label,
  htmlFor,
  required,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
}) => (
  <label
    htmlFor={htmlFor}
    className="block text-sm font-medium text-[hsl(var(--text-primary))] mb-1.5"
  >
    {label}
    {required && (
      <span className="ml-1 text-red-400" aria-hidden="true">
        *
      </span>
    )}
  </label>
);

const FieldError = ({ error, id }: { error: string; id: string }) => (
  <p
    id={id}
    role="alert"
    className="mt-1.5 text-xs text-red-400 flex items-center gap-1"
  >
    <svg
      className="h-3 w-3 shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
    {error}
  </p>
);

const FieldHint = ({ hint, id }: { hint: string; id: string }) => (
  <p id={id} className="mt-1.5 text-xs text-[hsl(var(--text-muted))]">
    {hint}
  </p>
);

const getWrapperClasses = (
  variant: InputVariant,
  hasError: boolean,
  disabled?: boolean
) =>
  cn(
    "relative flex items-center w-full rounded-xl border transition-all duration-200",
    "focus-within:ring-2 focus-within:ring-offset-1 focus-within:ring-offset-[hsl(var(--bg-base))]",
    variant === "filled"
      ? "bg-[hsl(var(--bg-raised))]"
      : "bg-[hsl(var(--bg-overlay))]",
    hasError
      ? "border-red-500 focus-within:ring-red-500/40"
      : "border-[hsl(var(--border-subtle))] focus-within:border-[hsl(var(--brand-500))] focus-within:ring-[hsl(var(--brand-500)/0.3)]",
    disabled && "opacity-50 cursor-not-allowed"
  );

const baseFieldClasses = cn(
  "w-full bg-transparent px-3 py-2.5 text-sm text-[hsl(var(--text-primary))]",
  "placeholder:text-[hsl(var(--text-muted))]",
  "outline-none border-none ring-0 focus:ring-0",
  "disabled:cursor-not-allowed"
);

// ─── Input ───────────────────────────────────────────────────────────────────
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      showPasswordToggle,
      variant = "default",
      type,
      id: externalId,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const internalId = React.useId();
    const id = externalId ?? internalId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const inputType = showPasswordToggle
      ? showPassword
        ? "text"
        : "password"
      : type;

    const describedBy = [error ? errorId : null, hint ? hintId : null]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={cn("w-full", className)}>
        {label && <FieldLabel label={label} htmlFor={id} required={required} />}

        <div className={getWrapperClasses(variant, !!error, disabled)}>
          {leftIcon && (
            <span
              className="pl-3 text-[hsl(var(--text-muted))] shrink-0"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            type={inputType}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={describedBy || undefined}
            className={cn(
              baseFieldClasses,
              leftIcon && "pl-1",
              (rightIcon || showPasswordToggle) && "pr-1"
            )}
            {...props}
          />

          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="pr-3 text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] transition-colors shrink-0"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}

          {rightIcon && !showPasswordToggle && (
            <span
              className="pr-3 text-[hsl(var(--text-muted))] shrink-0"
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          )}
        </div>

        {error && <FieldError error={error} id={errorId} />}
        {!error && hint && <FieldHint hint={hint} id={hintId} />}
      </div>
    );
  }
);

Input.displayName = "Input";

// ─── Textarea ────────────────────────────────────────────────────────────────
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      showPasswordToggle: _ignored,
      variant = "default",
      id: externalId,
      disabled,
      required,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const internalId = React.useId();
    const id = externalId ?? internalId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const describedBy = [error ? errorId : null, hint ? hintId : null]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={cn("w-full", className)}>
        {label && <FieldLabel label={label} htmlFor={id} required={required} />}

        <div
          className={cn(
            getWrapperClasses(variant, !!error, disabled),
            "items-start"
          )}
        >
          {leftIcon && (
            <span
              className="pl-3 pt-2.5 text-[hsl(var(--text-muted))] shrink-0"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          <textarea
            ref={ref}
            id={id}
            rows={rows}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={describedBy || undefined}
            className={cn(
              baseFieldClasses,
              "resize-y min-h-[80px] py-2.5",
              leftIcon && "pl-1"
            )}
            {...props}
          />

          {rightIcon && (
            <span
              className="pr-3 pt-2.5 text-[hsl(var(--text-muted))] shrink-0"
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          )}
        </div>

        {error && <FieldError error={error} id={errorId} />}
        {!error && hint && <FieldHint hint={hint} id={hintId} />}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Input, Textarea };
