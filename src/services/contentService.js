import { supabase } from '../utils/supabase';

export const contentService = {
    // slides
    getSlides: async () => {
        const { data, error } = await supabase
            .from('carousel_slides')
            .select('*')
            .eq('is_active', true)
            .order('order_index', { ascending: true });

        if (error) throw error;
        return data;
    },

    // admin
    getAllSlides: async () => {
        const { data, error } = await supabase
            .from('carousel_slides')
            .select('*')
            .order('order_index', { ascending: true });

        if (error) throw error;
        return data;
    },

    // create
    createSlide: async (slideData) => {
        const { data, error } = await supabase
            .from('carousel_slides')
            .insert([slideData])
            .select();

        if (error) throw error;
        return data[0];
    },

    // update
    updateSlide: async (id, updates) => {
        const { data, error } = await supabase
            .from('carousel_slides')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    },

    // delete
    deleteSlide: async (id) => {
        const { error } = await supabase
            .from('carousel_slides')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
