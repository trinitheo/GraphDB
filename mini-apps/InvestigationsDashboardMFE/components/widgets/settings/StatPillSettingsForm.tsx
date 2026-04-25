import React, { useState } from 'react';
import type { StatWidgetConfig, Vitals } from '../../../types';
import { STAT_VITALS } from '../../../hooks/usePatientInvestigations';
import { VITAL_UNITS } from '../../../../PatientMFE/types';

interface StatPillSettingsFormProps {
    config: StatWidgetConfig;
    onSave: (newConfig: StatWidgetConfig) => void;
}

const StatPillSettingsForm: React.FC<StatPillSettingsFormProps> = ({ config, onSave }) => {
    const [vitalKey, setVitalKey] = useState(config.vitalKey);
    const [title, setTitle] = useState(config.title);
    
    const handleVitalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newKey = e.target.value;
        const newTitle = STAT_VITALS.find(v => v.key === newKey)?.label || newKey;
        setVitalKey(newKey as keyof Vitals);
        setTitle(newTitle);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ vitalKey, title });
    };

    return (
        <form onSubmit={handleSave} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700">Metric to Display</label>
                <select value={vitalKey} onChange={handleVitalChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm">
                    {STAT_VITALS.map(v => <option key={v.key as string} value={v.key}>{v.label}</option>)}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700">Custom Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Heart Rate" className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm" />
            </div>
            <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors">Save Changes</button>
            </div>
        </form>
    );
};

export default StatPillSettingsForm;
