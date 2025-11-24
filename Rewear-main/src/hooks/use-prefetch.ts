import { useEffect } from 'react';
import type { Product } from '@/lib/types';

/**
 * Hook para prefetch de páginas de produtos
 * Carrega a próxima página em background para navegação instantânea
 */
export function usePrefetchProducts(products: Product[]) {
  // No-op in Vite/React Router for now
}

/**
 * Hook para prefetch inteligente baseado em hover
 */
export function useSmartPrefetch() {
  const prefetchOnHover = (productId: string) => {
    // No-op
  };

  return { prefetchOnHover };
}
