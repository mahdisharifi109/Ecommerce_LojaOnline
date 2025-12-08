import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

export function AdminSearch() {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        document.getElementById("admin-search")?.focus();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="relative w-full max-w-xl">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
      <Input
        id="admin-search"
        placeholder="Buscar pedidos, usuários, produtos... (Ctrl+K)"
        className="w-full bg-neutral-900/50 border-neutral-800 pl-10 text-neutral-200 placeholder:text-neutral-600 focus:bg-neutral-900 focus:border-primary/50 transition-all"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
        <span className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-neutral-800 bg-neutral-900 px-1.5 font-mono text-[10px] font-medium text-neutral-500 opacity-100">
          <span className="text-xs">⌘</span>K
        </span>
      </div>
    </div>
  );
}
