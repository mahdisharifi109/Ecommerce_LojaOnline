import { ProductGrid } from "@/components/product-grid";
import { FiltersSidebar } from "@/components/filters-sidebar";
import { FilterChips } from "@/components/filter-chips";
import { SortBar } from "@/components/sort-bar";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

export default function Catalog() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        {/* Sidebar - Desktop */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-24">
            <FiltersSidebar />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">
                Catálogo
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Artigos disponíveis para compra
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Filtros - Mobile */}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2 lg:hidden">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-xs p-0">
                  <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between border-b px-4 py-3">
                      <span className="text-sm font-medium">Filtros</span>
                      <SheetClose asChild>
                        <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent">
                          <X className="h-4 w-4" />
                        </button>
                      </SheetClose>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                      <FiltersSidebar />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <SortBar />
            </div>
          </div>

          {/* Active Filters */}
          <FilterChips />

          {/* Product Grid */}
          <ProductGrid />
        </div>
      </div>
    </div>
  );
}
