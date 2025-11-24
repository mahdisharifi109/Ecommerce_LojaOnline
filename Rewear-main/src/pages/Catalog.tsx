import { ProductGrid } from "@/components/product-grid";
import { FiltersSidebar } from "@/components/filters-sidebar";
import { FilterChips } from "@/components/filter-chips";
import { SortBar } from "@/components/sort-bar";

export default function Catalog() {
  return (
    <div className="container px-4 py-8 md:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full lg:w-64 shrink-0">
          <FiltersSidebar />
        </aside>
        <div className="flex-1 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Catálogo</h1>
            <SortBar />
          </div>
          <FilterChips />
          <ProductGrid />
        </div>
      </div>
    </div>
  );
}
