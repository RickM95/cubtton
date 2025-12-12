
import { supabase } from '../utils/supabase';

export const authService = {
    // Sign up a new user
    async signUp({ email, password, fullName, username }) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    username: username,
                }
            }
        });
        if (error) throw error;
        return data;
    },

    // Log in an existing user
    async login({ email, password }) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    },

    // Log out
    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Get current session
    async getSession() {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    },

    // Get current user details including profile/role
    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Fetch profile to get role
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // Ignore "Row not found" if profile isn't ready yet
            console.error('Error fetching profile:', error);
        }

        return {
            ...user,
            role: profile?.role || 'client'
        };
    },

    // Update user profile (metadata)
    async updateProfile({ fullName, avatarUrl }) {
        const { data, error } = await supabase.auth.updateUser({
            data: {
                full_name: fullName,
                avatar_url: avatarUrl
            }
        });
        if (error) throw error;
        return data;
    }
};
