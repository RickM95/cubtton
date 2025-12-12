
import React, { useEffect, useState } from 'react';
import { orderService } from '../../services/orderService';

const RevenueAnalytics = () => {
    const [revenueData, setRevenueData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0 });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [monthly, overall] = await Promise.all([
                    orderService.getMonthlyRevenue(),
                    orderService.getStats()
                ]);
                setRevenueData(monthly);
                setStats(overall);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-brown mb-2">Revenue Analytics</h2>
                <p className="text-brown/60">Financial performance overview</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 rounded-xl bg-gradient-to-br from-terracotta/20 to-terracotta/5 dark:from-terracotta/10 dark:to-terracotta/5 border border-terracotta/20 dark:border-terracotta/10 text-center md:text-left">
                    <h3 className="text-sm font-bold text-terracotta uppercase tracking-wide">Total Revenue</h3>
                    <p className="mt-2 text-4xl font-bold text-brown dark:text-brown">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-6 rounded-xl bg-white dark:bg-[#2a2a2a] border border-brown/10 shadow-sm">
                    <h3 className="text-sm font-bold text-terracotta uppercase tracking-wide">Total Orders</h3>
                    <p className="mt-2 text-3xl font-bold text-brown dark:text-gray-100">{stats.totalOrders}</p>
                </div>
                <div className="p-6 rounded-xl bg-white dark:bg-[#2a2a2a] border border-brown/10 shadow-sm">
                    <h3 className="text-sm font-bold text-terracotta uppercase tracking-wide">Pending Orders</h3>
                    <p className="mt-2 text-3xl font-bold text-brown dark:text-gray-100">{stats.pendingOrders}</p>
                </div>
            </div>

            {/* Breakdown */}
            <div className="bg-white/50 dark:bg-white/5 rounded-2xl border border-brown/10 p-6">
                <h3 className="text-lg font-bold text-brown mb-6">Monthly Breakdown</h3>

                {loading ? (
                    <div className="h-40 flex items-center justify-center text-brown/40">Loading data...</div>
                ) : revenueData.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-brown/40">No revenue data available yet.</div>
                ) : (
                    <div className="space-y-4">
                        {revenueData.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="w-32 text-sm font-medium text-brown">{item.month}</div>
                                <div className="flex-1 h-3 bg-brown/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-terracotta rounded-full relative group"
                                        style={{ width: `${(item.amount / stats.totalRevenue) * 100}%` }}
                                    >
                                    </div>
                                </div>
                                <div className="w-24 text-right font-bold text-brown">${item.amount}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RevenueAnalytics;
