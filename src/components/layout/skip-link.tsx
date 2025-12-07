import { cn } from "@/lib/utils";

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className={cn(
        "absolute left-4 top-4 z-[100] -translate-y-[150%] rounded-md bg-primary px-4 py-2 text-primary-foreground transition-transform focus:translate-y-0",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      )}
    >
      Saltar para o conteúdo principal
    </a>
  );
}
