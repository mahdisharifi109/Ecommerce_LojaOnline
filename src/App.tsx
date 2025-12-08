import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryProvider } from '@/components/query-provider';
import { AuthProvider } from '@/context/auth-context';
import { ProductProvider } from '@/context/product-context';
import { CartProvider } from '@/context/cart-context';
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from '@/components/error-boundary';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Home as HomeIcon, Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';
import { HelmetProvider } from 'react-helmet-async';
import { SkipLink } from '@/components/layout/skip-link';
import ProfileLayout from '@/layouts/ProfileLayout';

import { AdminRoute } from '@/components/admin/AdminRoute';
import AdminLayout from '@/layouts/AdminLayout';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminSettings from '@/pages/admin/AdminSettings';

// Lazy Loaded Pages for Performance
const Home = lazy(() => import('@/pages/Home'));
const Catalog = lazy(() => import('@/pages/Catalog'));
const Sell = lazy(() => import('@/pages/Sell'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Auth = lazy(() => import('@/pages/Auth'));
const Profile = lazy(() => import('@/pages/Profile'));
const Settings = lazy(() => import('@/pages/Settings'));
const Messages = lazy(() => import('@/pages/Messages'));
const PublicProfile = lazy(() => import('@/pages/PublicProfile'));
const Favorites = lazy(() => import('@/pages/Favorites'));
const Sales = lazy(() => import('@/pages/Sales'));
const Purchases = lazy(() => import('@/pages/Purchases'));
const Checkout = lazy(() => import('@/pages/Checkout'));

// Content Pages
const About = lazy(() => import('@/pages/content/About'));
const Journal = lazy(() => import('@/pages/content/Journal'));
const FAQ = lazy(() => import('@/pages/support/FAQ'));
const Contact = lazy(() => import('@/pages/support/Contact'));
const Privacy = lazy(() => import('@/pages/legal/Privacy'));
const Terms = lazy(() => import('@/pages/legal/Terms'));

function PageLoader() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-7xl font-bold text-muted-foreground/30">404</p>
      <h1 className="mt-4 text-2xl font-bold">Página não encontrada</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        O endereço que procura não existe ou foi movido.
      </p>
      <Button asChild className="mt-8">
        <Link to="/">
          <HomeIcon className="mr-2 h-4 w-4" />
          Voltar ao início
        </Link>
      </Button>
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryProvider>
        <Router>
          <AuthProvider>
            <ProductProvider>
              <CartProvider>
                <ErrorBoundary>
                <div className="flex min-h-screen flex-col">
                  <SkipLink />
                  <Header />
                  {/* Layout Fix: Added padding-top to prevent header overlap */}
                  <main id="main-content" className="flex-1 pt-[calc(var(--header-height)+20px)]" role="main">
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                      <Route path="/catalog" element={<Catalog />} />
                      
                      {/* Content Routes */}
                      <Route path="/about" element={<About />} />
                      <Route path="/journal" element={<Journal />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/terms" element={<Terms />} />

                      {/* Protected Routes */}
                      <Route element={<ProtectedRoute />}>
                          <Route path="/sell" element={<Sell />} />
                          <Route path="/checkout" element={<Checkout />} />
                          
                          {/* Profile Layout Routes */}
                          <Route element={<ProfileLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/messages" element={<Messages />} />
                            <Route path="/favorites" element={<Favorites />} />
                            <Route path="/sales" element={<Sales />} />
                            <Route path="/purchases" element={<Purchases />} />
                          </Route>
                        </Route>

                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/profile/:id" element={<PublicProfile />} />
                        <Route path="/login" element={<Auth />} />
                        <Route path="/register" element={<Auth />} />

                        {/* Admin Routes */}
                        <Route element={<AdminRoute />}>
                          <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="products" element={<AdminProducts />} />
                            <Route path="users" element={<AdminUsers />} />
                            <Route path="settings" element={<AdminSettings />} />
                          </Route>
                        </Route>

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </main>
                  <Footer />
                  </div>
                </ErrorBoundary>
                <Toaster />
              </CartProvider>
            </ProductProvider>
          </AuthProvider>
        </Router>
      </QueryProvider>
    </HelmetProvider>
  );
}

export default App;
