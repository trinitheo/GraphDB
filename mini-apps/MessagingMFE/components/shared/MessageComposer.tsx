
import React, { useState, useEffect, useRef } from 'react';
import { useMessaging } from '../../context/MessagingContext';
import { Send, PlusIcon, XIcon, FileText } from '../../../../components/icons';
import MentionSuggestionsList from './MentionSuggestionsList';

const MessageComposer: React.FC = () => {
    const [text, setText] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const { handleSend, allUsers } = useMessaging();
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const composerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const atIndex = text.lastIndexOf('@');
        const currentSelection = inputRef.current?.selectionStart || 0;
        const spaceAfterAtIndex = text.indexOf(' ', atIndex);

        if (atIndex > -1 && (spaceAfterAtIndex === -1 || spaceAfterAtIndex > currentSelection)) {
            const query = text.substring(atIndex + 1, currentSelection);
            setMentionQuery(query);
        } else {
            setMentionQuery(null);
        }
    }, [text]);

    const handleSelectMention = (user: {id: string, name: string}) => {
        const atIndex = text.lastIndexOf('@');
        const textBefore = text.substring(0, atIndex);
        const mentionText = `@[${user.name}](${user.id}) `;
        
        setText(textBefore + mentionText);
        setMentionQuery(null);
        inputRef.current?.focus();
    };

    const handleAttachmentClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAttachment(file);
        }
        // Clear input to allow re-selecting same file
        e.target.value = '';
    };

    const removeAttachment = () => {
        setAttachment(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim() || attachment) {
            let finalMessage = text.trim();
            if (attachment) {
                finalMessage += ` [Attachment: ${attachment.name}]`;
            }
            handleSend(finalMessage);
            setText('');
            setAttachment(null);
        }
    };

    return (
        <div ref={composerRef} className="relative">
            {mentionQuery !== null && (
                <MentionSuggestionsList
                    query={mentionQuery}
                    users={allUsers}
                    onSelect={handleSelectMention}
                    onClose={() => setMentionQuery(null)}
                />
            )}
            
            {/* Attachment Preview Bar */}
            {attachment && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-sky-50 border border-sky-100 rounded-lg animate-fade-in">
                    <div className="bg-sky-200 p-1.5 rounded-md">
                        <FileText className="w-4 h-4 text-sky-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-sky-900 truncate">{attachment.name}</p>
                        <p className="text-[10px] text-sky-700">{(attachment.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button 
                        onClick={removeAttachment}
                        className="p-1 hover:bg-sky-200 rounded-full transition-colors"
                        aria-label="Remove attachment"
                    >
                        <XIcon className="w-4 h-4 text-sky-600" />
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                
                <button
                    type="button"
                    onClick={handleAttachmentClick}
                    className={`btn-neu p-3 transition-colors ${attachment ? 'text-sky-600 bg-sky-50 border-sky-200' : 'text-slate-500 hover:text-sky-600'}`}
                    title="Attach medical document"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>

                <input
                    ref={inputRef}
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message... use '@' to mention"
                    className="input-neu w-full"
                    autoComplete="off"
                />
                
                <button
                    type="submit"
                    className="btn-neu p-3 bg-sky-600 text-white hover:bg-sky-700 disabled:bg-slate-100 disabled:text-slate-400 border-transparent shadow-sm"
                    disabled={!text.trim() && !attachment}
                    aria-label="Send message"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default MessageComposer;
