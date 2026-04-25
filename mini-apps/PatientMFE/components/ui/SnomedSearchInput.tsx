
import React, { useState, useEffect, useRef } from 'react';
import { snomedService } from '../../services/snomedService';
import type { SnomedConcept } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import { XIcon, SearchIcon } from '../../../../components/icons';

interface SnomedSearchInputProps {
    value: SnomedConcept[];
    onChange: (conditions: SnomedConcept[]) => void;
    placeholder?: string;
}

const SnomedSearchInput: React.FC<SnomedSearchInputProps> = ({ value, onChange, placeholder }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<SnomedConcept[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    
    const debouncedSearchTerm = useDebounce(searchTerm, 250);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsFocused(false);
                setResults([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    useEffect(() => {
        if (debouncedSearchTerm && debouncedSearchTerm.length >= 2) {
            setLoading(true);
            snomedService.search(debouncedSearchTerm).then(data => {
                setResults(data);
                setLoading(false);
                setHighlightedIndex(data.length > 0 ? 0 : -1); // Auto-highlight first result
            });
        } else {
            setResults([]);
            setHighlightedIndex(-1);
        }
    }, [debouncedSearchTerm]);

    const handleSelect = (concept: SnomedConcept) => {
        if (!value.find(item => item.code === concept.code)) {
            onChange([...value, concept]);
        }
        setSearchTerm('');
        setResults([]);
        setHighlightedIndex(-1);
        inputRef.current?.focus();
    };

    const handleRemove = (conceptToRemove: SnomedConcept) => {
        onChange(value.filter(item => item.code !== conceptToRemove.code));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (results.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (highlightedIndex >= 0 && results[highlightedIndex]) {
                    handleSelect(results[highlightedIndex]);
                }
            }
        }
        if (e.key === 'Escape') {
            setIsFocused(false);
            setResults([]);
        }
    };

    return (
        <div ref={searchRef} className="relative">
            <div 
                className={`flex flex-wrap items-center gap-2 p-2 bg-white border rounded-lg transition-all min-h-[42px] cursor-text
                    ${isFocused ? 'ring-2 ring-sky-500 border-sky-500' : 'border-slate-300'}`}
                onClick={() => inputRef.current?.focus()}
            >
                <SearchIcon className={`w-4 h-4 ml-1 flex-shrink-0 ${isFocused ? 'text-sky-500' : 'text-slate-400'}`} />
                {value.map(concept => (
                    <span key={concept.code} className="flex items-center gap-1.5 bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-1 rounded-md border border-sky-200">
                        {concept.display}
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleRemove(concept); }} className="text-sky-600 hover:text-sky-800">
                            <XIcon className="h-3 w-3" />
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? placeholder : ''}
                    className="flex-grow p-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm min-w-[120px]"
                />
            </div>
            
            {isFocused && (searchTerm.length >= 2 || results.length > 0) && (
                 <div className="absolute z-[100] w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-64 overflow-y-auto scrollbar-autohide animate-fade-in-fast">
                    {loading && (
                        <div className="p-4 flex items-center justify-center gap-2 text-slate-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500"></div>
                            <span className="text-sm">Searching SNOMED database...</span>
                        </div>
                    )}
                    {!loading && results.length > 0 && (
                        <ul className="py-1">
                            {results.map((result, index) => (
                                <li
                                    key={result.code}
                                    onClick={() => handleSelect(result)}
                                    className={`px-4 py-3 text-sm transition-colors cursor-pointer border-l-4
                                        ${index === highlightedIndex 
                                            ? 'bg-sky-50 border-sky-500 text-sky-900' 
                                            : 'bg-white border-transparent text-slate-700 hover:bg-slate-50'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{result.display}</span>
                                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${index === highlightedIndex ? 'bg-sky-200 text-sky-800' : 'bg-slate-100 text-slate-500'}`}>
                                            {result.code}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                     {!loading && results.length === 0 && searchTerm.length >= 2 && (
                        <div className="p-4 text-center">
                            <p className="text-sm text-slate-500">No clinical terms found for "<span className="font-semibold">{searchTerm}</span>"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SnomedSearchInput;
