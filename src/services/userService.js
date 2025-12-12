
import { supabase } from '../utils/supabase';

export const userService = {
    // Get all user profiles
    async getAllUsers() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Update user role
    async updateUserRole(userId, newRole) {
        const { data, error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update user detail (full name, etc - Admin override)
    async updateUserProfile(userId, updates) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Trigger password reset email
    async sendPasswordReset(email) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/update-password',
        });
        if (error) throw error;
        return data;
    }
};
