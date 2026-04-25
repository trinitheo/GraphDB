import React from 'react';
import type { Message } from '../../types';
import { useAuth } from '../../../PatientMFE/hooks/useAuth';
import { useMessaging } from '../../context/MessagingContext';

interface MessageBubbleProps {
    message: Message;
}

// Function to parse message text and render mentions
const renderMessageText = (text: string) => {
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = text.split(mentionRegex);

    return parts.map((part, index) => {
        if (index % 3 === 1) { // This is the display name part
            return (
                <strong key={index} className="font-semibold bg-sky-100 text-sky-700 rounded px-1 py-0.5">
                    @{part}
                </strong>
            );
        }
        if (index % 3 === 2) { // This is the ID part, we don't render it
            return null;
        }
        return part; // This is a regular text part
    });
};


const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const { user } = useAuth();
    const { contacts } = useMessaging();
    const isSentByMe = message.senderId === user?.id;
    
    const sender = contacts.find(c => c.id === message.senderId) || user;

    const bubbleClasses = isSentByMe
        ? 'bg-sky-600 text-white rounded-br-none'
        : 'bg-slate-200 text-slate-800 rounded-bl-none';

    const alignmentClasses = isSentByMe ? 'items-end' : 'items-start';

    const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={`flex flex-col ${alignmentClasses}`}>
            <div className="flex items-end gap-2 max-w-sm">
                {!isSentByMe && (
                     <img src={sender?.avatar} alt={sender?.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                )}
                 <div className={`px-4 py-2 rounded-xl ${bubbleClasses}`}>
                    <p>{renderMessageText(message.text)}</p>
                </div>
            </div>
            <span className={`text-xs text-slate-400 mt-1 ${isSentByMe ? 'mr-2' : 'ml-10'}`}>
                {time}
            </span>
        </div>
    );
};

export default MessageBubble;