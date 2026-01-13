import React, { Suspense, lazy } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { AlertProvider } from './context/AlertContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load admin components
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

function App() {
  return (
    <ErrorBoundary>
      <AlertProvider>
        <CartProvider>
          <Router>
            <CartDrawer />
            <Routes>
            {/* public */}
            <Route element={<Layout><Outlet /></Layout>}>
              <Route path="/" element={<Products />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* admin */}
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta"></div>
                  </div>
                }>
                  <AdminDashboard />
                </Suspense>
              </ProtectedRoute>
            } />
          </Routes>
          </Router>
        </CartProvider>
      </AlertProvider>
    </ErrorBoundary>
  );
}

// helper
import { Outlet } from 'react-router-dom';

export default App;
