import React from 'react';
import { useCart } from '../context/CartContext';
import { useAlert } from '../context/AlertContext';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { showAlert } = useAlert();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    showAlert(`${product.name} added to cart!`, 'success');
  };

  return (
    <Link to={`/product/${product.id}`} className="block h-full">
      <div className="bg-white dark:bg-[#2A2320] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-sand/30 dark:border-white/5 group h-full flex flex-col">
        <div className="relative h-80 overflow-hidden bg-ivory dark:bg-[#3D3530]">
          {/* image */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:scale-105 transition-transform duration-700">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-4">
                <span className="block text-4xl mb-2">🧸</span>
                <span className="text-sm tracking-widest uppercase">No Image</span>
              </div>
            )}
          </div>
          {/* hover */}
          <div className="absolute inset-0 bg-black/5 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* button */}
          <div className="absolute bottom-4 left-0 right-0 px-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full py-3 bg-aqua text-white backdrop-blur-sm text-sm font-medium uppercase tracking-wider hover:bg-aqua/80 shadow-lg rounded-sm transition-colors"
            >
              Quick Add
            </button>
          </div>
        </div>

        <div className="p-6 text-center flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-medium text-brown dark:text-white mb-1 font-sans transition-colors group-hover:text-mauve dark:group-hover:text-terracotta">{product.name}</h3>
            <p className="text-mauve dark:text-terracotta font-medium">${Number(product.price).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
