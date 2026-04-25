import { authService } from '../../PatientMFE/services/authService';
import type { User, Message } from '../types';
import type { UserRole } from '../../../api_contract/shared';

// --- MOCK DATABASE ---

interface Conversation {
    id: string;
    participantIds: string[];
    name?: string | null; // For named group chats
}

let mockConversations: Conversation[] = [
    { id: 'conv-1', participantIds: ['U001', 'U002'], name: null },
    { id: 'conv-2', participantIds: ['U003', 'U006'], name: null },
];

let mockMessages: Message[] = [
    { id: 'msg1', conversationId: 'conv-1', senderId: 'U001', recipientId: 'U002', text: 'Hi Robert, can you check on the patient in room 3?', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), status: 'read' },
    { id: 'msg2', conversationId: 'conv-1', senderId: 'U002', recipientId: 'U001', text: 'Sure, on my way now. Vitals look stable.', timestamp: new Date(Date.now() - 4 * 60000).toISOString(), status: 'read' },
    { id: 'msg3', conversationId: 'conv-2', senderId: 'U003', recipientId: 'U006', text: 'Sandra, can you process the latest batch of invoices?', timestamp: new Date(Date.now() - 10 * 60000).toISOString(), status: 'delivered' },
];

// --- API FUNCTIONS ---

export const fetchMessages = async (conversationId: string): Promise<Message[]> => {
    await new Promise(res => setTimeout(res, 300));
    return mockMessages.filter(m => m.conversationId === conversationId).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const findOrCreateConversationForTwo = async (userId1: string, userId2: string): Promise<Conversation> => {
    const sortedIds = [userId1, userId2].sort();
    let conversation = mockConversations.find(c =>
        c.participantIds.length === 2 &&
        c.participantIds.every(id => sortedIds.includes(id))
    );

    if (!conversation) {
        conversation = {
            id: `conv-${crypto.randomUUID()}`,
            participantIds: sortedIds,
            name: null
        };
        mockConversations.push(conversation);
    }
    return conversation;
};

export const sendMessage = async (msg: Partial<Message>, mentionIds: string[] = []): Promise<Message> => {
    await new Promise(res => setTimeout(res, 200));
    
    // Find the conversation
    const conversation = mockConversations.find(c => c.id === msg.conversationId);
    if (conversation) {
        // Add any new mentioned users to the conversation
        mentionIds.forEach(id => {
            if (!conversation.participantIds.includes(id)) {
                conversation.participantIds.push(id);
            }
        });
    }

    const newMessage: Message = {
        id: `msg${Date.now()}`,
        conversationId: msg.conversationId!,
        senderId: msg.senderId!,
        recipientId: msg.recipientId!, // Kept for context, but group chat logic uses participantIds
        text: msg.text!,
        timestamp: new Date().toISOString(),
        status: 'sent',
    };
    mockMessages.push(newMessage);
    return newMessage;
};

export const fetchAllUsers = async (): Promise<User[]> => {
    return authService.getUsers();
};

export const fetchContactsByRole = async (userRole: UserRole): Promise<User[]> => {
    const allUsers = await authService.getUsers();
    
    // Simple contact rules for demonstration
    const rolePermissions: Record<UserRole, UserRole[]> = {
        'Clinician': ['Nurse', 'AlliedHealthProfessional', 'Practice Manager', 'Owner', 'Patient'],
        'Nurse': ['Clinician', 'Practice Manager', 'Patient'],
        'AlliedHealthProfessional': ['Clinician', 'Patient'],
        'Practice Manager': ['Clinician', 'Nurse', 'Billing Specialist', 'Owner', 'Patient'],
        'Billing Specialist': ['Practice Manager', 'Owner', 'Patient'],
        'Owner': [], // Owner sees all, handled separately
        'Patient': ['Clinician', 'Nurse'] // Patients can message their care team
    };

    const allowedRoles = rolePermissions[userRole] || [];
    return allUsers.filter(u => allowedRoles.includes(u.role));
};
