
import React, { useEffect, useState, useRef } from 'react';
import { threadService } from '../../services/threadService';
import { cloudinaryService } from '../../services/cloudinaryService';

const ThreadManager = () => {
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentThreadId, setCurrentThreadId] = useState(null);
    const [error, setError] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState(null); // Role
    const fileInputRef = useRef(null);

    // State
    const [formData, setFormData] = useState({
        name: '',
        color_code: '#000000',
        image: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploading, setUploading] = useState(false);

    const fetchThreads = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await threadService.getThreads();
            setThreads(data || []);
        } catch (error) {
            console.error("Error fetching threads:", error);
            setError("Failed to load threads.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchThreads();

        // Auth
        const fetchRole = async () => {
            const user = await import('../../services/authService').then(m => m.authService.getCurrentUser());
            setCurrentUserRole(user?.role);
        };
        fetchRole();
    }, []);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [threadToDelete, setThreadToDelete] = useState(null);

    const checkDelete = (id) => {
        setThreadToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!threadToDelete) return;

        setError(null);
        try {
            await threadService.deleteThread(threadToDelete);
            setThreads(threads.filter(t => t.id !== threadToDelete));
        } catch (error) {
            console.error("Error deleting thread:", error);
            setError("Error deleting thread: " + error.message);
        } finally {
            setDeleteModalOpen(false);
            setThreadToDelete(null);
        }
    };

    const [success, setSuccess] = useState(null); // Add success

    const handleEdit = (thread) => {
        setError(null);
        setSuccess(null);
        setEditMode(true);
        setCurrentThreadId(thread.id);
        setFormData({
            name: thread.name,
            color_code: thread.color_code || '#000000',
            image: thread.image || ''
        });
        setImagePreview(thread.image);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setError(null);
        setSuccess(null);
        setEditMode(false);
        setCurrentThreadId(null);
        setFormData({ name: '', color_code: '#000000', image: '' });
        setImageFile(null);
        setImagePreview('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        setError(null);
        setSuccess(null);

        try {
            let imageUrl = formData.image;

            // Upload
            if (imageFile) {
                const uploadData = await cloudinaryService.uploadImage(imageFile);
                imageUrl = uploadData.secure_url;
            }

            const threadData = {
                ...formData,
                image: imageUrl
            };

            if (editMode && currentThreadId) {
                await threadService.updateThread(currentThreadId, threadData);
            } else {
                await threadService.createThread(threadData);
            }

            setSuccess(`Thread ${editMode ? 'updated' : 'created'} successfully!`);
            fetchThreads();

            // Close after delay
            setTimeout(() => {
                setIsModalOpen(false);
                setSuccess(null);
            }, 1000);

        } catch (error) {
            console.error(`Error ${editMode ? 'updating' : 'creating'} thread:`, error);
            setError(`Error ${editMode ? 'updating' : 'creating'} thread: ` + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brown">Thread Management</h2>
                {(currentUserRole === 'admin' || currentUserRole === 'supervisor') && (
                    <button
                        onClick={openCreateModal}
                        className="bg-terracotta text-white px-4 py-2 rounded-lg hover:bg-terracotta/90 transition shadow-md"
                    >
                        + Add Thread
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-6">
                    {success}
                </div>
            )}

            {loading ? (
                <div className="text-center py-10 text-brown/60">Loading threads...</div>
            ) : (
                <div className="bg-white/50 dark:bg-stone/5 rounded-xl border border-brown/10 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-brown/5 dark:bg-white/5 text-brown">
                                    <th className="p-4">Props</th>
                                    <th className="p-4">Color Name</th>
                                    <th className="p-4">Color Preview</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {threads.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-brown/50">
                                            No threads found. Add one to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    threads.map(thread => (
                                        <tr key={thread.id} className="border-t border-brown/10 hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                {thread.image ? (
                                                    <img src={thread.image} alt={thread.name} className="w-12 h-12 object-cover rounded-lg border border-brown/10" />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-400">No Img</div>
                                                )}
                                            </td>
                                            <td className="p-4 font-medium text-brown">{thread.name}</td>
                                            <td className="p-4">
                                                <div
                                                    className="w-8 h-8 rounded-full border border-brown/20 shadow-sm"
                                                    style={{ backgroundColor: thread.color_code || '#ccc' }}
                                                    title={thread.color_code}
                                                ></div>
                                            </td>
                                            <td className="p-4 flex justify-center space-x-3">
                                                {(currentUserRole === 'admin' || currentUserRole === 'supervisor') && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(thread)}
                                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => checkDelete(thread.id)}
                                                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#2a2a2a] p-8 rounded-2xl max-w-lg w-full shadow-2xl border border-brown/10 dark:border-white/10 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-brown dark:text-gray-100">
                                {editMode ? 'Edit Thread' : 'Add New Thread'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-brown dark:text-gray-200 mb-1">Color Name</label>
                                <input
                                    className="w-full px-4 py-2 border border-brown/20 rounded-lg bg-white/50 dark:bg-black/20 dark:border-white/10 text-brown dark:text-gray-100 focus:ring-2 focus:ring-terracotta focus:outline-none transition-all placeholder:text-brown/40 dark:placeholder:text-gray-400"
                                    placeholder="e.g. Midnight Blue"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-brown dark:text-gray-200 mb-1">Color Preview (Hex)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        className="h-10 w-16 p-1 rounded border border-brown/20 dark:border-white/10 bg-white dark:bg-black/20 cursor-pointer"
                                        value={formData.color_code}
                                        onChange={e => setFormData({ ...formData, color_code: e.target.value })}
                                    />
                                    <input
                                        className="flex-1 w-full px-4 py-2 border border-brown/20 rounded-lg bg-white/50 dark:bg-black/20 dark:border-white/10 text-brown dark:text-gray-100 focus:ring-2 focus:ring-terracotta focus:outline-none transition-all placeholder:text-brown/40 dark:placeholder:text-gray-400"
                                        placeholder="#000000"
                                        value={formData.color_code}
                                        onChange={e => setFormData({ ...formData, color_code: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-brown dark:text-gray-200 mb-1">Thread Image (Embossing Preview)</label>
                                <div className="border-2 border-dashed border-brown/20 dark:border-white/10 rounded-xl p-4 text-center hover:bg-brown/5 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    {imagePreview ? (
                                        <div className="relative inline-block group">
                                            <img src={imagePreview} alt="Preview" className="h-32 object-contain mx-auto rounded-lg shadow-sm" />
                                            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center rounded-lg text-white font-medium">Change Image</div>
                                        </div>
                                    ) : (
                                        <div className="py-4">
                                            <svg className="w-10 h-10 text-brown/40 dark:text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            <p className="text-brown/60 dark:text-gray-400 text-sm">Click to upload image</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 text-xs text-brown/50 dark:text-gray-500 text-right">
                                    {imageFile ? imageFile.name : formData.image ? 'Using existing image URL' : 'No image selected'}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-brown/10 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2 text-brown dark:text-gray-300 hover:bg-brown/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-6 py-2 bg-terracotta text-white font-medium rounded-lg hover:bg-terracotta/90 transition-colors shadow-lg shadow-terracotta/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                                >
                                    {uploading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Saving...
                                        </>
                                    ) : (
                                        editMode ? 'Update Thread' : 'Create Thread'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThreadManager;
