import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAlert } from '../context/AlertContext';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { showAlert } = useAlert();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await productService.getProductById(id);
                setProduct(data);
                setSelectedImage(data.image_url);
            } catch (err) {
                console.error("Error fetching product details:", err);
                setError("Failed to load product details.");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product);
            showAlert(`${product.name} added to cart!`, 'success');
        }
    };

    if (loading) return (
        <div className="min-h-screen pt-24 flex items-center justify-center bg-ivory dark:bg-[#2A2320]">
            <div className="w-16 h-16 border-4 border-mauve border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error || !product) return (
        <div className="min-h-screen pt-24 text-center bg-ivory dark:bg-[#2A2320] text-brown dark:text-gray-200">
            <h2 className="text-2xl font-bold mb-4">Product not found</h2>
            <button onClick={() => navigate(-1)} className="text-mauve hover:underline">Go Back</button>
        </div>
    );

    const allImages = [product.image_url, ...(product.additional_images || [])].filter(Boolean);

    return (
        <div className="min-h-screen bg-ivory dark:bg-[#2A2320] text-brown dark:text-gray-100 font-sans pt-24 pb-12 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* back */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center text-brown/60 dark:text-gray-400 hover:text-mauve dark:hover:text-terracotta transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Products
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                    {/* gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-square bg-white dark:bg-[#3D3530] rounded-2xl overflow-hidden shadow-sm border border-brown/5 dark:border-white/5">
                            {selectedImage ? (
                                <img
                                    src={selectedImage}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-4 transition-all duration-300"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-brown/20 dark:text-gray-600 text-4xl">
                                    🧸
                                </div>
                            )}
                        </div>

                        {/* thumbs */}
                        {allImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={`w-20 h-20 flex-shrink-0 bg-white dark:bg-[#3D3530] rounded-lg border-2 overflow-hidden transition-all ${selectedImage === img ? 'border-mauve dark:border-terracotta' : 'border-transparent hover:border-mauve/50'}`}
                                    >
                                        <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* info */}
                    <div className="flex flex-col justify-center">
                        <span className="text-mauve dark:text-terracotta text-sm uppercase tracking-widest font-bold mb-2">{product.category || 'Collection'}</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-brown dark:text-white mb-4 tracking-tight">{product.name}</h1>

                        <div className="flex items-center mb-6">
                            <span className="text-3xl font-medium text-brown dark:text-gray-100 mr-4">${Number(product.price).toFixed(2)}</span>
                            {product.stock > 0 ? (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">In Stock</span>
                            ) : (
                                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase tracking-wider">Out of Stock</span>
                            )}
                        </div>

                        <div className="prose prose-brown dark:prose-invert max-w-none mb-8 text-brown/80 dark:text-gray-300 leading-relaxed">
                            <p>{product.description || "No description available for this beautiful item yet."}</p>
                        </div>

                        <div className="mt-auto pt-6 border-t border-brown/10 dark:border-white/10">
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className={`w-full md:w-auto px-8 py-4 text-lg font-bold rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3 ${product.stock > 0
                                    ? 'bg-aqua dark:bg-terracotta text-white hover:shadow-xl hover:bg-aqua/90 dark:hover:bg-terracotta/90'
                                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
