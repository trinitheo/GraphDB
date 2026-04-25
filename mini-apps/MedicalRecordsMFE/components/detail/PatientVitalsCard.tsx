import React, { useState, useEffect, useRef } from 'react';
import type { Vitals } from '../../types';
import { VITAL_UNITS } from '../../types';
import { isVitalAbnormal } from '../../utils/vitalsHelper';
import { ChevronDown, ChevronUp, GripVertical } from '../../../../components/icons';

interface PatientVitalsCardProps {
    vitals?: Vitals;
    onUpdateClick?: () => void;
}

type VitalItem = {
    key: keyof Vitals;
    label: string;
};

const DEFAULT_VITALS_ORDER: (keyof Vitals)[] = ['heartRate', 'bloodPressure', 'respRate', 'spO2', 'temperature', 'weight', 'height', 'bmi', 'glucose', 'hba1c', 'gcs', 'avpu'];

const VitalDisplay: React.FC<{ label: string; value: string; unit?: string; isAbnormal: boolean; isManageMode: boolean }> = ({ label, value, unit, isAbnormal, isManageMode }) => (
    <div className={`p-3 rounded-lg relative ${isAbnormal ? 'bg-red-50' : 'bg-slate-50'} ${isManageMode ? 'cursor-grab' : ''}`}>
        {isManageMode && <GripVertical size={16} className="absolute top-1 left-1 text-slate-400" />}
        <p className={`text-xs text-slate-500 ${isManageMode ? 'pl-4' : ''}`}>{label}</p>
        <p className={`text-lg font-bold truncate ${isAbnormal ? 'text-red-700' : 'text-slate-800'} ${isManageMode ? 'pl-4' : ''}`}>
            {value ? `${value}${unit ? ` ${unit}` : ''}` : '—'}
        </p>
    </div>
);

const PatientVitalsCard: React.FC<PatientVitalsCardProps> = ({ vitals, onUpdateClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isManageMode, setIsManageMode] = useState(false);
    const [orderedVitals, setOrderedVitals] = useState<VitalItem[]>([]);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    useEffect(() => {
        const storedOrder = localStorage.getItem('vitalsOrder');
        const order: (keyof Vitals)[] = storedOrder ? JSON.parse(storedOrder) : DEFAULT_VITALS_ORDER;
        
        const fullVitalsList = DEFAULT_VITALS_ORDER.map(key => ({
            key,
            label: (key as string).replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        }));
        
        // Ensure all default vitals are present, even if not in stored order
        const newOrderedVitals = order
            .map(key => fullVitalsList.find(v => v.key === key))
            .filter((v): v is VitalItem => !!v);

        const presentKeys = new Set(newOrderedVitals.map(v => v.key));
        fullVitalsList.forEach(v => {
            if (!presentKeys.has(v.key)) {
                newOrderedVitals.push(v);
            }
        });
            
        setOrderedVitals(newOrderedVitals);

    }, []);

    const handleSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const newOrderedVitals = [...orderedVitals];
        const draggedItemContent = newOrderedVitals.splice(dragItem.current, 1)[0];
        newOrderedVitals.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setOrderedVitals(newOrderedVitals);
        localStorage.setItem('vitalsOrder', JSON.stringify(newOrderedVitals.map(v => v.key)));
    };
    
    if (!vitals) {
        return <div className="card-panel p-6 text-center text-slate-500">No vitals recorded for this visit.</div>;
    }
    
    const vitalsToDisplay = isExpanded ? orderedVitals : orderedVitals.slice(0, 6);

    return (
        <div className="card-panel p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                    Latest Vitals
                </h3>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsManageMode(!isManageMode)} className={`px-3 py-1.5 text-xs font-semibold rounded-md ${isManageMode ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                        {isManageMode ? 'Done' : 'Manage'}
                    </button>
                    {onUpdateClick && (
                        <button onClick={onUpdateClick} className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-100 hover:bg-sky-200 rounded-md">
                            Update Vitals
                        </button>
                    )}
                </div>
            </div>
             <p className="text-xs text-slate-500 mb-4">
                Recorded on {vitals.timestamp ? new Date(vitals.timestamp).toLocaleString() : 'N/A'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {vitalsToDisplay.map((v, index) => (
                    <div
                        // FIX: Cast item.key to string for the key prop
                        key={v.key as string}
                        draggable={isManageMode}
                        onDragStart={() => (dragItem.current = index)}
                        onDragEnter={() => (dragOverItem.current = index)}
                        onDragEnd={handleSort}
                        onDragOver={(e) => e.preventDefault()}
                        className={isManageMode && dragItem.current === index ? 'dragging' : ''}
                    >
                         <VitalDisplay
                            label={v.label}
                            value={String(vitals[v.key] || '')}
                            unit={VITAL_UNITS[v.key]}
                            isAbnormal={isVitalAbnormal(v.key, String(vitals[v.key] || ''))}
                            isManageMode={isManageMode}
                        />
                    </div>
                ))}
            </div>
             <div className="mt-4 border-t border-slate-200 text-center">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full pt-3 flex justify-center items-center text-sm font-semibold text-sky-600 hover:text-sky-800"
                >
                    {isExpanded ? 'Show Less' : 'Show More'}
                    {isExpanded ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
                </button>
            </div>
        </div>
    );
};

export default PatientVitalsCard;