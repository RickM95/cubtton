
import React, { useEffect, useState } from 'react';
import { orderService } from '../../services/orderService';

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState(null);

    const statusOptions = [
        'pending_payment',
        'ordered',
        'received',
        'in_progress',
        'out_for_delivery',
        'completed'
    ];

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await orderService.getAllOrders();
            setOrders(data || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setError("Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        setError(null);
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error("Error updating status:", error);
            setError("Failed to update status: " + error.message);
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'pending_payment': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'out_for_delivery': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brown">Order Management</h2>
                <div className="text-sm text-brown/60">
                    Total Orders: {orders.length}
                </div>
            </div>

            {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-10 text-brown/60">Loading orders...</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-10 text-brown/60 bg-white/50 rounded-xl border border-brown/10">No orders found.</div>
            ) : (
                <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-brown/10 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-brown/5 dark:bg-white/5 text-brown">
                                    <th className="p-4">Order ID</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} className="border-t border-brown/10 hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-mono text-xs text-brown/60">
                                            {order.id.slice(0, 8)}...
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-brown">{order.profiles?.full_name || 'Guest'}</div>
                                            <div className="text-xs text-brown/50">{order.profiles?.email}</div>
                                        </td>
                                        <td className="p-4 font-bold text-brown">
                                            ${order.total_amount}
                                        </td>
                                        <td className="p-4 text-sm text-brown/60">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="relative inline-block w-48">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    disabled={updatingId === order.id}
                                                    className={`w-full px-3 py-1.5 text-xs font-medium rounded-full appearance-none cursor-pointer border focus:outline-none focus:ring-2 focus:ring-terracotta disabled:opacity-50 transition-all ${getStatusColor(order.status)}`}
                                                >
                                                    {statusOptions.map(option => (
                                                        <option key={option} value={option}>
                                                            {option.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                                        </option>
                                                    ))}
                                                </select>
                                                {updatingId === order.id && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        <svg className="animate-spin h-3 w-3 text-brown" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManager;
