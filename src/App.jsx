import React, { useState } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/admin/AdminDashboard';
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

function App() {
  return (
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
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </CartProvider>
    </AlertProvider >
  );
}

// helper
import { Outlet } from 'react-router-dom';

export default App;
