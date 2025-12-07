import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

/**
 * FilterChips - Mostra chips visuais dos filtros ativos
 * Melhora UX ao dar feedback visual claro dos filtros aplicados
 */
export function FilterChips() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [searchParams] = useSearchParams();

  const activeFilters: Array<{ key: string; value: string; label: string }> = [];

  // Recolher todos os filtros ativos
  const conditions = searchParams.get('conditions')?.split(',').filter(Boolean) || [];
  const brands = searchParams.get('brands')?.split(',').filter(Boolean) || [];
  const sizes = searchParams.get('sizes')?.split(',').filter(Boolean) || [];
  const colors = searchParams.get('colors')?.split(',').filter(Boolean) || [];
  const locations = searchParams.get('locations')?.split(',').filter(Boolean) || [];
  const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
  const materials = searchParams.get('materials')?.split(',').filter(Boolean) || [];
  const styles = searchParams.get('styles')?.split(',').filter(Boolean) || [];
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  conditions.forEach(c => activeFilters.push({ key: 'conditions', value: c, label: `Estado: ${c}` }));
  brands.forEach(b => activeFilters.push({ key: 'brands', value: b, label: `Marca: ${b}` }));
  sizes.forEach(s => activeFilters.push({ key: 'sizes', value: s, label: `Tamanho: ${s}` }));
  colors.forEach(c => activeFilters.push({ key: 'colors', value: c, label: `Cor: ${c}` }));
  locations.forEach(l => activeFilters.push({ key: 'locations', value: l, label: `Localização: ${l}` }));
  categories.forEach(c => activeFilters.push({ key: 'categories', value: c, label: `Categoria: ${c}` }));
  materials.forEach(m => activeFilters.push({ key: 'materials', value: m, label: `Material: ${m}` }));
  styles.forEach(s => activeFilters.push({ key: 'styles', value: s, label: `Estilo: ${s}` }));

  if (minPrice || maxPrice) {
    const priceLabel = `Preço: ${minPrice || '0'}€ - ${maxPrice === 'Infinity' ? '1000+' : maxPrice}€`;
    activeFilters.push({ key: 'price', value: 'range', label: priceLabel });
  }

  const removeFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (key === 'price') {
      params.delete('minPrice');
      params.delete('maxPrice');
    } else {
      const currentValues = params.get(key)?.split(',').filter(Boolean) || [];
      const newValues = currentValues.filter(v => v !== value);
      
      if (newValues.length > 0) {
        params.set(key, newValues.join(','));
      } else {
        params.delete(key);
      }
    }

    navigate(pathname + '?' + params.toString());
  };

  const clearAllFilters = () => {
    navigate(pathname);
  };

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <span className="text-sm font-medium text-muted-foreground mr-2 font-serif">Filtros ativos:</span>
      {activeFilters.map((filter, index) => (
        <Badge 
          key={`${filter.key}-${filter.value}-${index}`} 
          variant="secondary" 
          className="gap-1.5 pl-3 pr-1.5 py-1.5 text-sm font-normal rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all border border-border/50 hover:border-primary/20 shadow-sm"
        >
          {filter.label}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 rounded-full hover:bg-background/80 hover:text-destructive transition-colors"
            onClick={() => removeFilter(filter.key, filter.value)}
            aria-label={`Remover filtro ${filter.label}`}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      {activeFilters.length > 1 && (
        <Button
          variant="link"
          size="sm"
          onClick={clearAllFilters}
          className="h-auto px-2 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
        >
          Limpar tudo
        </Button>
      )}
    </div>
  );
}
