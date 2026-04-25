import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback
} from 'react';
import type { Message, User } from '../types';
import {
  fetchMessages,
  sendMessage,
  fetchContactsByRole,
  fetchAllUsers,
  findOrCreateConversationForTwo,
} from '../services/messagingApi';
import { useAuth } from '../../PatientMFE/hooks/useAuth';

interface MessagingContextType {
  messages: Message[];
  contacts: User[];
  allUsers: User[]; // All users for mentions
  activeConversationId: string | null;
  loadMessages: (conversationId: string) => Promise<void>;
  handleSend: (text: string) => Promise<void>;
  startConversation: (recipient: User) => void;
  isLoading: boolean;
}

const MessagingContext = createContext<MessagingContextType | null>(null);

interface MessagingProviderProps {
  children: React.ReactNode;
}

export const MessagingProvider: React.FC<MessagingProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeRecipient, setActiveRecipient] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      const all = await fetchAllUsers();
      setAllUsers(all.filter(u => u.id !== user.id)); // All users except self for mentions

      if (user.role === 'Owner') {
        setContacts(all.filter(u => u.id !== user.id));
      } else {
        const scoped = await fetchContactsByRole(user.role);
        setContacts(scoped);
      }
    };
    loadData();
  }, [user]);

  const loadMessages = useCallback(async (conversationId: string) => {
    setIsLoading(true);
    const data = await fetchMessages(conversationId);
    setMessages(data);
    setActiveConversationId(conversationId);
    setIsLoading(false);
  }, []);

  const handleSend = async (text: string) => {
    if (!activeConversationId || !user || !activeRecipient) return;

    // Regex to find mentions in the format @[DisplayName](userId)
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const mentionIds: string[] = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
        mentionIds.push(match[2]); // match[2] is the userId
    }

    const newMsg = await sendMessage({ 
      conversationId: activeConversationId, 
      senderId: user.id, 
      recipientId: activeRecipient.id, // Recipient is the person you started the chat with
      text 
    }, mentionIds);
    setMessages(prev => [...prev, newMsg]);
  };

  const startConversation = async (recipient: User) => {
    if (!user) return;
    const conversation = await findOrCreateConversationForTwo(user.id, recipient.id);
    setActiveRecipient(recipient);
    loadMessages(conversation.id);
  };

  return (
    <MessagingContext.Provider
      value={{ messages, contacts, allUsers, activeConversationId, loadMessages, handleSend, startConversation, isLoading }}
    >
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) throw new Error('useMessaging must be used within MessagingProvider');
  return context;
};