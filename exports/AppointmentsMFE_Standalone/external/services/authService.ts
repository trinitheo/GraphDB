

import type { UserRole } from '../../types';
// FIX: The 'User' type is inside the Api.V1 namespace. Correcting the import.
import type { Api } from '../../../api_contract/user';

// ApiUser is the full user object. CurrentUser is the logged-in user representation.
export interface CurrentUser {
    id: string;
    name: string;
    role: UserRole;
    patientId?: string;
    avatar: string;
}


// Move mock data here to be the single source of truth
const mockUsers: Api.V1.User[] = [
  { id: 'U001', name: 'Dr. Evelyn Chen (Owner)', email: 'e.chen@careplus.ai', role: 'Owner', avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200&auto=format&fit=crop', status: 'Active' },
  { id: 'U007', name: 'Dr. Evelyn Chen', email: 'e.chen.clinician@careplus.ai', role: 'Clinician', avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200&auto=format&fit=crop', status: 'Active' },
  { id: 'U002', name: 'Robert Johnson', email: 'r.johnson@careplus.ai', role: 'Nurse', avatar: 'https://images.unsplash.com/photo-1537368910025-7003507965b6?q=80&w=200&auto=format&fit=crop', status: 'Active' },
  { id: 'U003', name: 'Alicia Rodriguez', email: 'a.rodriguez@careplus.ai', role: 'Practice Manager', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop', status: 'Active' },
  { id: 'U004', name: 'Michael Lee', email: 'm.lee@careplus.ai', role: 'AlliedHealthProfessional', avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=200&auto=format&fit=crop', status: 'Inactive' },
  { id: 'U005', name: 'Dr. David Smith', email: 'd.smith@careplus.ai', role: 'Clinician', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da60710?q=80&w=200&auto=format&fit=crop', status: 'Active' },
  { id: 'usr_ben_carter_123', name: 'Benjamin Carter', email: 'b.carter@personal.com', role: 'Patient', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop', status: 'Active' },
  { id: 'U006', name: 'Sandra Dee', email: 's.dee@careplus.ai', role: 'Billing Specialist', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop', status: 'Active' },
];

const SESSION_KEY = 'currentUser';

export const authService = {
  async login(email: string): Promise<CurrentUser> {
    await new Promise(res => setTimeout(res, 500)); // Simulate network delay
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.status === 'Active');
    
    if (!user) {
      throw new Error("Invalid credentials or user is inactive.");
    }
    
    const currentUser: CurrentUser = {
      id: user.id,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      patientId: user.role === 'Patient' ? `pat_${user.id.substring(4)}` : undefined
    };
    
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    return currentUser;
  },

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
  },
  
  getCurrentUser(): CurrentUser | null {
    const userJson = sessionStorage.getItem(SESSION_KEY);
    if (!userJson) {
      return null;
    }
    try {
      return JSON.parse(userJson);
    } catch (e) {
      return null;
    }
  },

  async getUsers(): Promise<Api.V1.User[]> {
      return Promise.resolve([...mockUsers]);
  },
  
  async updateUser(updatedUser: Api.V1.User): Promise<Api.V1.User> {
      const index = mockUsers.findIndex(u => u.id === updatedUser.id);
      if (index === -1) {
          throw new Error("User not found");
      }
      mockUsers[index] = updatedUser;
      
      // If the updated user is the current user, update session storage too
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === updatedUser.id) {
          const newCurrentUser: CurrentUser = {
              id: updatedUser.id,
              name: updatedUser.name,
              role: updatedUser.role,
              avatar: updatedUser.avatar,
              patientId: updatedUser.role === 'Patient' ? `pat_${updatedUser.id.substring(4)}` : undefined
          };
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(newCurrentUser));
      }
      
      return updatedUser;
  }
};