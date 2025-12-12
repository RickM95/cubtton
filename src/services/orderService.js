
import { supabase } from '../utils/supabase';

export const orderService = {
    // orders
    async getAllOrders() {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                profiles:user_id (full_name, email)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // create
    async createOrder(orderData) {
        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // update
    async updateOrderStatus(id, status) {
        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // revenue
    async getMonthlyRevenue() {
        // aggregate

        const { data, error } = await supabase
            .from('orders')
            .select('total_amount, created_at')
            .eq('status', 'completed'); // Only count completed orders as revenue

        if (error) throw error;

        // group
        const revenueByMonth = data.reduce((acc, order) => {
            const date = new Date(order.created_at);
            const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });

            if (!acc[monthYear]) {
                acc[monthYear] = 0;
            }
            acc[monthYear] += order.total_amount;
            return acc;
        }, {});

        return Object.entries(revenueByMonth).map(([month, amount]) => ({
            month,
            amount
        }));
    },

    // stats
    async getStats() {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('status, total_amount');

        if (error) throw error;

        const totalOrders = orders.length;
        const totalRevenue = orders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + o.total_amount, 0);
        const pendingOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;

        return {
            totalOrders,
            totalRevenue,
            pendingOrders
        };
    }
};
