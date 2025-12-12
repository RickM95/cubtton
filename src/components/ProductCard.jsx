import React from 'react';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white dark:bg-sand rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-sand/30 dark:border-cloud/20 group">
      <div className="relative h-80 overflow-hidden bg-ivory dark:bg-ivory/10">
        {/* Image Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:scale-105 transition-transform duration-700">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-4">
              <span className="block text-4xl mb-2">🧸</span>
              <span className="text-sm tracking-widest uppercase">No Image</span>
            </div>
          )}
        </div>
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/5 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Quick Add Button - appears on hover */}
        <div className="absolute bottom-4 left-0 right-0 px-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button className="w-full py-3 bg-aqua text-white backdrop-blur-sm text-sm font-medium uppercase tracking-wider hover:bg-aqua/80 shadow-lg rounded-sm transition-colors">
            Quick Add
          </button>
        </div>
      </div>

      <div className="p-6 text-center">
        <h3 className="text-lg font-medium text-brown dark:text-brown mb-1 font-sans transition-colors">{product.name}</h3>
        <p className="text-mauve dark:text-mauve font-medium">{product.price}</p>
      </div>
    </div>
  );
};

export default ProductCard;
