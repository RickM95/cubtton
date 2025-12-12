
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

const Signup = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        try {
            await authService.signUp({
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                username: formData.username
            });
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-canvas dark:bg-charcoal px-4 py-8">
            <div className="max-w-md w-full py-8 px-8 glass shadow-lg rounded-xl my-8">
                <h2 className="text-3xl font-bold text-center text-brown mb-8">
                    Create Account
                </h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-brown mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-brown/20 bg-white/50 dark:bg-charcoal/50 focus:outline-none focus:ring-2 focus:ring-terracotta transition-all"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brown mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-brown/20 bg-white/50 dark:bg-charcoal/50 focus:outline-none focus:ring-2 focus:ring-terracotta transition-all"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="johndoe123"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brown mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-brown/20 bg-white/50 dark:bg-charcoal/50 focus:outline-none focus:ring-2 focus:ring-terracotta transition-all"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brown mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-brown/20 bg-white/50 dark:bg-charcoal/50 focus:outline-none focus:ring-2 focus:ring-terracotta transition-all"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brown mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-brown/20 bg-white/50 dark:bg-charcoal/50 focus:outline-none focus:ring-2 focus:ring-terracotta transition-all"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 mt-6 bg-terracotta hover:bg-terracotta/90 text-white font-medium rounded-lg shadow-md transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div className="text-sm text-center text-brown/60/60 mt-4">
                        Already have an account?
                        <Link to="/login" className="text-terracotta hover:underline ml-1">
                            Sign In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
