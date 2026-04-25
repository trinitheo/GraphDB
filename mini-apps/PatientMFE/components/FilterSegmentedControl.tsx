
import React from 'react';

interface FilterSegmentedControlProps {
    activeFilter: 'Active' | 'Archived' | 'All';
    onFilterChange: (filter: 'Active' | 'Archived' | 'All') => void;
}

const FilterSegmentedControl: React.FC<FilterSegmentedControlProps> = ({ activeFilter, onFilterChange }) => {
    const filters: ('Active' | 'Archived' | 'All')[] = ['Active', 'Archived', 'All'];

    return (
        <div className="flex items-center p-1 rounded-lg bg-slate-100 flex-shrink-0">
            {filters.map(filter => (
                <button
                    key={filter}
                    onClick={() => onFilterChange(filter)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 w-full sm:w-auto ${
                        activeFilter === filter
                            ? 'bg-white text-sky-600 shadow-sm'
                            : 'text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    {filter} Patients
                </button>
            ))}
        </div>
    );
};

export default FilterSegmentedControl;
