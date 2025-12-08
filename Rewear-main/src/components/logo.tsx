import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
    xl: "text-6xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("font-heading font-bold tracking-tight text-foreground", sizeClasses[size])}>
        Re<span className="italic text-primary">wear.</span>
      </span>
    </div>
  );
}

export function LogoIcon({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <div className={cn("flex items-center justify-center bg-foreground text-background font-heading font-bold rounded-full", className)} style={{ width: size, height: size }}>
      R
    </div>
  );
}
