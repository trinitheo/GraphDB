import React, { useState, useEffect, useMemo } from 'react';
import type { User } from '../../types';

interface MentionSuggestionsListProps {
    query: string;
    users: User[];
    onSelect: (user: { id: string, name: string }) => void;
    onClose: () => void;
}

const MentionSuggestionsList: React.FC<MentionSuggestionsListProps> = ({ query, users, onSelect, onClose }) => {
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const filteredUsers = useMemo(() => {
        if (!query) return users.slice(0, 10);
        return users.filter(user =>
            user.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 10);
    }, [query, users]);

    useEffect(() => {
        setHighlightedIndex(0);
    }, [filteredUsers.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (filteredUsers.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightedIndex(prev => (prev + 1) % filteredUsers.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightedIndex(prev => (prev - 1 + filteredUsers.length) % filteredUsers.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                onSelect(filteredUsers[highlightedIndex]);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filteredUsers, highlightedIndex, onSelect, onClose]);

    if (filteredUsers.length === 0) {
        return null;
    }

    return (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white card-panel max-h-60 overflow-y-auto scrollbar-autohide z-10">
            <ul>
                {filteredUsers.map((user, index) => (
                    <li
                        key={user.id}
                        onMouseDown={(e) => e.preventDefault()} // Prevent input from losing focus
                        onClick={() => onSelect(user)}
                        className={`p-3 flex items-center gap-3 cursor-pointer ${
                            index === highlightedIndex ? 'bg-sky-50' : 'hover:bg-slate-50'
                        }`}
                    >
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                        <div>
                            <p className="font-semibold text-sm text-slate-800">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.role}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MentionSuggestionsList;