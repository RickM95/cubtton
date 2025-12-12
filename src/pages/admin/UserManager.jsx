
import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Edit Form State
    const [editRole, setEditRole] = useState('client');
    const [editName, setEditName] = useState('');
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await userService.getAllUsers();
            setUsers(data || []);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Failed to load users: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setEditName(user.full_name || '');
        setEditRole(user.role || 'client');
        setSuccessMsg('');
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccessMsg('');

        try {
            // Update Role
            if (editRole !== selectedUser.role) {
                await userService.updateUserRole(selectedUser.id, editRole);
            }

            // Update other details if needed (optional)
            if (editName !== selectedUser.full_name) {
                await userService.updateUserProfile(selectedUser.id, { full_name: editName });
            }

            setSuccessMsg("User updated successfully!");
            fetchUsers(); // Refresh list

            // Close modal after delay
            setTimeout(() => {
                setIsEditModalOpen(false);
                setSuccessMsg('');
            }, 1000);
        } catch (err) {
            setError("Error updating user: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordReset = async (email) => {
        if (!confirm(`Send password reset email to ${email}?`)) return;

        try {
            await userService.sendPasswordReset(email);
            alert(`Password reset email sent to ${email}`);
        } catch (err) {
            alert("Error sending reset email: " + err.message);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brown dark:text-stone">User Management</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="pl-10 pr-4 py-2 rounded-lg border border-brown/20 bg-white/50 dark:bg-black/20 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-terracotta"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg className="w-5 h-5 absolute left-3 top-2.5 text-brown/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-10 text-brown/60">Loading users...</div>
            ) : (
                <div className="bg-white/50 dark:bg-stone/5 rounded-xl border border-brown/10 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-brown/5 dark:bg-white/5 text-brown dark:text-stone/80 border-b border-brown/10">
                                    <th className="p-4">User</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Joined</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-brown/50">
                                            No users found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map(user => (
                                        <tr key={user.id} className="border-t border-brown/10 hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                                        {user.avatar_url ? (
                                                            <img src={user.avatar_url} alt="Av" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-brown/50 font-bold text-sm">
                                                                {(user.email || 'U').charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-brown dark:text-stone">{user.full_name || 'No Name'}</div>
                                                        <div className="text-sm text-brown/60 dark:text-gray-400">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${user.role === 'admin'
                                                        ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300'
                                                        : 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-brown/60 dark:text-gray-400">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 flex justify-center space-x-2">
                                                <button
                                                    onClick={() => handleEditClick(user)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Edit User"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                </button>
                                                <button
                                                    onClick={() => handlePasswordReset(user.email)}
                                                    className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                                    title="Send Password Reset Email"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#2a2a2a] p-8 rounded-2xl max-w-md w-full shadow-2xl border border-brown/10 dark:border-white/10">
                        <h3 className="text-2xl font-bold text-brown dark:text-gray-100 mb-6">Edit User</h3>

                        {successMsg && (
                            <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4">
                                {successMsg}
                            </div>
                        )}

                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-brown dark:text-gray-200 mb-1">Email</label>
                                <input
                                    type="text"
                                    value={selectedUser.email}
                                    disabled
                                    className="w-full px-4 py-2 rounded-lg border border-brown/20 bg-gray-100 dark:bg-white/5 text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-brown dark:text-gray-200 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-brown/20 bg-white dark:bg-black/20 text-brown dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-terracotta"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-brown dark:text-gray-200 mb-1">Role</label>
                                <select
                                    value={editRole}
                                    onChange={(e) => setEditRole(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-brown/20 bg-white dark:bg-black/20 text-brown dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-terracotta"
                                >
                                    <option value="client">Client</option>
                                    <option value="admin">Admin</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="employee">Employee</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-brown dark:text-gray-300 hover:bg-brown/5 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 bg-terracotta text-white font-medium rounded-lg hover:bg-terracotta/90 shadow-md disabled:opacity-70"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManager;
