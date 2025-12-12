import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Routes, Route } from 'react-router-dom';
import { authService } from '../../services/authService';
import { orderService } from '../../services/orderService'; // Stats
import ProductManager from './ProductManager';
import ThreadManager from './ThreadManager';
import UserManager from './UserManager';
import OrderManager from './OrderManager';
import RevenueAnalytics from './RevenueAnalytics';
import CarouselManager from './CarouselManager';
import Navbar from '../../components/Navbar';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Auth
    useEffect(() => {
        const checkAdmin = async () => {
            const user = await authService.getCurrentUser();
            if (!user || !['admin', 'supervisor', 'employee'].includes(user.role)) {
                navigate('/');
            }
        };
        checkAdmin();
    }, [navigate]);

    const navItems = [
        { path: '/admin', label: 'Overview', icon: '📊' },
        { path: '/admin/products', label: 'Products', icon: '🛍️' },
        { path: '/admin/orders', label: 'Orders', icon: '📦' },
        { path: '/admin/revenue', label: 'Revenue', icon: '💰' },
        { path: '/admin/users', label: 'Users', icon: '👥' },
        { path: '/admin/threads', label: 'Threads', icon: '🎨' },
        { path: '/admin/carousel', label: 'Hero Slider', icon: '🖼️' },
    ];

    return (
        <div className="min-h-screen bg-canvas dark:bg-charcoal">

            <Navbar />

            <div className="flex pt-20 h-screen">
                {/* Sidebar */}
                <aside className="w-64 bg-white dark:bg-[#2a2a2a] border-r border-brown/20 flex flex-col shadow-lg z-10 h-full">
                    <div className="p-6 border-b border-brown/10">
                        <h1 className="text-xl font-bold text-terracotta uppercase tracking-wider">Admin Panel</h1>
                    </div>

                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin/')
                                    ? 'bg-terracotta text-white shadow-md'
                                    : 'text-brown dark:text-gray-200 hover:bg-brown/5 dark:hover:bg-white/5'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-brown/10 bg-brown/5 dark:bg-black/20">
                        <div className="text-xs text-brown text-center mb-2">Logged in as Admin</div>
                    </div>
                </aside>

                {/* Main */}
                <main className="flex-1 p-8 overflow-y-auto bg-canvas dark:bg-charcoal h-full">
                    <Routes>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="/products" element={<ProductManager />} />
                        <Route path="/orders" element={<OrderManager />} />
                        <Route path="/revenue" element={<RevenueAnalytics />} />
                        <Route path="/users" element={<UserManager />} />
                        <Route path="/threads" element={<ThreadManager />} />
                        <Route path="/carousel" element={<CarouselManager />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

// Home
const DashboardHome = () => {
    const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await orderService.getStats();
                setStats(data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-brown dark:text-brown">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} />
                <StatCard title="Total Orders" value={stats.totalOrders} />
                <StatCard title="Pending Orders" value={stats.pendingOrders} />
            </div>

            <div className="mt-8 p-6 bg-white/50 dark:bg-white/5 rounded-2xl border border-brown/10">
                <h3 className="text-xl font-bold text-brown dark:text-brown mb-4">Quick Actions</h3>
                <div className="flex gap-4 flex-wrap">
                    <Link to="/admin/products" className="px-4 py-2 bg-terracotta/10 text-terracotta rounded-lg hover:bg-terracotta/20 transition">Manage Products</Link>
                    <Link to="/admin/orders" className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition">View Orders</Link>
                    <Link to="/admin/revenue" className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition">Revenue Report</Link>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value }) => (
    <div className="p-6 rounded-xl bg-white dark:bg-[#2a2a2a] shadow-sm border border-brown/10 hover:shadow-md transition-shadow">
        <h3 className="text-sm font-bold text-terracotta uppercase tracking-wide">{title}</h3>
        <p className="mt-2 text-3xl font-bold text-brown dark:text-gray-100">{value}</p>
    </div>
);

const Placeholder = ({ title }) => (
    <div>
        <h2 className="text-2xl font-bold text-brown dark:text-gray-100 mb-4">{title}</h2>
        <p className="text-brown/60 dark:text-gray-400">This feature is coming soon.</p>
    </div>
);

export default AdminDashboard;
