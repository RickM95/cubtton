
import axios from 'axios';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const cloudinaryService = {
    // Upload image to Cloudinary
    async uploadImage(file) {
        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            throw new Error('Cloudinary credentials missing in .env');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                formData
            );
            return response.data.secure_url; // access .secure_url for the image link
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw new Error('Failed to upload image');
        }
    }
};
