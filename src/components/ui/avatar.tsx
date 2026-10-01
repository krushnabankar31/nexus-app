import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────
export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type StatusType = "online" | "idle" | "dnd" | "offline";

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: StatusType;
  showStatus?: boolean;
  shape?: "circle" | "rounded";
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  avatars: Array<{ src?: string | null; name?: string; alt?: string }>;
  max?: number;
  size?: AvatarSize;
}

// ─── Size maps ───────────────────────────────────────────────────────────────
const sizeMap: Record<AvatarSize, string> = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-20 w-20",
  "2xl": "h-32 w-32",
};

const textSizeMap: Record<AvatarSize, string> = {
  xs: "text-[10px]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-xl",
  "2xl": "text-3xl",
};

const statusSizeMap: Record<AvatarSize, string> = {
  xs: "h-1.5 w-1.5 ring-1",
  sm: "h-2 w-2 ring-[1.5px]",
  md: "h-2.5 w-2.5 ring-2",
  lg: "h-3 w-3 ring-2",
  xl: "h-3.5 w-3.5 ring-2",
  "2xl": "h-4 w-4 ring-2",
};

const overlapMap: Record<AvatarSize, string> = {
  xs: "-ml-2",
  sm: "-ml-2.5",
  md: "-ml-3",
  lg: "-ml-4",
  xl: "-ml-5",
  "2xl": "-ml-8",
};

const statusColorMap: Record<StatusType, string> = {
  online: "bg-emerald-500",
  idle: "bg-amber-500",
  dnd: "bg-red-500",
  offline: "bg-[hsl(var(--text-muted))]",
};

const statusLabelMap: Record<StatusType, string> = {
  online: "Online",
  idle: "Idle",
  dnd: "Do not disturb",
  offline: "Offline",
};

const gradients = [
  "from-violet-500 to-indigo-500",
  "from-pink-500 to-rose-500",
  "from-cyan-500 to-blue-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-fuchsia-500 to-purple-500",
];

const getGradient = (name?: string): string => {
  if (!name) return gradients[0];
  const code = name.charCodeAt(0) + (name.charCodeAt(1) ?? 0);
  return gradients[code % gradients.length];
};

const getInitials = (name?: string): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ─── Avatar ──────────────────────────────────────────────────────────────────
const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      src,
      alt,
      name,
      size = "md",
      status,
      showStatus = false,
      shape = "circle",
      className,
      ...props
    },
    ref
  ) => {
    const [imgError, setImgError] = React.useState(false);
    const [imgLoaded, setImgLoaded] = React.useState(false);

    const shapeClass = shape === "circle" ? "rounded-full" : "rounded-xl";
    const gradient = getGradient(name);
    const initials = getInitials(name);
    const showImg = src && !imgError;

    return (
      <span
        ref={ref}
        role="img"
        aria-label={alt ?? name ?? "User avatar"}
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden",
          sizeMap[size],
          shapeClass,
          className
        )}
        {...props}
      >
        {/* Fallback: gradient with initials */}
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-gradient-to-br font-bold text-white select-none",
            gradient,
            textSizeMap[size]
          )}
          aria-hidden="true"
        >
          {initials}
        </span>

        {/* Image overlay */}
        {showImg && (
          <img
            src={src}
            alt={alt ?? name ?? ""}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
              imgLoaded ? "opacity-100" : "opacity-0"
            )}
            draggable={false}
          />
        )}

        {/* Status dot */}
        {showStatus && status && (
          <span
            aria-label={statusLabelMap[status]}
            className={cn(
              "absolute bottom-0 right-0 rounded-full ring-[hsl(var(--bg-base))]",
              statusSizeMap[size],
              statusColorMap[status]
            )}
          />
        )}
      </span>
    );
  }
);

Avatar.displayName = "Avatar";

// ─── AvatarGroup ─────────────────────────────────────────────────────────────
const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ avatars, max = 4, size = "md", className, ...props }, ref) => {
    const visible = avatars.slice(0, max);
    const overflow = avatars.length - max;

    return (
      <div
        ref={ref}
        role="group"
        aria-label={`${avatars.length} users`}
        className={cn("flex items-center", className)}
        {...props}
      >
        {visible.map((av, i) => (
          <Avatar
            key={i}
            src={av.src}
            name={av.name}
            alt={av.alt}
            size={size}
            className={cn(
              "ring-2 ring-[hsl(var(--bg-base))]",
              i > 0 && overlapMap[size]
            )}
          />
        ))}

        {overflow > 0 && (
          <span
            aria-label={`${overflow} more users`}
            className={cn(
              "relative inline-flex items-center justify-center shrink-0",
              "rounded-full ring-2 ring-[hsl(var(--bg-base))]",
              "bg-[hsl(var(--bg-overlay))] text-[hsl(var(--text-secondary))]",
              "font-semibold select-none",
              sizeMap[size],
              textSizeMap[size],
              overlapMap[size]
            )}
          >
            +{overflow}
          </span>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = "AvatarGroup";

export { Avatar, AvatarGroup };
