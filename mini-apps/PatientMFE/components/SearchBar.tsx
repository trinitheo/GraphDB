
import React from 'react';
import { SearchIcon } from '../../../components/icons';

interface SearchBarProps {
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchTermChange }) => {
    return (
        <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={e => onSearchTermChange(e.target.value)}
                className="input-neu w-full pl-10"
            />
        </div>
    );
}

export default SearchBar;
