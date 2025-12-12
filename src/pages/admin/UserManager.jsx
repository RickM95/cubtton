
import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'client' });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null); // Add success state
    const [currentUserRole, setCurrentUserRole] = useState(null); // Role
    const [updating, setUpdating] = useState(false);

    // Add User State
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUserData, setNewUserData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        role: 'client'
    });

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await userService.getUsers();
            setUsers(data || []);
        } catch (error) {
            console.error("Error fetching users:", error);
            setError("Failed to load users.");
        } finally {
            setLoading(false);
        }
    };

    // Auth
    useEffect(() => {
        const fetchRole = async () => {
            const user = await import('../../services/authService').then(m => m.authService.getCurrentUser());
            setCurrentUserRole(user?.role);
        };
        fetchRole();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEditClick = (user) => {
        setError(null);
        setSuccess(null);
        setEditingUser(user);
        setFormData({
            name: user.full_name || '',
            email: user.email || '',
            role: user.role || 'client'
        });
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        if (!editingUser) return;
        setUpdating(true);
        setError(null);
        setSuccess(null);
        try {
            await userService.updateUserProfile(editingUser.id, {
                full_name: formData.name,
                email: formData.email, // Note
                role: formData.role
            });

            // Update
            setUsers(users.map(u => u.id === editingUser.id ? {
                ...u,
                full_name: formData.name,
                email: formData.email,
                role: formData.role
            } : u));
            setSuccess('User updated successfully');
            setTimeout(() => {
                setEditingUser(null);
                setSuccess(null);
            }, 1500);
        } catch (error) {
            console.error("Error updating user:", error);
            setError("Error updating user: " + error.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setUpdating(true);

        try {
            await import('../../services/authService').then(m => m.authService.signUp(newUserData));

            setNewUserData({ fullName: '', username: '', email: '', password: '', role: 'client' });
            fetchUsers();
            setSuccess('User created successfully! Session might need refresh.');
            setTimeout(() => {
                setIsAddUserModalOpen(false);
                setSuccess(null);
            }, 2000);
        } catch (err) {
            setError("Failed to create user: " + err.message);
        } finally {
            setUpdating(false);
        }
    };


    // Delete State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setDeleteModalOpen(true);
        setError(null);
        setSuccess(null);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;
        setUpdating(true);
        try {
            await userService.deleteUser(userToDelete.id);
            setUsers(users.filter(u => u.id !== userToDelete.id));
            setSuccess('User deleted successfully');
            setTimeout(() => setSuccess(null), 3000);
            setDeleteModalOpen(false);
            setUserToDelete(null);
        } catch (error) {
            console.error("Error deleting user:", error);
            setError("Failed to delete user: " + error.message);
            setDeleteModalOpen(false); // Close modal to show error on main
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brown">User Management</h2>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-brown/60">
                        Total Users: {users.length}
                    </div>
                    {currentUserRole === 'admin' && (
                        <button
                            onClick={() => { setIsAddUserModalOpen(true); setError(null); setSuccess(null); }}
                            className="bg-terracotta text-white px-4 py-2 rounded-lg hover:bg-terracotta/90 transition shadow-md"
                        >
                            + Add User
                        </button>
                    )}
                </div>
            </div>

            {/* Global Success/Error for Delete */}
            {(error || success) && !editingUser && !isAddUserModalOpen && !deleteModalOpen && (
                <div className={`px-4 py-3 rounded mb-6 border ${error ? 'bg-red-100 dark:bg-red-900/30 border-red-400 text-red-700 dark:text-red-300' : 'bg-green-100 dark:bg-green-900/30 border-green-400 text-green-700 dark:text-green-300'}`}>
                    {error || success}
                </div>
            )}

            {loading ? (
                <div className="text-center py-10 text-brown/60">Loading users...</div>
            ) : (
                <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-brown/10 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-brown/5 dark:bg-white/5 text-brown">
                                    <th className="p-4">User</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4 text-center">Joined</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="border-t border-brown/10 hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-terracotta/20 flex items-center justify-center text-terracotta font-bold text-sm overflow-hidden">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    (user.full_name || user.email || '?').charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-brown/90">{user.full_name || 'No Name'}</div>
                                                <div className="text-xs text-brown/50 md:hidden">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-brown/80 hidden md:table-cell">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                : user.role === 'supervisor' ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                                    : user.role === 'employee' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                        : 'bg-green-100 text-green-800 border border-green-200'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center text-brown/60 text-sm">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            {currentUserRole === 'admin' && (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(user)}
                                                        className="text-terracotta hover:text-brown transition-colors text-sm underline"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(user)}
                                                        className="text-red-500 hover:text-red-700 transition-colors text-sm underline ml-2"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#2a2a2a] p-6 rounded-2xl max-w-md w-full shadow-2xl border border-brown/10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-terracotta">Edit User Profile</h3>
                            <button onClick={() => setEditingUser(null)} className="text-terracotta hover:text-brown transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSaveUser} className="space-y-4">
                            {error && (
                                <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4">
                                    {success}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-terracotta/70 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-terracotta/20 rounded-lg bg-white/50 dark:bg-black/20 dark:border-white/10 text-terracotta dark:text-gray-200 focus:ring-2 focus:ring-terracotta focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-terracotta/70 mb-1">Email (Profile)</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-terracotta/20 rounded-lg bg-white/50 dark:bg-black/20 dark:border-white/10 text-terracotta dark:text-gray-200 focus:ring-2 focus:ring-terracotta focus:outline-none"
                                />
                                <p className="text-xs text-terracotta/50 mt-1">Updates display email only. Login email remains unchanged.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-terracotta/70 mb-2">Role</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`cursor-pointer border rounded-lg p-3 flex items-center gap-2 transition-all ${formData.role === 'client'
                                        ? 'border-terracotta bg-terracotta/5'
                                        : 'border-terracotta/10 hover:bg-terracotta/5'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="client"
                                            checked={formData.role === 'client'}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="text-terracotta focus:ring-terracotta"
                                        />
                                        <span className="text-terracotta font-medium">Client</span>
                                    </label>
                                    <label className={`cursor-pointer border rounded-lg p-3 flex items-center gap-2 transition-all ${formData.role === 'admin'
                                        ? 'border-terracotta bg-terracotta/5'
                                        : 'border-terracotta/10 hover:bg-terracotta/5'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="admin"
                                            checked={formData.role === 'admin'}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="text-terracotta focus:ring-terracotta"
                                        />
                                        <span className="text-terracotta font-medium">Admin</span>
                                    </label>
                                    <label className={`cursor-pointer border rounded-lg p-3 flex items-center gap-2 transition-all ${formData.role === 'supervisor'
                                        ? 'border-terracotta bg-terracotta/5'
                                        : 'border-terracotta/10 hover:bg-terracotta/5'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="supervisor"
                                            checked={formData.role === 'supervisor'}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="text-terracotta focus:ring-terracotta"
                                        />
                                        <span className="text-terracotta font-medium">Supervisor</span>
                                    </label>
                                    <label className={`cursor-pointer border rounded-lg p-3 flex items-center gap-2 transition-all ${formData.role === 'employee'
                                        ? 'border-terracotta bg-terracotta/5'
                                        : 'border-terracotta/10 hover:bg-terracotta/5'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="employee"
                                            checked={formData.role === 'employee'}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="text-terracotta focus:ring-terracotta"
                                        />
                                        <span className="text-terracotta font-medium">Employee</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-terracotta/10">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 text-terracotta hover:bg-terracotta/5 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors disabled:opacity-50"
                                >
                                    {updating ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Add User Modal */}
            {isAddUserModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#2a2a2a] p-8 rounded-2xl max-w-lg w-full shadow-2xl border border-brown/10 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-terracotta">Add New User</h3>
                            <button onClick={() => setIsAddUserModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700 dark:text-yellow-200">
                                        Creating a user directly will log you out of your Admin session.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleAddUser} className="space-y-4">
                            {error && (
                                <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4">
                                    {success}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-terracotta dark:text-gray-200 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-terracotta/20 rounded-lg bg-white/50 dark:bg-black/20 dark:border-white/10 text-terracotta dark:text-gray-100 focus:ring-2 focus:ring-terracotta focus:outline-none"
                                    value={newUserData.fullName}
                                    onChange={e => setNewUserData({ ...newUserData, fullName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-terracotta dark:text-gray-200 mb-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-terracotta/20 rounded-lg bg-white/50 dark:bg-black/20 dark:border-white/10 text-terracotta dark:text-gray-100 focus:ring-2 focus:ring-terracotta focus:outline-none"
                                    value={newUserData.username}
                                    onChange={e => setNewUserData({ ...newUserData, username: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-terracotta dark:text-gray-200 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-2 border border-terracotta/20 rounded-lg bg-white/50 dark:bg-black/20 dark:border-white/10 text-terracotta dark:text-gray-100 focus:ring-2 focus:ring-terracotta focus:outline-none"
                                    value={newUserData.email}
                                    onChange={e => setNewUserData({ ...newUserData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-terracotta dark:text-gray-200 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-2 border border-terracotta/20 rounded-lg bg-white/50 dark:bg-black/20 dark:border-white/10 text-terracotta dark:text-gray-100 focus:ring-2 focus:ring-terracotta focus:outline-none"
                                    value={newUserData.password}
                                    onChange={e => setNewUserData({ ...newUserData, password: e.target.value })}
                                />
                            </div>
                            {/* Only Admin can set roles for new users */}
                            {currentUserRole === 'admin' && (
                                <div>
                                    <label className="block text-sm font-medium text-terracotta dark:text-gray-200 mb-2">Role</label>
                                    <select
                                        value={newUserData.role}
                                        onChange={e => setNewUserData({ ...newUserData, role: e.target.value })}
                                        className="w-full px-4 py-2 border border-terracotta/20 rounded-lg bg-white/50 dark:bg-black/20 dark:border-white/10 text-terracotta dark:text-gray-100 focus:ring-2 focus:ring-terracotta focus:outline-none"
                                    >
                                        <option value="client">Client</option>
                                        <option value="employee">Employee</option>
                                        <option value="supervisor">Supervisor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-terracotta/10">
                                <button
                                    type="button"
                                    onClick={() => setIsAddUserModalOpen(false)}
                                    className="px-5 py-2 text-terracotta dark:text-gray-300 hover:bg-terracotta/5 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="px-6 py-2 bg-terracotta text-white font-medium rounded-lg hover:bg-terracotta/90 transition-colors shadow-lg shadow-terracotta/20 disabled:opacity-70"
                                >
                                    {updating ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && userToDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-red-500/20 transform transition-all scale-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Delete User?</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8">
                                Are you sure you want to delete <strong>{userToDelete.full_name || userToDelete.email}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={() => setDeleteModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition focus:outline-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteUser}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-600/30 focus:outline-none"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManager;
