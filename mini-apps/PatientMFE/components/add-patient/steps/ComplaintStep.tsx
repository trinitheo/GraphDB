import React, { useState } from 'react';
import type { Api } from '../../../types';
// FIX: Import useIntake hook to manage state.
import { useIntake } from '../../../context/IntakeContext';
import FormInput from '../../form/FormInput';
import FormTextArea from '../../form/FormTextArea';
import CollapsibleSection from '../CollapsibleSection';
import { geminiService } from '../../../../AIFeaturesMFE/services/geminiService';


type Symptom = Api.V1.Symptom;

// FIX: Component no longer needs props, uses useIntake hook instead.
const ComplaintStep: React.FC = () => {
    const { state, dispatch } = useIntake();
    const { complaint: complaintData, demographics: demographicsData, history: { womensHealth: womensHealthData } } = state.formData;

    const [newSymptom, setNewSymptom] = useState({ description: '', location: '', onset: '', severity: 5 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddSymptom = () => {
        if (newSymptom.description.trim()) {
            // Convert location string to string array to match API contract
            const symptomToAdd = { ...newSymptom, location: newSymptom.location ? [newSymptom.location] : [] };
            dispatch({ type: 'ADD_ITEM', payload: { step: 'complaint', field: 'symptoms', item: symptomToAdd }});
            setNewSymptom({ description: '', location: '', onset: '', severity: 5 });
        }
    };
    
    const handleRemoveSymptom = (id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { step: 'complaint', field: 'symptoms', itemId: id }});
    };
    
    const handleSymptomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewSymptom(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerateTimeline = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const timeline = await geminiService.generateComplaintTimeline(
                complaintData.symptoms,
                demographicsData,
                womensHealthData
            );
            dispatch({ type: 'UPDATE_FIELD', payload: { step: 'complaint', field: 'timeline', value: timeline }});
        } catch (err) {
            setError('Failed to generate timeline. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const canGenerate = complaintData.symptoms.some(s => s.description && s.onset);

    const timelineLabelAddon = (
        <button
            type="button"
            onClick={handleGenerateTimeline}
            disabled={isLoading || !canGenerate}
            className="btn-icon-neu disabled:opacity-50 disabled:cursor-not-allowed"
            title="Generate Timeline with AI"
        >
            {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-400"></div>
            ) : (
                <img src="https://cdn3.iconfinder.com/data/icons/artificial-inteligence-1/100/Sparkles-1024.png" alt="Generate AI timeline" className="h-5 w-5" />
            )}
        </button>
    );

    return (
        <div>
            <CollapsibleSection title="Reason for Visit / Chief Complaint">
                <div className="card-panel p-4 space-y-3">
                    <h3 className="font-semibold text-slate-800">Add Symptom</h3>
                    <FormInput label="Symptom / Reason" name="description" value={newSymptom.description} onChange={handleSymptomChange} placeholder="e.g., Sharp, stabbing chest pain radiating to the left arm..." />
                    <FormInput label="When did it start?" name="onset" value={newSymptom.onset} onChange={handleSymptomChange} placeholder="e.g., About 2 weeks ago" />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Severity: {newSymptom.severity}</label>
                        <div className="flex items-center gap-4">
                             <input type="range" min="0" max="10" name="severity" value={newSymptom.severity} onChange={handleSymptomChange} className="w-full" />
                             <span className="font-bold text-slate-700">{newSymptom.severity}</span>
                        </div>
                    </div>
                    <FormInput label="Location" name="location" value={newSymptom.location} onChange={handleSymptomChange} placeholder="e.g., Left side of chest" />
                    <button type="button" onClick={handleAddSymptom} className="btn-neu text-sky-600 w-full">+ Add Symptom</button>
                </div>

                {complaintData.symptoms.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <h3 className="font-semibold text-slate-800">Symptom List</h3>
                        {complaintData.symptoms.map((symptom: Symptom) => (
                            <div key={symptom.id} className="flex justify-between items-center p-3 neu-sunken-sm rounded-lg">
                                <div>
                                    <p className="font-medium text-slate-800">{symptom.description}</p>
                                    <p className="text-sm text-slate-500">
                                        {symptom.location.join(', ')} | {symptom.onset} | Severity: {symptom.severity}/10
                                    </p>
                                </div>
                                <button onClick={() => handleRemoveSymptom(symptom.id)} className="text-red-500 hover:text-red-700 p-1">&times;</button>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="mt-4">
                    <FormTextArea
                        label="Timeline / History of Present Illness"
                        value={complaintData.timeline}
                        onChange={e => dispatch({ type: 'UPDATE_FIELD', payload: { step: 'complaint', field: 'timeline', value: e.target.value }})}
                        rows={4}
                        placeholder="Narrative describing the progression of the complaint..."
                        labelAddon={timelineLabelAddon}
                    />
                     {!canGenerate && <p className="text-xs text-slate-500 mt-2 text-right">Add a symptom with onset to enable AI generation.</p>}
                     {error && <p className="text-sm text-red-600 mt-2 text-right">{error}</p>}
                </div>
            </CollapsibleSection>
        </div>
    );
};

export default ComplaintStep;