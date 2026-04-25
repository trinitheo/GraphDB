import React, { useEffect, useRef } from 'react';
import { useMessaging } from '../../context/MessagingContext';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';
import { MessagingIcon } from '../../../../components/icons';

const ChatWindow: React.FC = () => {
    const { messages, activeConversationId, isLoading } = useMessaging();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (!activeConversationId) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                <MessagingIcon className="w-16 h-16 text-slate-300" />
                <h3 className="mt-4 text-lg font-semibold">Select a conversation</h3>
                <p className="max-w-xs">Choose a contact from the list to start or continue a conversation.</p>
            </div>
        );
    }
    
    if (isLoading) {
        return (
             <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
                <p className="mt-4 text-slate-500">Loading messages...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-autohide">
                {messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex-shrink-0 p-4 border-t border-slate-200">
                <MessageComposer />
            </div>
        </div>
    );
};

export default ChatWindow;