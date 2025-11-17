
import React, { useState, useEffect } from 'react';
import { useUser } from '../../../firebase/useUser';
import { updateUserProfile } from '../../../firebase/firestore';
import { toast } from '../../../components/ui/Toaster';

const SettingsPage: React.FC = () => {
    const { userProfile, loading } = useUser();
    const [displayName, setDisplayName] = useState('');
    const [role, setRole] = useState<'Admin' | 'QA' | 'Read-only'>('QA');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setDisplayName(userProfile.name || '');
            setRole(userProfile.role || 'QA');
        }
    }, [userProfile]);

    const handleSaveChanges = async () => {
        if (!userProfile) return;
        setIsSaving(true);
        try {
            await updateUserProfile(userProfile.uid, { name: displayName, role });
            toast('Profile updated successfully!', 'success');
        } catch (error: any) {
            toast(error.message || 'Failed to update profile.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div>Loading settings...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>

            <div className="p-6 bg-white rounded-lg shadow dark:bg-dark-card">
                <h2 className="text-xl font-semibold">Profile Information</h2>
                <div className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="displayName" className="block text-sm font-medium">Display Name</label>
                        <input
                            type="text"
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full p-2 mt-1 border rounded-md dark:bg-dark-input dark:border-dark-border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Profile Photo</label>
                        <div className="flex items-center mt-1 space-x-4">
                            <span className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full dark:bg-gray-700">
                                {/* Placeholder for image */}
                                <i data-lucide="user" className="w-6 h-6 text-gray-500"></i>
                            </span>
                            <input type="file" className="text-sm" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow dark:bg-dark-card">
                <h2 className="text-xl font-semibold">Access Control</h2>
                 <div className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium">Role</label>
                         <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value as 'Admin' | 'QA' | 'Read-only')}
                            className="w-full p-2 mt-1 border rounded-md dark:bg-dark-input dark:border-dark-border"
                            // In a real app, this should be disabled based on user permissions
                            // disabled={userProfile?.role !== 'Admin'}
                         >
                            <option value="QA">QA</option>
                            <option value="Admin">Admin</option>
                            <option value="Read-only">Read-only</option>
                         </select>
                         <p className="mt-1 text-xs text-gray-500">Only Admins can change user roles.</p>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-end">
                <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
