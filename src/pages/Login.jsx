import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Input validation
        if (!email || !password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        // Password validation
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            await authService.login({ email, password });

            // user
            const user = await authService.getCurrentUser();

            if (user?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-canvas dark:bg-charcoal px-4">
            <div className="max-w-md w-full py-12 px-8 glass shadow-lg rounded-xl">
                <h2 className="text-3xl font-bold text-center text-brown mb-8">
                    Welcome Back
                </h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-brown mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-brown/20 bg-white/50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-terracotta transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brown mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-brown/20 bg-white/50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-terracotta transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        <button
                            type="button"
                            disabled={loading}
                            onClick={async () => {
                                try {
                                    setLoading(true);
                                    setError('');
                                    await authService.loginWithGoogle();
                                } catch (err) {
                                    setError(err.message || 'Failed to login with Google');
                                    setLoading(false);
                                }
                            }}
                            className="w-full py-3 px-4 bg-white dark:bg-white/10 border border-brown/20 hover:bg-gray-50 dark:hover:bg-white/20 text-brown font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            Sign in with Google
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-brown/20"></span>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-charcoal text-brown/60 dark:text-gray-400">Or continue with email</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-terracotta hover:bg-terracotta/90 text-white font-medium rounded-lg shadow-md transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>

                    <div className="text-sm text-center text-brown/60 dark:text-gray-400">
                        Don't have an account?
                        <Link to="/signup" className="text-terracotta hover:underline ml-1">
                            Sign Up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
