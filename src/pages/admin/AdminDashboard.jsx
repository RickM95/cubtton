
import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import ProductManager from './ProductManager';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/admin', label: 'Overview' },
        { path: '/admin/products', label: 'Products' },
        { path: '/admin/orders', label: 'Orders' },
        { path: '/admin/threads', label: 'Threads & Colors' },
    ];

    return (
        <div className="min-h-screen bg-canvas dark:bg-charcoal flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-white/5 border-r border-brown/20 flex flex-col">
                <div className="p-6 border-b border-brown/10">
                    <h1 className="text-2xl font-bold text-terracotta">Admin Panel</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`block px-4 py-2 rounded-lg transition-colors ${location.pathname === item.path
                                ? 'bg-terracotta text-white'
                                : 'text-brown dark:text-gray-200 hover:bg-brown/10 dark:hover:bg-white/10'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-brown/10">
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Routes>
                    <Route path="/" element={<DashboardHome />} />
                    <Route path="/products" element={<ProductManager />} />
                    <Route path="/orders" element={<Placeholder title="Orders Management" />} />
                    <Route path="/threads" element={<Placeholder title="Thread Colors & Trends" />} />
                </Routes>
            </main>
        </div>
    );
};

// Placeholder components for now
const DashboardHome = () => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-brown dark:text-stone">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Orders" value="12" />
            <StatCard title="Total Products" value="24" />
            <StatCard title="Revenue" value="$1,240.00" />
        </div>
    </div>
);

const StatCard = ({ title, value }) => (
    <div className="p-6 rounded-xl glass border border-brown/10">
        <h3 className="text-sm font-medium text-brown/60 dark:text-stone/60 uppercase">{title}</h3>
        <p className="mt-2 text-3xl font-bold text-terracotta">{value}</p>
    </div>
);

const Placeholder = ({ title }) => (
    <div>
        <h2 className="text-2xl font-bold text-brown dark:text-stone mb-4">{title}</h2>
        <p className="text-brown/60">This feature is coming soon.</p>
    </div>
);

export default AdminDashboard;
