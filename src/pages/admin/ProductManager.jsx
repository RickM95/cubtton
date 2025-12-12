
import React, { useEffect, useState, useRef } from 'react';
import { productService } from '../../services/productService';
import { cloudinaryService } from '../../services/cloudinaryService';

const ProductManager = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [error, setError] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState(null); // role
    const fileInputRef = useRef(null);

    // State
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        description: '',
        category: '',
        image: ''
    });

    const [stagingImages, setStagingImages] = useState([]); // { id: uniqueId, file: File|null, url: string, isMain: boolean }
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(null);

    const fetchProducts = async () => {
        console.log("fetching");
        setLoading(true);
        setError(null);
        try {
            // get
            const data = await productService.getProducts();
            console.log(data);
            setProducts(data || []);
        } catch (error) {
            console.log("error");
            console.error("Error fetching products:", error);
            setError("Failed to load products. " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();

        // Auth
        const fetchRole = async () => {
            const user = await import('../../services/authService').then(m => m.authService.getCurrentUser());
            setCurrentUserRole(user?.role);
        };
        fetchRole();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        setError(null);
        try {
            await productService.deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error deleting product:", error);
            setError("Error deleting product: " + error.message);
        }
    };

    const handleFilesSelected = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newImages = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file: file,
            url: URL.createObjectURL(file), // Create local preview
            isMain: stagingImages.length === 0 && files.indexOf(file) === 0 // First image is main if none exist
        }));

        setStagingImages(prev => {
            const updated = [...prev, ...newImages];
            // main
            if (!updated.some(img => img.isMain) && updated.length > 0) {
                updated[0].isMain = true;
            }
            return updated;
        });
    };

    const toggleMainImage = (index) => {
        setStagingImages(prev => prev.map((img, i) => ({
            ...img,
            isMain: i === index
        })));
    };

    const removeImage = (index) => {
        if (!window.confirm("Are you sure you want to delete this image?")) return;
        setStagingImages(prev => {
            const wasMain = prev[index].isMain;
            const updated = prev.filter((_, i) => i !== index);
            if (wasMain && updated.length > 0) {
                updated[0].isMain = true;
            }
            return updated;
        });
    };

    const handleQuickStockUpdate = async (id, newStock) => {
        const stockValue = parseInt(newStock);
        if (isNaN(stockValue) || stockValue < 0) return;

        try {
            await productService.updateProduct(id, { stock: stockValue });
            setProducts(products.map(p => p.id === id ? { ...p, stock: stockValue } : p));
            setSuccess('Stock updated');
            setTimeout(() => setSuccess(null), 1500);
        } catch (error) {
            console.error("Error updating stock:", error);
            setError("Failed to update stock");
        }
    };

    // ... (handleEdit and openCreateModal remain the same - no changes needed there, so I will skip them in this replace block if possible, but I need to target the JSX which is further down.
    // Actually, I can use two replace blocks or just one large one if the distance isn't too huge.
    // removeImage is at line 94. The JSX is at line 426.
    // I should probably do two separate edits to be safe and clean.)

    // EDIT 1: Update removeImage
    // EDIT 2: Update JSX
    // I will do two separate calls or use multi_replace.
    // I'll use separate calls for clarity since I can't use multi_replace for "non-contiguous" properly if I want to be very specific about the blocks.
    // Wait, multi_replace IS for non-contiguous. I should use multi_replace.


    const handleEdit = (product) => {
        setError(null);
        setSuccess(null);
        setEditMode(true);
        setCurrentProductId(product.id);

        // Populate staging images
        const initialImages = [];
        if (product.image_url) {
            initialImages.push({ id: 'main', file: null, url: product.image_url, isMain: true });
        }
        if (product.additional_images && Array.isArray(product.additional_images)) {
            product.additional_images.forEach((url, i) => {
                initialImages.push({ id: `extra-${i}`, file: null, url: url, isMain: false });
            });
        }
        setStagingImages(initialImages);

        setFormData({
            title: product.title,
            price: product.price,
            stock: product.stock || 0,
            description: product.description || '',
            category: product.category || ''
        });
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setError(null);
        setSuccess(null);
        setEditMode(false);
        setCurrentProductId(null);
        setFormData({ title: '', price: '', stock: 0, description: '', category: '', image: '' });
        setStagingImages([]);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("submit form");
        setUploading(true);
        setError(null);
        setSuccess(null);

        try {
            // Process images
            const finalImages = [];

            // Upload new files and keep existing URLs
            for (const img of stagingImages) {
                let url = img.url;
                if (img.file) {
                    url = await cloudinaryService.uploadImage(img.file);
                }
                finalImages.push({ url, isMain: img.isMain });
            }

            // Determine main image and additional images
            const mainImgObj = finalImages.find(img => img.isMain) || finalImages[0];
            const imageUrl = mainImgObj ? mainImgObj.url : '';

            // Filter out main image from additional images list
            const additionalImages = finalImages
                .filter(img => img !== mainImgObj)
                .map(img => img.url);

            const productData = {
                title: formData.title,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock) || 0,
                description: formData.description,
                category: formData.category,
                image_url: imageUrl,
                additional_images: additionalImages
            };

            if (editMode && currentProductId) {
                await productService.updateProduct(currentProductId, productData);
            } else {
                await productService.createProduct(productData);
            }

            setSuccess(`Product ${editMode ? 'updated' : 'created'} successfully!`);
            fetchProducts();

            // Close after delay
            setTimeout(() => {
                setIsModalOpen(false);
                setSuccess(null);
            }, 1000);

        } catch (error) {
            console.error(`Error ${editMode ? 'updating' : 'creating'} product:`, error);
            setError(`Error ${editMode ? 'updating' : 'creating'} product: ` + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brown">Product Management</h2>
                {(currentUserRole === 'admin' || currentUserRole === 'supervisor') && (
                    <button
                        onClick={openCreateModal}
                        className="bg-terracotta text-white px-4 py-2 rounded-lg hover:bg-terracotta/90 transition shadow-md"
                    >
                        + Add Product
                    </button>
                )}
            </div>

            {error && !isModalOpen && !deleteModalOpen && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Inline success for stock update */}
            {success && !isModalOpen && (
                <div className="fixed bottom-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up">
                    {success}
                </div>
            )}

            {loading ? (
                <div className="text-center py-10 text-brown/60">Loading products...</div>
            ) : (
                <div className="bg-white/50 dark:bg-stone/5 rounded-xl border border-brown/10 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-brown/5 dark:bg-white/5 text-brown">
                                    <th className="p-4">Image</th>
                                    <th className="p-4">Title</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4">Stock</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-brown/50">
                                            No products found. Add one to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    products.map(product => (
                                        <tr key={product.id} className="border-t border-brown/10 hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.title} className="w-12 h-12 object-cover rounded-lg border border-brown/10" />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-400">No Img</div>
                                                )}
                                            </td>
                                            <td className="p-4 font-medium text-brown">{product.title}</td>
                                            <td className="p-4 text-brown">${product.price}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        defaultValue={product.stock || 0}
                                                        className="w-20 px-2 py-1 border border-brown/20 rounded bg-white/50 dark:bg-black/20 text-sm focus:ring-1 focus:ring-terracotta outline-none"
                                                        onBlur={(e) => {
                                                            const val = parseInt(e.target.value);
                                                            if (val !== product.stock) {
                                                                handleQuickStockUpdate(product.id, val);
                                                            }
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                const val = parseInt(e.target.value);
                                                                if (val !== product.stock) {
                                                                    handleQuickStockUpdate(product.id, val);
                                                                }
                                                                e.target.blur();
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-brown">{product.category}</td>
                                            <td className="p-4 flex justify-center space-x-3">
                                                {(currentUserRole === 'admin' || currentUserRole === 'supervisor') && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(product)}
                                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => checkDelete(product.id)}
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
                    <div className="bg-white dark:bg-[#2a2a2a] p-8 rounded-2xl max-w-2xl w-full shadow-2xl border border-brown/10 dark:border-white/10 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-brown dark:text-gray-100">
                                {editMode ? 'Edit Product' : 'Add New Product'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
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

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-brown dark:text-gray-200 mb-1">Product Title</label>
                                    <input
                                        className="w-full px-4 py-2 border border-brown/20 rounded-lg bg-white/50 dark:bg-black/20 dark:border-white/10 text-brown dark:text-gray-100 focus:ring-2 focus:ring-terracotta focus:outline-none transition-all placeholder:text-brown/40 dark:placeholder:text-gray-400"
                                        placeholder="e.g. Summer Dress"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />

                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brown dark:text-gray-200 mb-1">Stock</label>
                                    <input
                                        className="w-full px-4 py-2 border border-brown/20 rounded-lg bg-white/50 dark:bg-black/20 dark:border-white/10 text-brown dark:text-gray-100 focus:ring-2 focus:ring-terracotta focus:outline-none transition-all placeholder:text-brown/40 dark:placeholder:text-gray-400"
                                        placeholder="0"
                                        type="number"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-brown dark:text-gray-200 mb-1">Price</label>
                                    <input
                                        className="w-full px-4 py-2 border border-brown/20 rounded-lg bg-white/50 dark:bg-black/20 dark:border-white/10 text-brown dark:text-gray-100 focus:ring-2 focus:ring-terracotta focus:outline-none transition-all placeholder:text-brown/40 dark:placeholder:text-gray-400"
                                        placeholder="0.00"
                                        type="number" step="0.01"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brown dark:text-gray-200 mb-1">Category</label>
                                    <input
                                        className="w-full px-4 py-2 border border-brown/20 rounded-lg bg-white/50 dark:bg-black/20 dark:border-white/10 text-brown dark:text-gray-100 focus:ring-2 focus:ring-terracotta focus:outline-none transition-all placeholder:text-brown/40 dark:placeholder:text-gray-400"
                                        placeholder="e.g. Clothing, Accessories"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-brown dark:text-gray-200 mb-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-brown/20 rounded-lg bg-white/50 dark:bg-black/20 dark:border-white/10 text-brown dark:text-gray-100 focus:ring-2 focus:ring-terracotta focus:outline-none transition-all h-24 resize-none placeholder:text-brown/40 dark:placeholder:text-gray-400"
                                    placeholder="Product description..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            {/* Unified Image Upload Section */}
                            <div>
                                <label className="block text-sm font-medium text-brown dark:text-gray-200 mb-2">Product Images</label>
                                <p className="text-xs text-brown/60 dark:text-gray-400 mb-3">Upload all images here. Click the "Star" to set the main thumbnail.</p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    {/* Existing Staged Images */}
                                    {stagingImages.map((img, index) => (
                                        <div key={img.id} className={`relative group rounded-lg overflow-hidden border-2 h-24 ${img.isMain ? 'border-terracotta ring-2 ring-terracotta/30' : 'border-brown/10'}`}>
                                            <img src={img.url} alt={`Product ${index}`} className="w-full h-full object-cover" />

                                            {/* Star Button - Always Visible (conditionally styled) */}
                                            <button
                                                type="button"
                                                onClick={() => toggleMainImage(index)}
                                                className={`absolute top-1 right-1 p-1.5 rounded-full shadow-md z-10 transition-colors ${img.isMain ? 'bg-yellow-400 text-white' : 'bg-white/80 text-gray-400 hover:bg-yellow-400 hover:text-white'}`}
                                                title="Set as Main Image"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            </button>

                                            {/* Delete Button - Visible on Hover */}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute bottom-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10 hover:bg-red-600"
                                                title="Remove"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>

                                            {/* Main indicator badge */}
                                            {img.isMain && (
                                                <div className="absolute top-1 left-1 bg-terracotta text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm z-10">Main</div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Add Button */}
                                    <div className="border-2 border-dashed border-brown/20 dark:border-white/10 rounded-xl h-24 flex items-center justify-center cursor-pointer hover:bg-brown/5 dark:hover:bg-white/5 transition-colors relative">
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFilesSelected}
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <div className="text-center">
                                            <span className="text-3xl text-brown/40 block mb-1">+</span>
                                            <span className="text-[10px] text-brown/40 uppercase tracking-widest">Add Images</span>
                                        </div>
                                    </div>
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
                                        editMode ? 'Update Product' : 'Create Product'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div >
                </div >
            )}
        </div >
    );
};

export default ProductManager;
