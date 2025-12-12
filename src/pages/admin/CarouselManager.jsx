import React, { useState, useEffect } from 'react';
import { contentService } from '../../services/contentService';
import { cloudinaryService } from '../../services/cloudinaryService';
import { useAlert } from '../../context/AlertContext';

const CarouselManager = () => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const { showAlert } = useAlert();

    const fetchSlides = async () => {
        try {
            const data = await contentService.getAllSlides();
            setSlides(data || []);
        } catch (error) {
            console.error("Error fetching slides:", error);
            showAlert("Failed to load slides", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlides();
    }, []);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const imageUrl = await cloudinaryService.uploadImage(file);
            // Create new slide immediately with the uploaded image
            await contentService.createSlide({
                image_url: imageUrl,
                title: 'New Slide',
                order_index: slides.length,
                is_active: true
            });
            showAlert("Slide uploaded successfully!", "success");
            fetchSlides(); // Refresh list
        } catch (error) {
            console.error("Upload failed", error);
            showAlert("Upload failed: " + error.message, "error");
        } finally {
            setUploading(false);
        }
    };

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [slideToDelete, setSlideToDelete] = useState(null);

    const checkDelete = (id) => {
        setSlideToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!slideToDelete) return;
        try {
            await contentService.deleteSlide(slideToDelete);
            setSlides(slides.filter(s => s.id !== slideToDelete));
            showAlert("Slide deleted", "success");
        } catch (error) {
            showAlert("Delete failed", "error");
        } finally {
            setDeleteModalOpen(false);
            setSlideToDelete(null);
        }
    };

    const handleToggleActive = async (slide) => {
        try {
            await contentService.updateSlide(slide.id, { is_active: !slide.is_active });
            setSlides(slides.map(s => s.id === slide.id ? { ...s, is_active: !s.is_active } : s));
        } catch (error) {
            showAlert("Update failed", "error");
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#2a2a2a] rounded-xl shadow-2xl max-w-sm w-full p-6 border border-gray-100 dark:border-white/10 transform transition-all scale-100">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Slide?</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to delete this slide? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium shadow-lg shadow-red-600/20 transition-all"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-brown dark:text-white">Hero Carousel Manager</h2>
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="slide-upload"
                        disabled={uploading}
                    />
                    <label
                        htmlFor="slide-upload"
                        className={`px-4 py-2 bg-terracotta text-white rounded-lg cursor-pointer hover:bg-terracotta/90 transition flex items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {uploading ? 'Uploading...' : '+ Add Slide'}
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slides.map((slide) => (
                    <div key={slide.id} className="bg-white dark:bg-[#2a2a2a] rounded-xl overflow-hidden shadow border border-brown/10 dark:border-white/5 group">
                        <div className="h-48 relative overflow-hidden">
                            <img src={slide.image_url} alt="Slide" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={() => checkDelete(slide.id)}
                                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        <div className="p-4 flex justify-between items-center">
                            <span className="text-sm font-medium text-brown dark:text-gray-300">Order: {slide.order_index}</span>
                            <button
                                onClick={() => handleToggleActive(slide)}
                                className={`px-2 py-1 text-xs rounded-full font-bold ${slide.is_active
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {slide.is_active ? 'Active' : 'Inactive'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {slides.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500 bg-white/50 dark:bg-white/5 rounded-xl border-dashed border-2 border-gray-300 dark:border-white/10">
                    <p>No slides found. Upload an image to get started.</p>
                </div>
            )}
        </div>
    );
};

export default CarouselManager;
