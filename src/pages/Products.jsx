import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import { useAlert } from '../context/AlertContext';
import HeroCarousel from '../components/HeroCarousel';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getProducts();
        setProducts(data || []);
      } catch (err) {
        setError(err.message);
        showAlert('Failed to load products: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [showAlert]);

  return (
    <div className="animate-fade-in relative min-h-screen">
      {/* hero */}
      <div className="relative bg-ivory dark:bg-gradient-to-b dark:from-[#3D3530] dark:to-[#4A3F35] py-20 lg:py-32 overflow-hidden transition-colors">
        {/* carousel */}
        <HeroCarousel />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-brown dark:text-white mb-6 tracking-tight font-sans transition-colors">
            Little <span className="text-mauve dark:text-terracotta">Cubtton</span>
          </h1>
          <p className="text-xl text-brown/70 dark:text-white/80 max-w-2xl mx-auto mb-10 font-light transition-colors">
            Stylish and personalized baby clothing and accessories.
          </p>
          <button
            className="px-8 py-3 bg-aqua dark:bg-terracotta text-white dark:text-[#3D3530] rounded-full hover:bg-aqua/80 dark:hover:bg-terracotta/90 transition-colors shadow-lg hover:shadow-xl cursor-pointer font-medium"
            onClick={() => showAlert('Collection exploring started!', 'success')}
          >
            Shop Collection
          </button>
        </div>

        {/* decor */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-sand/20 dark:bg-terracotta/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-mauve/10 dark:bg-sage/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      </div>

      {/* list */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-brown dark:text-white mb-4 transition-colors">New Arrivals</h2>
          <div className="w-20 h-1 bg-aqua mx-auto rounded-full"></div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-16 h-16 border-4 border-mauve/30 border-t-mauve rounded-full animate-spin"></div>
            <p className="mt-4 text-brown/60 dark:text-gray-400 animate-pulse">Finding the cutest items...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-10 bg-red-50 dark:bg-red-900/10 rounded-xl mx-auto max-w-lg border border-red-100 dark:border-red-900/20">
            <p className="text-red-500 mb-4">Oops! Something went wrong.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-100 dark:bg-red-800/30 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="col-span-2 text-center text-brown/60 dark:text-white/60">No products available yet.</p>
            )}
          </div>
        )}
      </div>

      {/* newsletter */}
      <div className="bg-white dark:bg-[#2A2320] py-20 border-t border-sand/30 dark:border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-brown dark:text-terracotta mb-4 transition-colors">Follow us on Instagram</h3>
          <p className="text-brown/70 dark:text-white/60 transition-colors">@cubtton</p>
        </div>
      </div>
    </div>
  );
};

export default Products;
