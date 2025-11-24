import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from '@/components/query-provider';
import { AuthProvider } from '@/context/auth-context';
import { ProductProvider } from '@/context/product-context';
import { CartProvider } from '@/context/cart-context';
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from '@/components/error-boundary';
import { ClientOnlyHeader } from '@/components/client-only-header';
import { ClientOnlyFooter } from '@/components/client-only-footer';
import Home from '@/pages/Home';
import Catalog from '@/pages/Catalog';
import Sell from '@/pages/Sell';
import Dashboard from '@/pages/Dashboard';
import ProductDetail from '@/pages/ProductDetail';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

// Placeholder for other pages
const NotFound = () => <div className="container py-20 text-center">Página não encontrada</div>;

function App() {
  return (
    <QueryProvider>
      <Router>
        <AuthProvider>
          <ProductProvider>
            <CartProvider>
              <ErrorBoundary>
                <div className="flex min-h-screen flex-col">
                  <ClientOnlyHeader />
                  <main id="main-content" className="flex-1" role="main">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/catalog" element={<Catalog />} />
                      <Route path="/sell" element={<Sell />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <ClientOnlyFooter />
                </div>
              </ErrorBoundary>
              <Toaster />
            </CartProvider>
          </ProductProvider>
        </AuthProvider>
      </Router>
    </QueryProvider>
  );
}

export default App;
