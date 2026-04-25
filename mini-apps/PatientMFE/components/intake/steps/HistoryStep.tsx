import React, { useState, useEffect, useRef } from 'react';
import { useIntake } from '../../../context/IntakeContext';
import FormTextArea from '../../form/FormTextArea';
import FormSelect from '../../form/FormSelect';
import FormInput from '../../form/FormInput';
import CustomDatePicker from '../../form/CustomDatePicker';
import { useDebounce } from '../../../hooks/useDebounce';
import { rxNormService } from '../../../services/rxNormService';
import type { Api } from '../../../types';
import { TrashIcon } from '../../../../../components/icons';
import FormCheckbox from '../../form/FormCheckbox';

const initialNewMedState = { name: '', dose: '', frequency: '', startDate: '', prescriber: '' };

const rosCategories: { name: keyof Api.V1.ReviewOfSystems, label: string, symptoms: string[] }[] = [
    { name: 'general', label: 'General', symptoms: ['Fever', 'Chills', 'Fatigue', 'Unexplained Weight Loss/Gain'] },
    { name: 'skin', label: 'Skin', symptoms: ['Rash', 'Itching', 'Moles changing', 'New lumps'] },
    { name: 'heent', label: 'Head/Eyes/Ears/Nose/Throat (HEENT)', symptoms: ['Headaches', 'Vision changes', 'Earache', 'Hearing changes', 'Nasal congestion', 'Sore throat', 'Swallowing difficulty'] },
    { name: 'cardiovascular', label: 'Cardiovascular', symptoms: ['Chest pain', 'Shortness of breath with activity', 'Palpitations', 'Swelling in legs'] },
    { name: 'respiratory', label: 'Respiratory', symptoms: ['Cough', 'Wheezing', 'Shortness of breath', 'Sputum production'] },
    { name: 'gastrointestinal', label: 'Gastrointestinal', symptoms: ['Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Abdominal pain', 'Heartburn', 'Blood in stool'] },
    { name: 'genitourinary', label: 'Genitourinary', symptoms: ['Painful urination', 'Frequent urination', 'Blood in urine', 'Incontinence'] },
    { name: 'musculoskeletal', label: 'Musculoskeletal', symptoms: ['Joint pain', 'Muscle pain', 'Back pain', 'Stiffness', 'Swelling in joints'] },
    { name: 'neurological', label: 'Neurological', symptoms: ['Numbness', 'Tingling', 'Weakness', 'Dizziness', 'Fainting', 'Seizures', 'Tremors'] },
    { name: 'endocrine', label: 'Endocrine', symptoms: ['Increased thirst', 'Increased hunger', 'Heat/cold intolerance'] },
    { name: 'psychiatric', label: 'Psychiatric', symptoms: ['Depression', 'Anxiety', 'Sleep problems', 'Mood changes'] },
];

const HistoryStep: React.FC = () => {
    const { state, dispatch } = useIntake();
    const { history } = state.formData;

    // State for the new structured medication form
    const [newMed, setNewMed] = useState(initialNewMedState);
    const [suggestions, setSuggestions] = useState<Api.V1.DrugSuggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debouncedSearchTerm = useDebounce(newMed.name, 300);
    const searchRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        if (debouncedSearchTerm) {
            setIsSearching(true);
            setShowSuggestions(true);
            rxNormService.findDrugs(debouncedSearchTerm).then(results => {
                setSuggestions(results);
                setIsSearching(false);
            });
        } else {
            setSuggestions([]);
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleListChange = (field: string, value: string) => {
        dispatch({ type: 'UPDATE_FIELD', payload: { step: 'history', field, value: value.split('\n').filter(line => line.trim() !== '') } });
    };
    
    const handleFieldChange = (nestedKey: string, field: string, value: string) => {
         dispatch({ type: 'UPDATE_NESTED_FIELD', payload: { step: 'history', nestedKey, field, value } });
    };

    const handleNewMedChange = (field: keyof typeof newMed, value: string) => {
        setNewMed(prev => ({ ...prev, [field]: value }));
    };

    const handleSelectSuggestion = (suggestion: Api.V1.DrugSuggestion) => {
        setNewMed(prev => ({...prev, name: suggestion.name}));
        setShowSuggestions(false);
    };

    const handleAddMedication = () => {
        if (!newMed.name) return;
        const newMedications = [...history.medications, { ...newMed, id: `temp_${crypto.randomUUID()}` }];
        dispatch({ type: 'UPDATE_FIELD', payload: { step: 'history', field: 'medications', value: newMedications } });
        setNewMed(initialNewMedState);
    };

    const handleRemoveMedication = (id: string) => {
        const newMedications = history.medications.filter(med => med.id !== id);
        dispatch({ type: 'UPDATE_FIELD', payload: { step: 'history', field: 'medications', value: newMedications } });
    };

    const handleRosChange = (category: keyof Api.V1.ReviewOfSystems, symptom: string, checked: boolean) => {
        const currentSymptoms = history.reviewOfSystems[category];
        const newSymptoms = checked
            ? [...currentSymptoms, symptom]
            : currentSymptoms.filter(s => s !== symptom);

        dispatch({
            type: 'UPDATE_NESTED_FIELD',
            payload: {
                step: 'history',
                nestedKey: 'reviewOfSystems',
                field: category,
                value: newSymptoms
            }
        });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Patient History</h2>
            <p className="text-sm text-slate-600">Enter one item per line for list-based fields.</p>

            <div className="space-y-6">
                <FormTextArea
                    label="Medical History"
                    value={history.medicalHistory.map(h => h.condition).join('\n')}
                    onChange={(e) => handleListChange('medicalHistory', e.target.value)}
                    rows={3}
                    placeholder="e.g., Hypertension, Type 2 Diabetes"
                />
                 <FormTextArea
                    label="Surgical History"
                    value={history.surgicalHistory.map(h => h.procedure).join('\n')}
                    onChange={(e) => handleListChange('surgicalHistory', e.target.value)}
                    rows={3}
                    placeholder="e.g., Appendectomy (2010)"
                />
                 <FormTextArea
                    label="Family History"
                    value={history.familyHistory.map(h => h.condition).join('\n')}
                    onChange={(e) => handleListChange('familyHistory', e.target.value)}
                    rows={3}
                    placeholder="e.g., Father - Myocardial Infarction"
                />

                {/* New Medications Section */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Current Medications</h3>
                    <div className="card-panel p-4 space-y-4">
                        <div ref={searchRef} className="relative">
                            <FormInput
                                label="Medication Name"
                                value={newMed.name}
                                onChange={e => handleNewMedChange('name', e.target.value)}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder="Start typing a drug name..."
                                required
                                autoComplete="off"
                            />
                            {showSuggestions && (suggestions.length > 0 || isSearching) && (
                                <ul className="absolute z-40 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {isSearching ? <li className="p-3 text-sm text-slate-500">Searching...</li>
                                    : suggestions.map(s => (
                                        <li key={s.rxcui} onClick={() => handleSelectSuggestion(s)} className="p-3 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer">
                                            {s.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* FIX: dosage -> dose */}
                            <FormInput label="Dosage" value={newMed.dose} onChange={e => handleNewMedChange('dose', e.target.value)} placeholder="e.g., 10mg" />
                            <FormInput label="Frequency" value={newMed.frequency} onChange={e => handleNewMedChange('frequency', e.target.value)} placeholder="e.g., Once daily" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <CustomDatePicker label="Start Date" value={newMed.startDate} onChange={value => handleNewMedChange('startDate', value)} />
                             <FormInput label="Prescriber (optional)" value={newMed.prescriber} onChange={e => handleNewMedChange('prescriber', e.target.value)} placeholder="e.g., Dr. Smith" />
                        </div>
                        <button type="button" onClick={handleAddMedication} className="btn-neu text-sky-600 w-full">
                            + Add Medication
                        </button>
                    </div>

                    {history.medications.length > 0 && (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-semibold text-slate-600">Name</th>
                                        <th className="px-4 py-2 text-left font-semibold text-slate-600">Dosage</th>
                                        <th className="px-4 py-2 text-left font-semibold text-slate-600">Frequency</th>
                                        <th className="px-4 py-2 text-left font-semibold text-slate-600">Start Date</th>
                                        <th className="px-4 py-2 text-left font-semibold text-slate-600">Prescriber</th>
                                        <th className="px-4 py-2 text-right font-semibold text-slate-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {history.medications.map(med => (
                                        <tr key={med.id}>
                                            <td className="px-4 py-2 whitespace-nowrap">{med.name}</td>
                                            {/* FIX: dosage -> dose */}
                                            <td className="px-4 py-2">{med.dose}</td>
                                            <td className="px-4 py-2">{med.frequency}</td>
                                            <td className="px-4 py-2">{med.startDate}</td>
                                            <td className="px-4 py-2">{med.prescriber}</td>
                                            <td className="px-4 py-2 text-right">
                                                <button onClick={() => handleRemoveMedication(med.id)} className="text-red-500 hover:text-red-700 p-1" title="Remove medication">
                                                    <TrashIcon size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <FormTextArea
                    label="Allergies"
                    value={history.allergies.map(a => a.substance).join('\n')}
                    onChange={(e) => handleListChange('allergies', e.target.value)}
                    rows={3}
                    placeholder="e.g., Penicillin (hives)"
                />
                
                <div className="card-panel p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <FormSelect
                        label="Smoking Status"
                        value={history.socialHistory.smokingStatus}
                        onChange={(e) => handleFieldChange('socialHistory', 'smokingStatus', e.target.value)}
                    >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="Former">Former</option>
                    </FormSelect>
                     <FormSelect
                        label="Alcohol Use"
                        value={history.socialHistory.alcoholConsumption}
                        onChange={(e) => handleFieldChange('socialHistory', 'alcoholConsumption', e.target.value)}
                    >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        <option value="Occasional">Occasional</option>
                    </FormSelect>
                    <FormInput
                        label="Occupation"
                        value={history.socialHistory.occupation}
                        onChange={(e) => handleFieldChange('socialHistory', 'occupation', e.target.value)}
                    />
                     <FormInput
                        label="Living Situation"
                        value={history.socialHistory.livingSituation}
                        onChange={(e) => handleFieldChange('socialHistory', 'livingSituation', e.target.value)}
                        placeholder="e.g., Lives with spouse"
                    />
                     <FormInput
                        label="Diet"
                        value={history.socialHistory.diet}
                        onChange={(e) => handleFieldChange('socialHistory', 'diet', e.target.value)}
                        placeholder="e.g., Balanced, vegetarian"
                    />
                </div>

                 <div className="card-panel p-4">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Review of Systems (ROS)</h3>
                    <p className="text-sm text-slate-600 mb-4">Indicate any current or recent symptoms:</p>
                    {rosCategories.map(category => (
                        <div key={category.name} className="mt-4 border-t border-slate-200 pt-4 first:mt-0 first:border-t-0 first:pt-0">
                            <h4 className="font-semibold text-slate-800">{category.label}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mt-2">
                                {category.symptoms.map(symptom => (
                                    <FormCheckbox
                                        key={symptom}
                                        label={symptom}
                                        checked={history.reviewOfSystems[category.name as keyof typeof history.reviewOfSystems].includes(symptom)}
                                        onChange={(e) => handleRosChange(category.name as keyof typeof history.reviewOfSystems, symptom, e.target.checked)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HistoryStep;