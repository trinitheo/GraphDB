import React, { useState, useMemo } from 'react';
import type { User } from '../types';
import { EditIcon, DeactivateIcon, SearchIcon } from '../../../components/icons';
import { useAuth } from '../../PatientMFE/hooks/useAuth';

interface UserListProps {
    users: User[];
    onEditUser: (user: User) => void;
    onDeactivateUser: (user: User) => void;
}

const UserCard: React.FC<{ user: User; canManage: boolean; onEdit: () => void; onDeactivate: () => void }> = ({ user, canManage, onEdit, onDeactivate }) => (
    <div className="card-panel p-4">
        <div className="flex items-center space-x-4">
            <img className="h-12 w-12 rounded-full object-cover" src={user.avatar} alt={user.name} />
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-slate-800">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                     <span className={`mt-1 px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-800'
                    }`}>
                        {user.status}
                    </span>
                </div>
                 <p className="mt-2 text-sm text-slate-600 font-medium">Role: {user.role}</p>
            </div>
        </div>
        {canManage && (
            <div className="mt-4 pt-4 border-t border-slate-200/80 flex items-center justify-end gap-2">
                <button onClick={onEdit} className="btn-neu flex items-center gap-2 text-sm">
                    <EditIcon className="w-5 h-5" /> <span>Edit</span>
                </button>
                <button onClick={onDeactivate} className="btn-neu flex items-center gap-2 text-sm text-red-600">
                    <DeactivateIcon className="w-5 h-5" /> <span>Deactivate</span>
                </button>
            </div>
        )}
    </div>
);


const UserList: React.FC<UserListProps> = ({ users, onEditUser, onDeactivateUser }) => {
    const { user: currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = useMemo(() => {
        if (!searchTerm) {
            return users;
        }
        return users.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);
    
    /**
     * Determines if the current user has permission to manage a target user.
     * - An 'Owner' can manage anyone except themselves.
     * - A 'Practice Manager' can manage anyone except an 'Owner' or themselves.
     * - Other roles cannot manage anyone.
     */
    const canManageUser = (targetUser: User): boolean => {
        if (!currentUser || currentUser.id === targetUser.id) {
            return false; // Users cannot manage themselves.
        }

        const currentUserRole = currentUser.role;
        const targetUserRole = targetUser.role;

        if (currentUserRole === 'Owner') {
            return true;
        }

        if (currentUserRole === 'Practice Manager') {
            return targetUserRole !== 'Owner';
        }

        return false;
    };
    
    return (
        <>
            <div className="mb-8 max-w-sm">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500">
                        <SearchIcon className="h-5 w-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="input-neu w-full pl-11 text-slate-900 placeholder-slate-500"
                        aria-label="Search users"
                    />
                </div>
            </div>

            {/* Mobile: Card View */}
            <div className="md:hidden space-y-4">
                {filteredUsers.map(user => {
                    const canManage = canManageUser(user);
                    return (
                        <UserCard 
                            key={user.id} 
                            user={user} 
                            canManage={canManage}
                            onEdit={() => onEditUser(user)}
                            onDeactivate={() => onDeactivateUser(user)}
                        />
                    );
                })}
            </div>

            {/* Desktop: Table View */}
            <div className="card-panel overflow-hidden hidden md:block">
                <table className="w-full">
                    <thead className="bg-slate-500/10">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-500/10">
                        {filteredUsers.map(user => {
                            const canManage = canManageUser(user);
                            return (
                                <tr key={user.id} className="hover:bg-slate-500/5 transition-colors duration-200">
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full object-cover" src={user.avatar} alt={user.name} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-slate-800">{user.name}</div>
                                                <div className="text-sm text-slate-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-800'
                                        }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {canManage ? (
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => onEditUser(user)} className="btn-icon-neu w-9 h-9 text-slate-600" title="Edit User">
                                                    <EditIcon className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => onDeactivateUser(user)} className="btn-icon-neu w-9 h-9 text-red-600" title="Deactivate User">
                                                    <DeactivateIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400">No actions</span>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}
export default UserList;