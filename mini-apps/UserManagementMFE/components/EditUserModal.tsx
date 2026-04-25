

import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import type { UserRole } from '../../../api_contract/shared';
import Modal from '../../MedicalRecordsMFE/components/modals/Modal';
import FormSelect from '../../PatientMFE/components/form/FormSelect';
import { useAuth } from '../../PatientMFE/hooks/useAuth';
// FIX: Add missing icon imports
import { AlertTriangle, LockClosedIcon } from '../../../components/icons';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User) => void;
    user: User;
}

// Define role hierarchy and permissions
const ROLE_HIERARCHY: Record<UserRole, number> = {
    'Owner': 100,
    'Practice Manager': 90,
    'Clinician': 80,
    'Nurse': 70,
    'AlliedHealthProfessional': 70,
    'Billing Specialist': 60,
    'Patient': 50
} as const;

const ALL_ROLES: UserRole[] = ['Patient', 'Nurse', 'AlliedHealthProfessional', 'Clinician', 'Practice Manager', 'Billing Specialist', 'Owner'];

// Role descriptions for better UX
const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
    'Owner': 'Full system control, cannot perform clinical actions',
    'Practice Manager': 'Business operations, staff management, no clinical access',
    'Clinician': 'Primary care provider with full clinical privileges',
    'Nurse': 'Clinical support, can draft notes but not finalize',
    'AlliedHealthProfessional': 'Specialty care within scope, assigned patients only',
    'Billing Specialist': 'Financial operations, billing data access only',
    'Patient': 'Can view own records and communicate with care team'
};

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onSave, user }) => {
    const { user: currentUser } = useAuth();
    const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
    const [validationError, setValidationError] = useState<string>('');
    const formId = 'edit-user-form';

    useEffect(() => {
        if (user && currentUser) {
            setSelectedRole(user.role);
            validateRoleChange(user.role);
        }
    }, [user, currentUser, isOpen]);

    // Check if current user can edit the target user
    const canEditUser = (targetUser: User): boolean => {
        if (!currentUser) return false;
        
        // Cannot edit yourself
        if (currentUser.id === targetUser.id) return false;
        
        // Owners can edit anyone
        if (currentUser.role === 'Owner') return true;
        
        // Practice Managers can edit anyone except Owners
        if (currentUser.role === 'Practice Manager' && targetUser.role !== 'Owner') return true;
        
        // Users can only edit users with lower role hierarchy
        const currentUserLevel = ROLE_HIERARCHY[currentUser.role] || 0;
        const targetUserLevel = ROLE_HIERARCHY[targetUser.role] || 0;
        
        return currentUserLevel > targetUserLevel;
    };

    // Check if current user can assign the target role
    const canAssignRole = (targetRole: UserRole): boolean => {
        if (!currentUser) return false;
        
        const currentUserLevel = ROLE_HIERARCHY[currentUser.role] || 0;
        const targetRoleLevel = ROLE_HIERARCHY[targetRole] || 0;
        
        return currentUserLevel >= targetRoleLevel;
    };

    const validateRoleChange = (newRole: UserRole) => {
        setValidationError('');

        if (!currentUser) {
            setValidationError('Authentication required');
            return false;
        }

        // Check if user can edit this target user
        if (!canEditUser(user)) {
            setValidationError('You do not have permission to edit this user');
            return false;
        }

        // Check if user can assign the new role
        if (!canAssignRole(newRole)) {
            setValidationError(`You cannot assign a role higher than your own.`);
            return false;
        }
        
        if (ROLE_HIERARCHY[newRole] >= ROLE_HIERARCHY[currentUser.role] && currentUser.role !== 'Owner') {
             setValidationError(`You cannot assign the ${newRole} role.`);
            return false;
        }

        // Prevent critical role changes
        if (user.role === 'Owner' && newRole !== 'Owner' && currentUser.role !== 'Owner') {
            setValidationError('Only an Owner can change another Owner\'s role.');
            return false;
        }
        
        return true;
    };

    const handleRoleChange = (newRole: UserRole) => {
        setSelectedRole(newRole);
        validateRoleChange(newRole);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateRoleChange(selectedRole)) {
            return;
        }

        if (selectedRole === user.role) {
            onClose(); // No changes needed
            return;
        }

        // Show confirmation for significant role changes
        if (isSignificantRoleChange(user.role, selectedRole)) {
            if (!window.confirm(getRoleChangeWarning(user.role, selectedRole))) {
                return;
            }
        }

        onSave({ ...user, role: selectedRole });
    };

    const isSignificantRoleChange = (oldRole: UserRole, newRole: UserRole): boolean => {
        const significantChanges = [
            ['Clinician', 'Patient'],
            ['Owner', 'Practice Manager'],
            ['Practice Manager', 'Clinician']
        ];
        
        return significantChanges.some(([from, to]) => 
            (oldRole === from && newRole === to) || (oldRole === to && newRole === from)
        );
    };

    const getRoleChangeWarning = (oldRole: UserRole, newRole: UserRole): string => {
        return `Warning: Changing role from ${oldRole} to ${newRole}. This will significantly alter system permissions. Are you sure?`;
    };

    const getAvailableRoles = (): UserRole[] => {
        if (!currentUser) return [];
        
        return ALL_ROLES.filter(role => canAssignRole(role));
    };

    const availableRoles = getAvailableRoles();
    const canEdit = canEditUser(user);

    const footer = (
        <div className="flex justify-between items-center gap-4">
            {!canEdit && (
                <div className="flex items-center text-sm text-amber-600">
                    <LockClosedIcon className="w-4 h-4 mr-1" />
                    You do not have permission to edit this user.
                </div>
            )}
            <div className="flex justify-end gap-4 ml-auto">
                <button type="button" onClick={onClose} className="btn-neu">Cancel</button>
                <button 
                    type="submit" 
                    form={formId} 
                    disabled={!canEdit || !!validationError}
                    className="btn-neu text-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );

    if (!currentUser) {
        return null;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit User: ${user.name}`} footer={footer} size="md">
            <form id={formId} onSubmit={handleSave} className="space-y-4">
                {/* User Information */}
                <div className="p-4 bg-slate-50 rounded-lg">
                    <p><span className="font-semibold">User:</span> {user.name}</p>
                    <p><span className="font-semibold">Email:</span> {user.email}</p>
                    <p><span className="font-semibold">Current Role:</span> {user.role}</p>
                </div>

                {/* Role Selection */}
                <div>
                    <FormSelect
                        label="Role"
                        value={selectedRole}
                        onChange={e => handleRoleChange(e.target.value as UserRole)}
                        disabled={!canEdit}
                    >
                        {availableRoles.map(role => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                    </FormSelect>
                    
                    {/* Role Description */}
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>{selectedRole}:</strong> {ROLE_DESCRIPTIONS[selectedRole]}
                        </p>
                    </div>
                </div>

                {/* Validation Error */}
                {validationError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                        {/* FIX: Use correct icon name 'AlertTriangle' */}
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-700">{validationError}</p>
                    </div>
                )}

                {/* Security Warning for Significant Changes */}
                {isSignificantRoleChange(user.role, selectedRole) && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                        {/* FIX: Use correct icon name 'AlertTriangle' */}
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <div className="text-sm text-amber-800">
                            <strong>Security Notice:</strong> This role change will significantly alter system permissions and data access.
                        </div>
                    </div>
                )}

                {/* Current User Context */}
                <div className="text-xs text-slate-500 border-t pt-3">
                    Logged in as: <strong>{currentUser.name}</strong> ({currentUser.role})
                </div>
            </form>
        </Modal>
    );
};

export default EditUserModal;