import { ProductGrid } from "@/components/product-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Suspense } from "react";

function ProductGridFallback() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 via-primary/10 to-background">
        <div className="container px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Dê uma segunda vida à sua roupa
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Junte-se à nossa comunidade e comece a vender os artigos que já não usa. É grátis, fácil e bom para o planeta.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base shadow-lg hover:shadow-xl transition-shadow">
                <Link to="/sell">Começar a Vender</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link to="/catalog">Explorar Produtos</Link>
              </Button>
            </div>
        </div>
      </section>      {/* Grelha de Produtos */}
      <div className="container px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-heading">
            Descubra Tesouros Únicos
          </h2>
          <p className="mt-3 text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore a nossa seleção de artigos em segunda mão, cuidadosamente escolhidos pela comunidade.
          </p>
        </div>
        <Suspense fallback={<ProductGridFallback/>}>
          <ProductGrid />
        </Suspense>
      </div>
    </>
  );
}
