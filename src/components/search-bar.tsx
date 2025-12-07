import { useState, useEffect, FormEvent, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Sparkles, X, TrendingUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";

const SMART_TAGS = [
  { id: 'vintage', label: 'Vintage', icon: '🕰️' },
  { id: 'minimalist', label: 'Minimalista', icon: '✨' },
  { id: 'upcycled', label: 'Upcycled', icon: '♻️' },
  { id: 'streetwear', label: 'Streetwear', icon: '👟' },
  { id: 'y2k', label: 'Y2K', icon: '💿' },
  { id: 'luxury', label: 'Luxo', icon: '💎' },
];

const TRENDING_TERMS = [
  "#LinhoPuro", "#DenimReciclado", "#VestidosDeFesta", "#CasacosDeLã", "#TenisRetro"
];

const SUGGESTED_PRODUCTS = [
  { id: '1', name: 'Casaco Vintage Lã', price: 85, image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=300&auto=format&fit=crop' },
  { id: '2', name: 'Camisa Linho', price: 45, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=300&auto=format&fit=crop' },
  { id: '3', name: 'Jeans Levi\'s 501', price: 60, image: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=80&w=300&auto=format&fit=crop' },
];

export function SearchBar({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setIsOpen(false);
  };

  const handleTagClick = (tagId: string) => {
    navigate(`/search?q=${encodeURIComponent(tagId)}`);
    setSearchQuery(tagId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <div className={cn("w-full max-w-2xl mx-auto relative z-40", className)}>
        <div 
          onClick={() => setIsOpen(true)}
          className="relative flex items-center cursor-text group"
        >
          <Search 
            className="absolute left-4 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" 
            strokeWidth={2} 
          />
          <div className="h-12 w-full rounded-full border border-border/50 bg-background/50 pl-12 pr-4 flex items-center text-muted-foreground/60 text-base shadow-soft group-hover:shadow-elevated group-hover:border-primary/30 transition-all duration-300">
            {searchQuery || "Descubra peças únicas..."}
          </div>
        </div>
      </div>

      {/* Full Screen Overlay */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="container mx-auto px-4 py-8 h-full flex flex-col">
            {/* Header with Close Button */}
            <div className="flex justify-end mb-8">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="rounded-full h-12 w-12 hover:bg-secondary/20"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Main Search Input */}
            <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto mb-12">
              <div className="relative border-b-2 border-primary/20 focus-within:border-primary transition-colors duration-300">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="O que procura hoje?"
                  className="w-full bg-transparent py-6 pl-12 pr-4 text-3xl md:text-5xl font-heading font-medium placeholder:text-muted-foreground/30 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  type="submit"
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:text-primary transition-colors"
                >
                  <ArrowRight className="h-8 w-8" />
                </button>
              </div>
            </form>

            {/* Content Grid */}
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 overflow-y-auto pb-20">
              
              {/* Left Column: Trending & Tags */}
              <div className="md:col-span-5 space-y-10">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                    <TrendingUp className="h-4 w-4" />
                    Em Alta
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {TRENDING_TERMS.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleTagClick(term.replace('#', ''))}
                        className="text-lg font-body text-foreground/80 hover:text-primary hover:underline decoration-1 underline-offset-4 transition-all"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                    <Sparkles className="h-4 w-4" />
                    Estilos
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {SMART_TAGS.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleTagClick(tag.label)}
                        className="px-4 py-2 rounded-full bg-secondary/20 hover:bg-secondary/40 text-sm transition-colors"
                      >
                        {tag.icon} {tag.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Suggested Products */}
              <div className="md:col-span-7 border-l border-border/30 md:pl-12">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
                  Sugestões para si
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {SUGGESTED_PRODUCTS.map((product) => (
                    <div 
                      key={product.id} 
                      className="group cursor-pointer"
                      onClick={() => {
                        navigate(`/product/${product.id}`); // Note: These are mock IDs, might 404 if not real
                        setIsOpen(false);
                      }}
                    >
                      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted mb-3 relative">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                      <h4 className="font-heading text-lg leading-tight group-hover:text-primary transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{product.price}€</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}