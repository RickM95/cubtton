
import React, { useEffect, useState } from 'react';
import { productService } from '../../services/productService';

const ProductManager = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        description: '',
        category: '',
        image: ''
    });

    const fetchProducts = async () => {
        try {
            const data = await productService.getProducts();
            setProducts(data || []);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await productService.deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            alert("Error deleting product: " + error.message);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await productService.createProduct(formData);
            setIsModalOpen(false);
            setFormData({ title: '', price: '', description: '', category: '', image: '' });
            fetchProducts(); // Refresh list
        } catch (error) {
            alert("Error creating product: " + error.message);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brown dark:text-stone">Product Management</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-terracotta text-white px-4 py-2 rounded-lg hover:bg-terracotta/90 transition"
                >
                    + Add Product
                </button>
            </div>

            {loading ? (
                <p>Loading products...</p>
            ) : (
                <div className="bg-white/50 dark:bg-stone/5 rounded-xl border border-brown/10 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-brown/5 dark:bg-white/5 text-brown dark:text-stone">
                                <th className="p-4">Image</th>
                                <th className="p-4">Title</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} className="border-t border-brown/10 hover:bg-white/40 dark:hover:bg-white/5">
                                    <td className="p-4">
                                        <img src={product.image} alt={product.title} className="w-12 h-12 object-cover rounded" />
                                    </td>
                                    <td className="p-4 font-medium">{product.title}</td>
                                    <td className="p-4">${product.price}</td>
                                    <td className="p-4 text-sm text-brown/60">{product.category}</td>
                                    <td className="p-4 space-x-2">
                                        <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Simple Modal for Add Product */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-charcoal p-8 rounded-xl max-w-lg w-full">
                        <h3 className="text-xl font-bold mb-4 dark:text-stone">Add New Product</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <input
                                className="w-full p-2 border rounded dark:bg-stone/10"
                                placeholder="Product Title"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    className="w-full p-2 border rounded dark:bg-stone/10"
                                    placeholder="Price"
                                    type="number" step="0.01"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                                <input
                                    className="w-full p-2 border rounded dark:bg-stone/10"
                                    placeholder="Category"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    required
                                />
                            </div>
                            <input
                                className="w-full p-2 border rounded dark:bg-stone/10"
                                placeholder="Image URL"
                                value={formData.image}
                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                                required
                            />
                            <textarea
                                className="w-full p-2 border rounded dark:bg-stone/10 h-24"
                                placeholder="Description"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />

                            <div className="flex justify-end space-x-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-terracotta text-white rounded hover:bg-terracotta/90"
                                >
                                    Create Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManager;
