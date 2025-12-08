import { ProductGrid } from "@/components/product-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Suspense } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

function ProductGridFallback() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[3/4] w-full rounded-none bg-muted/20" />
          <Skeleton className="h-4 w-3/4 bg-muted/20" />
          <Skeleton className="h-4 w-1/2 bg-muted/20" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero — Wabi-Sabi / Editorial */}
      <section className="relative overflow-hidden bg-background pt-20 pb-32 lg:pt-32 lg:pb-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-8">
            
            {/* Typography Column */}
            <div className="flex flex-col justify-center lg:col-span-7 z-10">
              <div className="relative">
                <span className="absolute -left-4 -top-8 font-heading text-9xl text-primary/5 opacity-50 select-none -z-10">
                  01
                </span>
                <h1 className="font-heading text-6xl font-medium leading-[0.9] tracking-tight text-foreground sm:text-8xl">
                  O luxo da <br />
                  <span className="italic text-primary">imperfeição.</span>
                </h1>
              </div>
              
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground font-body font-light">
                Cada fio conta uma história. A Rewear não é apenas um marketplace, 
                é um arquivo vivo de memórias vestíveis. Rejeite o efêmero. 
                Abrace o que dura.
              </p>

              <div className="mt-12 flex flex-wrap gap-6">
                <Button 
                  asChild 
                  size="lg" 
                  className="rounded-none bg-foreground px-10 py-7 text-base font-medium text-background transition-all hover:bg-primary hover:scale-[1.02] hover:shadow-xl"
                >
                  <Link to="/catalog">
                    Explorar o Arquivo
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="ghost" 
                  size="lg" 
                  className="group rounded-none px-6 py-7 text-base font-medium text-foreground hover:bg-transparent hover:text-primary"
                >
                  <Link to="/sell" className="flex items-center gap-2">
                    Continuar a história
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Visual Column - Abstract Composition */}
            <div className="relative lg:col-span-5">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/30 rounded-sm shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop" 
                  alt="Editorial Fashion" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Feed */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="relative">
            <span className="absolute -left-8 -top-8 font-heading text-9xl text-muted/10 select-none -z-10">
              02
            </span>
            <h2 className="font-heading text-4xl font-medium text-foreground">
              Curadoria da Semana
            </h2>
            <p className="mt-2 text-muted-foreground font-body max-w-md">
              Peças selecionadas pela sua raridade, textura e capacidade de contar histórias.
            </p>
          </div>
          <Link 
            to="/catalog"
            className="group inline-flex items-center border-b border-primary pb-1 text-sm font-medium text-primary transition-all hover:border-foreground hover:text-foreground"
          >
            Ver todo o acervo
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        <Suspense fallback={<ProductGridFallback />}>
          <ProductGrid />
        </Suspense>
      </section>
    </>
  );
}
