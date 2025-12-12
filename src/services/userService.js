
import { supabase } from '../utils/supabase';

export const userService = {
    // Get all profiles/users
    async getUsers() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get table row count (useful for stats)
    async getUserCount() {
        const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;
        return count;
    },

    // Update user role (Admin only)
    async updateUserRole(id, newRole) {
        const { data, error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update user profile details
    async updateUserProfile(id, updates) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete user (Admin only - currently deletes profile)
    async deleteUser(id) {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
