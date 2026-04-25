import React, { useState } from 'react';
import { useAuth } from '../../PatientMFE/hooks/useAuth';
import { authService } from '../../PatientMFE/services/authService';
import FormInput from '../../PatientMFE/components/form/FormInput';
import { Pencil } from '../../../components/icons';

const MyProfilePage: React.FC = () => {
    const { user: currentUser, loading } = useAuth();
    const [name, setName] = useState(currentUser?.name || '');
    const [avatar, setAvatar] = useState(currentUser?.avatar || '');
    const [isSaving, setIsSaving] = useState(false);

    if (loading) {
        return <div>Loading profile...</div>;
    }

    if (!currentUser) {
        return <div>Could not load user profile. Please try logging in again.</div>;
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // We need the full user object to update
            const users = await authService.getUsers();
            const fullUser = users.find(u => u.id === currentUser.id);
            if (fullUser) {
                const updatedUser = { ...fullUser, name, avatar };
                await authService.updateUser(updatedUser);
                alert("Profile updated successfully! The page will now reload.");
                window.location.reload();
            } else {
                throw new Error("Could not find user data to update.");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="animate-fade-in max-w-2xl mx-auto">
            <div className="card-panel p-8">
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                    <div className="relative">
                        <img src={avatar} alt="User avatar" className="w-32 h-32 rounded-full object-cover shadow-lg" />
                        <button className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md hover:bg-slate-100">
                           <Pencil size={16} className="text-slate-600" />
                        </button>
                    </div>
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-slate-900">{currentUser.name}</h1>
                        <p className="text-slate-500">{currentUser.role}</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="mt-8 pt-6 border-t border-slate-200 space-y-4">
                     <h2 className="text-xl font-semibold text-slate-800">Edit Profile</h2>
                     <FormInput
                        label="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <FormInput
                        label="Avatar URL"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        required
                    />
                     <div className="text-right">
                        <button type="submit" disabled={isSaving} className="btn-neu text-sky-600">
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MyProfilePage;