
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { cloudinaryService } from '../services/cloudinaryService';

const Profile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // User State
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        role: '',
        avatarUrl: ''
    });

    // Password State
    const [passwordForm, setPasswordForm] = useState({
        new: '',
        confirm: ''
    });

    // UI State
    const [loading, setLoading] = useState({
        data: true,
        image: false,
        password: false,
        name: false
    });
    // Name Editing State
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });

useEffect(() => {
        const fetchProfile = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                    setProfile({
                        name: currentUser.user_metadata?.full_name || 'User',
                        email: currentUser.email,
                        role: currentUser.role || 'Client',
                        avatarUrl: currentUser.user_metadata?.avatar_url || ''
                    });
                } else {
                    navigate('/login');
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                setMessage({ text: 'Failed to load profile.', type: 'error' });
            } finally {
                setLoading(prev => ({ ...prev, data: false }));
            }
        };
        
        fetchProfile();
}, [navigate]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(prev => ({ ...prev, image: true }));
        setMessage({ text: '', type: '' });

        try {
            // 1. Upload to Cloudinary
            const uploadData = await cloudinaryService.uploadImage(file);
            const newAvatarUrl = uploadData.secure_url;

            // 2. Update Supabase Profile
            await authService.updateProfile({
                fullName: profile.name,
                avatarUrl: newAvatarUrl
            });

            // 3. Update Local State
            setProfile(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
            setMessage({ text: 'Profile picture updated!', type: 'success' });
        } catch (error) {
            console.error("Upload error:", error);
            setMessage({ text: 'Failed to upload image.', type: 'error' });
        } finally {
            setLoading(prev => ({ ...prev, image: false }));
        }
    };

    const handleNameUpdate = async () => {
        if (!newName.trim() || newName === profile.name) {
            setIsEditingName(false);
            return;
        }

        setLoading(prev => ({ ...prev, name: true }));
        try {
            await authService.updateProfile({ fullName: newName });

            // Update local state
            setProfile(prev => ({ ...prev, name: newName }));
            setUser(prev => ({ ...prev, user_metadata: { ...prev.user_metadata, full_name: newName } }));
            setMessage({ text: 'Name updated successfully!', type: 'success' });
            setIsEditingName(false);
        } catch (error) {
            setMessage({ text: 'Error updating name: ' + error.message, type: 'error' });
        } finally {
            setLoading(prev => ({ ...prev, name: false }));
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (passwordForm.new.length < 6) {
            setMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
            return;
        }
        if (passwordForm.new !== passwordForm.confirm) {
            setMessage({ text: 'Passwords do not match.', type: 'error' });
            return;
        }

        setLoading(prev => ({ ...prev, password: true }));

        try {
            await authService.updatePassword(passwordForm.new);
            setMessage({ text: 'Password updated successfully!', type: 'success' });
            setPasswordForm({ new: '', confirm: '' });
        } catch (error) {
            setMessage({ text: 'Error updating password: ' + error.message, type: 'error' });
        } finally {
            setLoading(prev => ({ ...prev, password: false }));
        }
    };

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };

    if (loading.data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-canvas dark:bg-charcoal">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-terracotta"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-canvas dark:bg-charcoal py-12 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-full hover:bg-brown/10 dark:hover:bg-white/10 text-brown transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-brown">My Profile</h1>
                            <p className="text-brown/60 dark:text-gray-400 capitalize">{profile.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium border border-red-100"
                    >
                        Sign Out
                    </button>
                </div>

                {/* Notifications */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                        }`}>
                        <span>{message.type === 'success' ? '✅' : '❌'}</span>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Personal Info */}
                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-2xl shadow-sm border border-brown/10 dark:border-white/10 p-8">
                        <div className="flex items-center mb-8">
                            <div className="relative group mr-6">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-terracotta/20 bg-gray-100 dark:bg-white/10">
                                    {profile.avatarUrl ? (
                                        <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-brown/40 dark:text-white/40 text-4xl font-bold">
                                            {profile.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="absolute bottom-0 right-0 p-2 bg-terracotta text-white rounded-full shadow-lg hover:bg-terracotta/90 transition-transform hover:scale-105"
                                    title="Upload Photo"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-brown">Personal Info</h2>
                                <p className="text-brown/60 dark:text-gray-400">Manage your account details</p>
                            </div>
                        </div>

                        {loading.image && (
                            <div className="mb-6 text-sm text-terracotta animate-pulse">
                                Uploading new photo...
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="pb-4 border-b border-brown/5 dark:border-white/5">
                                <p className="text-sm text-brown/50 dark:text-gray-400 mb-1">Full Name</p>
                                {isEditingName ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="px-3 py-1 border border-brown/20 rounded-lg bg-white/50 dark:bg-black/20 text-brown dark:text-gray-100 flex-1"
                                        />
                                        <button onClick={handleNameUpdate} disabled={loading.name} className="px-3 py-1 bg-terracotta text-white rounded-lg text-sm hover:bg-terracotta/90">{loading.name ? '...' : 'Save'}</button>
                                        <button onClick={() => setIsEditingName(false)} className="px-3 py-1 text-brown/60 hover:text-brown text-sm">Cancel</button>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center group">
                                        <p className="font-medium text-brown dark:text-stone text-lg">{profile.name}</p>
                                        <button
                                            onClick={() => {
                                                setNewName(profile.name);
                                                setIsEditingName(true);
                                            }}
                                            className="text-terracotta opacity-0 group-hover:opacity-100 transition-opacity text-sm hover:underline"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>
                            <InfoField label="Email Address" value={profile.email} />
                            {profile.role === 'admin' && <InfoField label="Role" value={profile.role} capitalize />}
                            <InfoField label="User ID" value={user?.id} mono />
                        </div>
                    </div>

                    {/* Right Column: Security */}
                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-2xl shadow-sm border border-brown/10 dark:border-white/10 p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-brown">Security</h2>
                                <p className="text-brown/60 dark:text-gray-400">Update your password</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-brown mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.new}
                                    onChange={e => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-brown/20 bg-white/50 dark:bg-black/20 dark:border-white/10 focus:ring-2 focus:ring-terracotta focus:outline-none transition-all"
                                    placeholder="Min. 6 characters"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brown mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.confirm}
                                    onChange={e => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-brown/20 bg-white/50 dark:bg-black/20 dark:border-white/10 focus:ring-2 focus:ring-terracotta focus:outline-none transition-all"
                                    placeholder="Repeat new password"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading.password}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                            >
                                {loading.password ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Updating...
                                    </>
                                ) : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoField = ({ label, value, mono, capitalize }) => (
    <div className="pb-4 border-b border-brown/5 dark:border-white/5 last:border-0 last:pb-0">
        <p className="text-sm text-brown/50 dark:text-gray-400 mb-1">{label}</p>
        <p className={`font-medium text-brown dark:text-stone ${mono ? 'font-mono text-sm' : ''} ${capitalize ? 'capitalize' : ''}`}>
            {value || 'Not available'}
        </p>
    </div>
);

export default Profile;
