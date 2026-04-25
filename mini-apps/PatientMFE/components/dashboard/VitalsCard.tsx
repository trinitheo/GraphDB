import React, { useState } from 'react';
import type { Vitals } from '../../types';
import { VITAL_UNITS } from '../../types';
import { calculateBmi } from '../../utils';
import FormSelect from '../form/FormSelect';
import GcsCalculatorModal from '../modals/GcsCalculatorModal';

interface VitalsCardProps {
    vitals: Vitals;
    isEditable?: boolean;
    onSave?: (updatedVitals: Partial<Vitals>) => void;
}

const VitalDisplay: React.FC<{ label: string; value: string; unit?: string; placeholder?: string }> = ({ label, value, unit, placeholder = "—" }) => (
    <div className="bg-white rounded-xl shadow-sm p-2 text-center transform transition-all duration-300 hover:shadow-lg hover:scale-105 h-full flex flex-col justify-center">
        <p className="block text-sm text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-800 mt-1">
            {value ? `${value}${unit ? ` ${unit}` : ''}` : placeholder}
        </p>
    </div>
);

const VitalInput: React.FC<{
    label: string;
    name: keyof Vitals;
    value: string;
    onChange: (name: keyof Vitals, value: string) => void;
    onBlur?: (name: keyof Vitals, value: string) => void;
    unit?: string;
    placeholder?: string;
    inputMode?: 'decimal' | 'text' | 'tel';
}> = ({ label, name, value, onChange, onBlur, unit, placeholder = "—", inputMode = "text" }) => (
    <div className="bg-white rounded-xl shadow-sm p-2 text-center transform transition-all duration-300 hover:shadow-lg hover:scale-105 h-full flex flex-col justify-center">
        <label htmlFor={name as string} className="block text-sm text-slate-500">{label}</label>
        <div className="flex items-baseline justify-center mt-1">
            <input
                id={name as string}
                name={name as string}
                value={value}
                onChange={(e) => onChange(name, e.target.value)}
                onBlur={(e) => onBlur?.(name, e.target.value)}
                placeholder={placeholder}
                inputMode={inputMode}
                className="text-xl font-bold text-slate-800 text-center bg-transparent border-none p-0 focus:ring-0 w-full placeholder-slate-400 placeholder:font-normal"
            />
            {unit && <span className="text-sm text-slate-500 ml-1">{unit}</span>}
        </div>
    </div>
);

const VitalsCard: React.FC<VitalsCardProps> = ({ vitals, isEditable = false, onSave }) => {
    const [isGcsModalOpen, setIsGcsModalOpen] = useState(false);
    
    const validationRules: { [key in keyof Vitals]?: { regex: RegExp, min?: number, max?: number } } = {
        heartRate: { regex: /[^0-9]/g, min: 0, max: 400 },
        temperature: { regex: /[^0-9.]/g, min: 30, max: 45 },
        respRate: { regex: /[^0-9]/g, min: 0, max: 100 },
        glucose: { regex: /[^0-9]/g, min: 0, max: 2000 },
        hba1c: { regex: /[^0-9.]/g, min: 0, max: 30 },
        spO2: { regex: /[^0-9]/g, min: 0, max: 100 },
        weight: { regex: /[^0-9.]/g, min: 0, max: 700 },
        height: { regex: /[^0-9.]/g, min: 0, max: 300 },
        bloodPressure: { regex: /[^0-9/]/g },
    };

    const handleChange = (name: keyof Vitals, value: string | Vitals['avpu']) => {
        if (!onSave) return;

        let sanitizedValue: string | Vitals['avpu'] = value;
        // FIX: Cast name to string to resolve index type error.
        const rules = validationRules[name as string];

        if (rules && typeof value === 'string') {
            sanitizedValue = value.replace(rules.regex, '');
            if (name === 'bloodPressure') {
                const parts = sanitizedValue.split('/');
                if (parts.length > 2) sanitizedValue = `${parts[0]}/${parts.slice(1).join('')}`;
            } else if (['temperature', 'hba1c', 'weight', 'height'].includes(name)) {
                const parts = sanitizedValue.split('.');
                if (parts.length > 2) sanitizedValue = `${parts[0]}.${parts.slice(1).join('')}`;
            }
            if (name === 'bloodPressure') {
                let [systolic, diastolic] = sanitizedValue.split('/');
                if (systolic && parseInt(systolic, 10) > 300) systolic = '300';
                if (diastolic && parseInt(diastolic, 10) > 200) diastolic = '200';
                sanitizedValue = diastolic !== undefined ? `${systolic}/${diastolic}` : systolic;
            } 
            else if (rules.max !== undefined) {
                if (parseFloat(sanitizedValue) > rules.max) {
                    sanitizedValue = String(rules.max);
                }
            }
        }
        
        const updatedVitals: Partial<Vitals> = { [name]: sanitizedValue };

        if (name === 'weight' || name === 'height') {
            const newWeight = name === 'weight' ? (sanitizedValue as string) : vitals.weight;
            const newHeight = name === 'height' ? (sanitizedValue as string) : vitals.height;
            updatedVitals.bmi = calculateBmi(newHeight, newWeight);
        }
        
        onSave(updatedVitals);
    };

    const handleGcsSave = (newGcsValue: string) => {
        if (onSave) {
            onSave({ gcs: newGcsValue });
        }
        setIsGcsModalOpen(false);
    };
    
    const handleBlur = (name: keyof Vitals, value: string) => {
        if (!onSave || !value) return;
        // FIX: Cast name to string to resolve index type error.
        const rules = validationRules[name as string];
        if (!rules || rules.min === undefined) return;
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue < rules.min) {
            handleChange(name, String(rules.min));
        }
    };

    const allVitalsConfig: { key: keyof Vitals; label: string; type?: 'select' | 'gcs' | 'display'; options?: any[]; inputMode?: 'decimal' | 'text' | 'tel' }[] = [
        { key: 'heartRate', label: 'Heart Rate', inputMode: 'decimal' },
        { key: 'bloodPressure', label: 'Blood Pressure', inputMode: 'text' },
        { key: 'temperature', label: 'Temperature', inputMode: 'decimal' },
        { key: 'respRate', label: 'Resp. Rate', inputMode: 'decimal' },
        { key: 'spO2', label: 'SpO2', inputMode: 'decimal' },
        { key: 'glucose', label: 'Glucose', inputMode: 'decimal' },
        { key: 'weight', label: 'Weight', inputMode: 'decimal' },
        { key: 'height', label: 'Height', inputMode: 'decimal' },
        { key: 'bmi', label: 'BMI', type: 'display' },
        { key: 'hba1c', label: 'HbA1c', inputMode: 'decimal' },
        { key: 'gcs', label: 'GCS', type: 'gcs' },
        { key: 'avpu', label: 'AVPU', type: 'select', options: ['Alert', 'Voice', 'Pain', 'Unresponsive', ''] },
    ];
    
    const renderVital = (item: typeof allVitalsConfig[0]) => {
        if (!isEditable) {
            // FIX: Cast item.key to string for the key prop
            return <VitalDisplay key={item.key as string} label={item.label} value={vitals[item.key] as string} unit={VITAL_UNITS[item.key]} />;
        }

        switch (item.type) {
            case 'gcs':
                return (
                    <div key={item.key as string} className="bg-white rounded-xl shadow-sm text-center transform transition-all duration-300 hover:shadow-lg hover:scale-105 h-full flex flex-col justify-center">
                        <button type="button" onClick={() => setIsGcsModalOpen(true)} className="w-full h-full p-2 flex flex-col justify-center items-center hover:bg-sky-50/50 rounded-xl">
                            <span className="block text-sm text-slate-500">GCS</span>
                            <span className="block mt-1 text-xl font-bold text-slate-800 placeholder-slate-400">
                                {vitals.gcs || '—'}
                            </span>
                        </button>
                    </div>
                );
            case 'select':
                 return (
                    <div key={item.key as string} className="bg-white rounded-xl shadow-sm p-2 text-center transform transition-all duration-300 hover:shadow-lg hover:scale-105 h-full flex flex-col justify-center">
                        <FormSelect
                            label={item.label}
                            id={item.key as string}
                            name={item.key as string}
                            value={vitals[item.key as 'avpu']}
                            onChange={(e) => handleChange(item.key as 'avpu', e.target.value as Vitals['avpu'])}
                            className="text-xl font-bold text-slate-800 text-center bg-transparent border-none p-0 focus:ring-0 mt-1 w-full appearance-none"
                        >
                            {item.options!.map(opt => <option key={opt} value={opt}>{opt || 'Select...'}</option>)}
                        </FormSelect>
                    </div>
                );
            case 'display':
                return <VitalDisplay key={item.key} label="BMI" value={vitals.bmi} />;
            default:
                // FIX: Cast item.key to string for the key prop
                return <VitalInput key={item.key as string} label={item.label} name={item.key} value={vitals[item.key] as string} onChange={handleChange} onBlur={handleBlur} unit={VITAL_UNITS[item.key]} inputMode={item.inputMode} />
        }
    };
    
    return (
        <>
            <div className="grid grid-cols-3 grid-rows-4 gap-2">
                {allVitalsConfig.map(item => renderVital(item))}
            </div>
            
            {isEditable && (
                <GcsCalculatorModal
                    isOpen={isGcsModalOpen}
                    onClose={() => setIsGcsModalOpen(false)}
                    onSave={handleGcsSave}
                    currentGcs={vitals.gcs}
                />
            )}
        </>
    );
};

export default VitalsCard;