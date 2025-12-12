
import { supabase } from '../utils/supabase';

export const authService = {
    // signup
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

    // login
    async login({ email, password }) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    },

    // google
    async loginWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
        return data;
    },

    // logout
    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // session
    async getSession() {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    },

    // user
    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // profile
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // check
            console.error('Error fetching profile:', error);
        }

        return {
            ...user,
            role: profile?.role || 'client'
        };
    },

    // update
    async updateProfile({ fullName, avatarUrl }) {
        const { data, error } = await supabase.auth.updateUser({
            data: {
                full_name: fullName,
                avatar_url: avatarUrl
            }
        });
        if (error) throw error;
        return data;
    },

    // password
    async updatePassword(newPassword) {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });
        if (error) throw error;
        return data;
    }
};
