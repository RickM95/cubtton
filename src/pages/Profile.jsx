
import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                    setFullName(currentUser.user_metadata?.full_name || '');
                    setAvatarUrl(currentUser.user_metadata?.avatar_url || '');
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            await authService.updateProfile({ fullName, avatarUrl });
            setMessage('Profile updated successfully!');
        } catch (error) {
            setMessage('Error updating profile: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center dark:text-stone">Loading profile...</div>;
    if (!user) return <div className="p-8 text-center dark:text-stone">Please log in to view your profile.</div>;

    return (
        <div className="min-h-screen bg-canvas dark:bg-charcoal py-12 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto glass shadow-xl rounded-xl p-8">
                <h2 className="text-3xl font-bold text-brown dark:text-stone mb-8 text-center">Your Profile</h2>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-terracotta mb-4 bg-gray-200">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-brown/40 text-4xl font-bold">
                                {fullName ? fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>

                {message && (
                    <div className={`p-4 rounded-lg mb-6 ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-brown dark:text-stone mb-2">Display Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-brown/20 bg-white/50 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-terracotta"
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brown dark:text-stone mb-2">Avatar URL (Image Link)</label>
                        <input
                            type="text"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-brown/20 bg-white/50 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-terracotta"
                            placeholder="e.g. https://example.com/my-photo.jpg"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-3 px-4 bg-terracotta hover:bg-terracotta/90 text-white font-medium rounded-lg shadow-md transition-transform transform active:scale-95 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
