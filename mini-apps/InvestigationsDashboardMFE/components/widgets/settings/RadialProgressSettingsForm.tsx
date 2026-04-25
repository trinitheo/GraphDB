import React, { useState } from 'react';
import type { RadialWidgetConfig } from '../../../types';
import { usePatientInvestigations } from '../../../hooks/usePatientInvestigations';
import type { Patient } from '../../../../PatientMFE/types';

interface RadialProgressSettingsFormProps {
    config: RadialWidgetConfig;
    onSave: (newConfig: RadialWidgetConfig) => void;
    patient: Patient; // Patient data is needed to get available lab results
}

const RadialProgressSettingsForm: React.FC<RadialProgressSettingsFormProps> = ({ config, onSave, patient }) => {
    const [testName, setTestName] = useState(config.testName);
    const [min, setMin] = useState(config.customRange?.min || '');
    const [max, setMax] = useState(config.customRange?.max || '');
    
    const { availableLabResults } = usePatientInvestigations(patient);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ testName, customRange: { min, max } });
    };

    return (
        <form onSubmit={handleSave} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700">Lab Result to Display</label>
                <select value={testName} onChange={e => setTestName(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm">
                    {availableLabResults.map(r => <option key={r.testName} value={r.testName}>{r.testName}</option>)}
                </select>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Custom Min Range</label>
                    <input type="number" value={min} onChange={e => setMin(e.target.value)} placeholder="Auto" className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Custom Max Range</label>
                    <input type="number" value={max} onChange={e => setMax(e.target.value)} placeholder="Auto" className="mt-1 w-full p-2 border border-slate-300 rounded-md shadow-sm" />
                </div>
            </div>
            <p className="text-xs text-slate-500">Leave custom ranges blank to use the lab's default reference range.</p>
            <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors">Save Changes</button>
            </div>
        </form>
    );
};

export default RadialProgressSettingsForm;