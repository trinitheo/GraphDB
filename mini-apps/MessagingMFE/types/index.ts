import type { Api } from '../../../api_contract/user';

export type User = Api.V1.User;

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    recipientId: string;
    text: string;
    timestamp: string; // ISO string
    status: 'sent' | 'delivered' | 'read';
}