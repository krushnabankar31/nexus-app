import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const variantStyles = {
  info: "bg-blue-500/10 border-blue-500/20 text-blue-400 [&>svg]:text-blue-400 border-l-blue-500",
  success: "bg-green-500/10 border-green-500/20 text-green-400 [&>svg]:text-green-400 border-l-green-500",
  warning: "bg-amber-500/10 border-amber-500/20 text-amber-400 [&>svg]:text-amber-400 border-l-amber-500",
  danger: "bg-red-500/10 border-red-500/20 text-red-400 [&>svg]:text-red-400 border-l-red-500",
};

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, children, dismissible, onDismiss, ...props }, ref) => {
    const Icon = icons[variant];
    const [isVisible, setIsVisible] = React.useState(true);

    if (!isVisible) return null;

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg border p-4 pl-12 border-l-4",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <Icon className="absolute left-4 top-4 h-5 w-5" />
        {title && <h5 className="mb-1 font-medium leading-none tracking-tight">{title}</h5>}
        <div className="text-sm opacity-90">
          {children}
        </div>
        {dismissible && (
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss?.();
            }}
            className="absolute right-4 top-4 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = "Alert";
