import React, { useState } from 'react';
import { useMessaging } from '../../context/MessagingContext';
import { SearchIcon } from '../../../../components/icons';

const ContactList: React.FC = () => {
    const { contacts, startConversation, activeConversationId } = useMessaging();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Conversations</h2>
                <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="input-neu w-full pl-10"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-autohide">
                {filteredContacts.map(contact => {
                    // This logic assumes a 1-on-1 chat. activeConversationId could be userA-userB or userB-userA
                    const isActive = activeConversationId?.includes(contact.id);
                    return (
                        <button
                            key={contact.id}
                            onClick={() => startConversation(contact)}
                            className={`w-full text-left flex items-center gap-3 p-3 border-b border-slate-100 transition-colors ${
                                isActive ? 'bg-sky-50' : 'hover:bg-slate-50'
                            }`}
                        >
                            <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full" />
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold truncate ${isActive ? 'text-sky-800' : 'text-slate-800'}`}>
                                    {contact.name}
                                </p>
                                <p className="text-sm text-slate-500 truncate">{contact.role}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ContactList;