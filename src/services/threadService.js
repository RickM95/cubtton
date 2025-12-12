
import { supabase } from '../utils/supabase';

export const threadService = {
    // Get all threads
    async getThreads() {
        const { data, error } = await supabase
            .from('threads')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Get single thread by ID
    async getThreadById(id) {
        const { data, error } = await supabase
            .from('threads')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Create new thread
    async createThread(threadData) {
        const { data, error } = await supabase
            .from('threads')
            .insert([threadData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update existing thread
    async updateThread(id, updates) {
        const { data, error } = await supabase
            .from('threads')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete thread
    async deleteThread(id) {
        const { error } = await supabase
            .from('threads')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
