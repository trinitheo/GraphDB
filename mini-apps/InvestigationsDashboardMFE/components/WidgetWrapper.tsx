import React from 'react';
import { TrashIcon, ExpandIcon, Settings } from '../../../components/icons';

interface WidgetWrapperProps {
    widgetId: string;
    title: string;
    onRemove: () => void;
    children: React.ReactNode;
    gridSpan?: number;
    isManageMode: boolean;
    onUpdateSize: () => void;
    onOpenSettings: () => void;
    onDragStart: (widgetId: string) => void;
    onDrop: (targetWidgetId: string) => void;
    onDragEnd: () => void;
    isBeingDragged: boolean;
}

const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ 
    widgetId, title, onRemove, children, gridSpan = 1, isManageMode, onUpdateSize, onOpenSettings,
    onDragStart, onDrop, onDragEnd, isBeingDragged
}) => {
    const gridSpanClasses: { [key: number]: string } = {
        1: 'col-span-1',
        2: 'col-span-1 md:col-span-2',
        3: 'col-span-1 md:col-span-2 lg:col-span-3',
        4: 'col-span-1 md:col-span-2 lg:col-span-4',
    };

    let wrapperClasses = `card-panel p-4 flex flex-col min-h-[16rem] ${gridSpanClasses[gridSpan] || 'col-span-1'} transition-all duration-300 relative`;
    
    if (isManageMode) {
        wrapperClasses += ' border-2 border-dashed border-sky-500 cursor-grab';
    }
    if (isBeingDragged) {
        wrapperClasses += ' opacity-40';
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    return (
        <div
            className={wrapperClasses}
            draggable={isManageMode}
            onDragStart={() => onDragStart(widgetId)}
            onDragOver={handleDragOver}
            onDrop={() => onDrop(widgetId)}
            onDragEnd={onDragEnd}
        >
            <div className="flex justify-between items-center mb-2 flex-shrink-0 h-5">
                <h3 className="font-bold text-slate-800 text-sm truncate pr-2">{title}</h3>
                {isManageMode && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={onOpenSettings}
                            className="p-1 text-slate-400 hover:text-sky-500 rounded-full hover:bg-slate-100 transition-colors"
                            title="Widget settings"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onRemove}
                            className="p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-100 transition-colors"
                            title="Remove widget"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
            <div className="flex-1 min-h-0">
                {children}
            </div>
            {isManageMode && (
                 <button
                    onClick={onUpdateSize}
                    className="absolute bottom-1 right-1 p-1.5 bg-slate-200/80 text-slate-600 rounded-full hover:bg-sky-200 hover:text-sky-700 transition-all cursor-pointer"
                    title="Toggle Size"
                >
                    <ExpandIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default WidgetWrapper;