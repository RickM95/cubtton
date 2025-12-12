import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import { useAlert } from '../context/AlertContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
    const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    if (!isCartOpen) return null;

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        try {
            const user = await authService.getCurrentUser();
            if (!user) {
                setIsCartOpen(false);
                showAlert('Please login to checkout', 'info');
                navigate('/login');
                return;
            }

            // order
            await orderService.createOrder({
                user_id: user.id,
                total_amount: cartTotal,
                status: 'ordered'
                // items
            });

            clearCart();
            setIsCartOpen(false);
            showAlert('Order placed successfully!', 'success');
            // navigate('/orders'); // If we had a user orders page
        } catch (error) {
            console.error("Checkout error:", error);
            showAlert('Failed to place order: ' + error.message, 'error');
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />

            <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
                <div className="h-full w-full flex flex-col bg-[#4A3F35] shadow-xl transform transition-transform duration-300 ease-in-out">
                    <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                            <h2 className="text-lg font-medium text-white">Shopping Cart</h2>
                            <button
                                type="button"
                                className="text-gray-300 hover:text-white"
                                onClick={() => setIsCartOpen(false)}
                            >
                                <span className="sr-only">Close panel</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-8">
                            {cart.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-gray-200 font-medium">Your cart is empty.</p>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="mt-4 text-terracotta hover:underline"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                <div className="flow-root">
                                    <ul className="-my-6 divide-y divide-white/10">
                                        {cart.map((product) => (
                                            <li key={product.id} className="py-6 flex">
                                                <div className="flex-shrink-0 w-24 h-24 border border-gray-200 dark:border-white/10 rounded-md overflow-hidden">
                                                    {product.image_url ? (
                                                        <img
                                                            src={product.image_url}
                                                            alt={product.title}
                                                            className="w-full h-full object-center object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs text-gray-400">No Img</div>
                                                    )}
                                                </div>

                                                <div className="ml-4 flex-1 flex flex-col">
                                                    <div>
                                                        <div className="flex justify-between text-base font-medium text-white">
                                                            <h3>{product.title}</h3>
                                                            <p className="ml-4">
                                                                ${(() => {
                                                                    const p = parseFloat(typeof product.price === 'string' ? product.price.replace(/[^0-9.]/g, '') : product.price);
                                                                    return isNaN(p) ? '0.00' : p.toFixed(2);
                                                                })()}
                                                            </p>
                                                        </div>
                                                        <p className="mt-1 text-sm text-gray-300 font-medium">{product.category}</p>
                                                    </div>
                                                    <div className="flex-1 flex items-end justify-between text-sm">
                                                        <div className="flex items-center border border-white/20 rounded">
                                                            <button
                                                                onClick={() => updateQuantity(product.id, product.quantity - 1)}
                                                                className="px-2 py-1 hover:bg-white/10 text-white font-bold"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="px-2 py-1 text-white border-x border-white/20 font-bold">
                                                                {product.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(product.id, product.quantity + 1)}
                                                                className="px-2 py-1 hover:bg-white/10 text-white font-bold"
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                        <div className="flex">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFromCart(product.id)}
                                                                className="font-medium text-terracotta hover:text-terracotta/80"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {cart.length > 0 && (
                        <div className="border-t border-white/10 py-6 px-4 sm:px-6 bg-[#4A3F35]">
                            <div className="flex justify-between text-base font-medium text-white">
                                <p>Subtotal</p>
                                <p>${cartTotal.toFixed(2)}</p>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-300">Shipping and taxes calculated at checkout.</p>
                            <div className="mt-6">
                                <button
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut}
                                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-terracotta hover:bg-terracotta/90 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isCheckingOut ? 'Processing...' : 'Checkout'}
                                </button>
                            </div>
                            <div className="mt-6 flex justify-center text-sm text-center text-gray-300">
                                <p>
                                    or{' '}
                                    <button
                                        type="button"
                                        className="text-terracotta font-medium hover:text-terracotta/80"
                                        onClick={() => setIsCartOpen(false)}
                                    >
                                        Continue Shopping<span aria-hidden="true"> &rarr;</span>
                                    </button>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartDrawer;
