import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const categories = [
        { id: 1, name: 'Sweaters', icon: '🧶', path: '/products?category=sweaters' },
        { id: 2, name: 'Rompers', icon: '👶', path: '/products?category=rompers' },
        { id: 3, name: 'Swaddles', icon: '🍼', path: '/products?category=swaddles' },
    ];

    return (
        <>
            {/* Menu Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed left-4 top-24 z-50 p-3 bg-white dark:bg-sand rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-sand/30 dark:border-cloud/20"
                aria-label="Toggle menu"
            >
                <svg
                    className="w-6 h-6 text-brown dark:text-brown transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    {isOpen ? (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    ) : (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    )}
                </svg>
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed left-0 top-0 h-full w-72 bg-white dark:bg-sand shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-6 pt-24">
                    {/* Sidebar Header */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-brown dark:text-brown mb-2 transition-colors">
                            Categories
                        </h2>
                        <div className="w-16 h-1 bg-mauve rounded-full"></div>
                    </div>

                    {/* Category List */}
                    <nav className="space-y-2">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                to={category.path}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-4 p-4 rounded-lg hover:bg-ivory dark:hover:bg-ivory/10 transition-all duration-200 group"
                            >
                                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                                    {category.icon}
                                </span>
                                <span className="text-lg font-medium text-brown dark:text-brown group-hover:text-terracotta dark:group-hover:text-terracotta transition-colors">
                                    {category.name}
                                </span>
                            </Link>
                        ))}
                    </nav>

                    {/* Footer Section */}
                    <div className="mt-12 pt-6 border-t border-sand/30 dark:border-cloud/20">
                        <Link
                            to="/products"
                            onClick={() => setIsOpen(false)}
                            className="block text-center py-3 px-6 bg-aqua text-white rounded-lg hover:bg-aqua/80 transition-colors font-medium"
                        >
                            View All Products
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
