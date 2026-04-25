import React from 'react';
import { GridViewIcon, ListViewIcon } from '../../../components/icons';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex p-1 rounded-lg neu-sunken-sm">
      <button 
          onClick={() => onViewModeChange('grid')}
          className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'grid' ? 'neu-raised-sm text-sky-600' : 'text-slate-500'}`} 
          aria-label="Grid View"
          title="Grid View"
      >
          <GridViewIcon className="w-5 h-5" />
      </button>
       <button
          onClick={() => onViewModeChange('list')}
          className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'list' ? 'neu-raised-sm text-sky-600' : 'text-slate-500'}`}
          aria-label="List View"
          title="List View"
      >
          <ListViewIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ViewToggle;