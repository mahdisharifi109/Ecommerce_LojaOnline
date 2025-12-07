import { useState, useEffect } from 'react';
import { X, Search, ArrowRight, Leaf, Recycle, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '@/context/product-context';

// Mock Data
const TRENDING_TAGS = [
  "Linho Puro", "Upcycled", "Verão Consciente", "Vintage Denim", "Seda Lavada"
];

const CURATED_PRODUCTS = [
  {
    id: "1",
    name: "Camisa de Linho Natural",
    price: 45,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400&auto=format&fit=crop",
    eco: "organic"
  },
  {
    id: "2",
    name: "Tote Bag Reciclada",
    price: 28,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400&auto=format&fit=crop",
    eco: "recycled"
  },
  {
    id: "3",
    name: "Vestido Midi Seda",
    price: 120,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop",
    eco: "vintage"
  }
];

// Levenshtein distance for fuzzy search
const levenshteinDistance = (a: string, b: string) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const { products } = useProducts();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (query.length > 1) {
      const lowerQuery = query.toLowerCase();
      
      const filteredProducts = products.filter((product) => {
        const lowerName = product.name.toLowerCase();
        const lowerDesc = product.description?.toLowerCase() || "";
        
        // Exact match or includes
        if (lowerName.includes(lowerQuery) || lowerDesc.includes(lowerQuery)) return true;
        
        // Fuzzy match for title (allow up to 2 edits for words > 3 chars)
        if (lowerQuery.length > 3) {
             const words = lowerName.split(" ");
             return words.some((word: string) => levenshteinDistance(word, lowerQuery) <= 2);
        }
        
        return false;
      }).slice(0, 5);

      if (filteredProducts.length > 0) {
        setResults({
          suggestions: [],
          collections: [],
          products: filteredProducts.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls[0] : "",
            eco: p.condition
          }))
        });
      } else {
        setResults(null);
      }
    } else {
      setResults(null);
    }
  }, [query, products]);

  const handleClose = () => {
    setQuery("");
    setResults(null);
    onClose();
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-md flex flex-col"
        >
          {/* Header with Input */}
          <div className="container mx-auto px-4 pt-6 pb-4 border-b border-border/10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                <input
                  autoFocus
                  type="text"
                  placeholder="O que procura hoje?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-3xl md:text-5xl font-heading font-light placeholder:text-muted-foreground/30 focus:ring-0 focus:outline-none px-10 py-4"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="rounded-full hover:bg-secondary/50"
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Fechar</span>
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-8 md:py-12">
              
              {!query && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-12"
                >
                  {/* Trending Tags */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Trending Now</h3>
                    <div className="flex flex-wrap gap-3">
                      {TRENDING_TAGS.map((tag) => (
                        <button
                          key={tag}
                          className="px-4 py-2 rounded-full bg-secondary/30 hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Curated Products */}
                  <div className="space-y-6">
                    <h3 className="font-heading text-2xl md:text-3xl">O que o seu armário precisa hoje?</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {CURATED_PRODUCTS.map((product: any) => (
                        <div key={product.id} className="group cursor-pointer space-y-3">
                          <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium group-hover:text-primary transition-colors">{product.name}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm text-muted-foreground">{product.price}€</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {query && results && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12"
                >
                  {/* Suggestions Column */}
                  <div className="md:col-span-3 space-y-6">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Sugestões</h3>
                    <ul className="space-y-3">
                      {results.suggestions.map((item: string, i: number) => (
                        <li key={i}>
                          <button className="text-lg hover:text-primary hover:underline decoration-1 underline-offset-4 transition-all text-left">
                            {item}
                          </button>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="pt-6">
                       <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Coleções</h3>
                       <ul className="space-y-3">
                        {results.collections.map((item: string, i: number) => (
                          <li key={i}>
                            <Link to="#" className="flex items-center gap-2 text-base hover:text-primary transition-colors">
                              {item}
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </li>
                        ))}
                       </ul>
                    </div>
                  </div>

                  {/* Products Column */}
                  <div className="md:col-span-9">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-6">Produtos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {results.products.map((product: any) => (
                        <div key={product.id} className="group cursor-pointer space-y-3" onClick={() => handleProductClick(product.id)}>
                          <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-muted">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium group-hover:text-primary transition-colors">{product.name}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm text-muted-foreground">{product.price}€</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
