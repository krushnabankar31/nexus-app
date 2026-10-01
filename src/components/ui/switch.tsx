'use client';
import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: string;
  description?: string;
}

export const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  ({ className, label, description, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-3">
        <SwitchPrimitive.Root
          ref={ref}
          className={cn(
            "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-500))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg-body))] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[hsl(var(--brand-500))] data-[state=unchecked]:bg-[hsl(var(--bg-overlay))]",
            className
          )}
          {...props}
        >
          <SwitchPrimitive.Thumb
            className={cn(
              "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
            )}
          />
        </SwitchPrimitive.Root>
        {(label || description) && (
          <div className="flex flex-col space-y-0.5">
            {label && (
              <label
                className="text-sm font-medium text-[hsl(var(--text-main))] peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                onClick={() => document.getElementById(props.id || '')?.click()}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-[hsl(var(--text-muted))]">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Switch.displayName = SwitchPrimitive.Root.displayName;
