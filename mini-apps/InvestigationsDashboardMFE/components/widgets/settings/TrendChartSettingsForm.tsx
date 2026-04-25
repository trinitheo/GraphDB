import React, { useState } from 'react';
import type { TrendWidgetConfig, Vitals } from '../../../types';
import { TRENDABLE_VITALS } from '../../../hooks/usePatientInvestigations';

interface TrendChartSettingsFormProps {
    config: TrendWidgetConfig;
    onSave: (newConfig: TrendWidgetConfig) => void;
}

const TrendChartSettingsForm: React.FC<TrendChartSettingsFormProps> = ({ config, onSave }) => {
    const [yMin, setYMin] = useState(config.yMin || '');
    const [yMax, setYMax] = useState(config.yMax || '');
    const [vitalKey, setVitalKey] = useState(config.vitalKey);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ vitalKey, yMin, yMax });
    };

    return (
        <form onSubmit={handleSave} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700">Metric to Track</label>
                <select value={vitalKey} onChange={e => setVitalKey(e.target.value as keyof Vitals)} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm">
                    {TRENDABLE_VITALS.map(v => <option key={v.key as string} value={v.key}>{v.label}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Y-Axis Min</label>
                    <input type="number" value={yMin} onChange={e => setYMin(e.target.value)} placeholder="Auto" className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Y-Axis Max</label>
                    <input type="number" value={yMax} onChange={e => setYMax(e.target.value)} placeholder="Auto" className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm" />
                </div>
            </div>
            <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors">Save Changes</button>
            </div>
        </form>
    );
};

export default TrendChartSettingsForm;
