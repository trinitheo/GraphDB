import React from 'react';
import { PlusIcon } from '../../../components/icons';

interface UserManagementHeaderProps {
    showAddButton: boolean;
}

const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({ showAddButton }) => (
    <header className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4 flex-shrink-0">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
            <p className="text-slate-600 mt-1">Manage user accounts, roles, and permissions.</p>
        </div>
        {showAddButton && (
            <button className="btn-neu flex items-center space-x-2 text-sky-600">
                <PlusIcon className="h-5 w-5" />
                <span>Add New User</span>
            </button>
        )}
    </header>
);

export default UserManagementHeader;