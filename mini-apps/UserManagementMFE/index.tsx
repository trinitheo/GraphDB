import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import UserManagementHeader from './components/UserManagementHeader';
import UserList from './components/UserList';
import EditUserModal from './components/EditUserModal';
import ConfirmationModal from '../PatientMFE/components/modals/ConfirmationModal';
import MyProfilePage from './components/MyProfilePage';
import type { User } from './types';
import { useAuth } from '../PatientMFE/hooks/useAuth';
import { authService } from '../PatientMFE/services/authService';

const UserManagementList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);
    const { user: currentUser } = useAuth();
    
    useEffect(() => {
        authService.getUsers().then(setUsers);
    }, []);

    const refreshUsers = () => {
        authService.getUsers().then(setUsers);
    };

    const handleOpenEditModal = (user: User) => {
        setUserToEdit(user);
    };

    const handleSaveUser = async (updatedUser: User) => {
        await authService.updateUser(updatedUser);
        refreshUsers();
        setUserToEdit(null);
    };

    const handleConfirmDeactivate = async () => {
        if (!userToDeactivate) return;
        await authService.updateUser({ ...userToDeactivate, status: 'Inactive' });
        refreshUsers();
        setUserToDeactivate(null);
    };

    const canAddNewUser = currentUser?.role === 'Owner' || currentUser?.role === 'Practice Manager';

     return (
        <div className="animate-fade-in h-full flex flex-col">
            <UserManagementHeader showAddButton={canAddNewUser} />

            <div className="flex-1 overflow-y-auto">
                <UserList 
                    users={users} 
                    onEditUser={handleOpenEditModal}
                    onDeactivateUser={setUserToDeactivate}
                />
            </div>
            {userToEdit && (
                <EditUserModal
                    isOpen={!!userToEdit}
                    onClose={() => setUserToEdit(null)}
                    onSave={handleSaveUser}
                    user={userToEdit}
                />
            )}
            <ConfirmationModal
                isOpen={!!userToDeactivate}
                onClose={() => setUserToDeactivate(null)}
                onConfirm={handleConfirmDeactivate}
                title="Deactivate User"
            >
                Are you sure you want to deactivate <span className="font-bold">{userToDeactivate?.name}</span>? They will lose access to the system.
            </ConfirmationModal>
        </div>
    );
};

const UserManagementMFE: React.FC = () => {
    return (
        <Routes>
            <Route index element={<UserManagementList />} />
            <Route path="profile" element={<MyProfilePage />} />
        </Routes>
    );
};

export default UserManagementMFE;