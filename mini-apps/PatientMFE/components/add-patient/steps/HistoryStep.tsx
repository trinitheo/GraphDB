import React from 'react';
// FIX: Import useIntake hook to manage state.
import { useIntake } from '../../../context/IntakeContext';
import CollapsibleSection from '../CollapsibleSection';
import MedicalHistorySection from '../history-sections/MedicalHistorySection';
import SurgicalHistorySection from '../history-sections/SurgicalHistorySection';
import AllergiesSection from '../history-sections/AllergiesSection';
import MedicationsSection from '../history-sections/MedicationsSection';
import FamilyHistorySection from '../history-sections/FamilyHistorySection';
import SocialHistorySection from '../history-sections/SocialHistorySection';
import WomensHealthSection from '../history-sections/WomensHealthSection';
import ReviewOfSystemsSection from '../history-sections/ReviewOfSystemsSection';
import HistorySummarizer from '../ai/HistorySummarizer';
import FormTextArea from '../../form/FormTextArea';

// FIX: Component no longer needs props, uses useIntake hook instead.
const HistoryStep: React.FC = () => {
    const { state, dispatch } = useIntake();
    const formData = state.formData;
    
    const handleHistoryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        dispatch({ type: 'UPDATE_FIELD', payload: { step: 'history', field: e.target.name, value: e.target.value } });
    };

    const handleSummaryGenerated = (summary: string) => {
        dispatch({ type: 'UPDATE_FIELD', payload: { step: 'history', field: 'historySummary', value: summary }});
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Patient History</h2>
            <p className="text-sm text-slate-600">Gather comprehensive history from the patient.</p>

            <CollapsibleSection title="Past Medical History" zIndex="z-[90]">
                <MedicalHistorySection formData={formData.history} dispatch={dispatch} />
            </CollapsibleSection>

            <CollapsibleSection title="Past Surgical History" zIndex="z-[80]">
                <SurgicalHistorySection formData={formData.history} dispatch={dispatch} />
            </CollapsibleSection>

            {formData.demographics.sex === 'Female' && (
                <CollapsibleSection title="Women's Health" zIndex="z-[70]">
                    <WomensHealthSection formData={formData.history} dispatch={dispatch} />
                </CollapsibleSection>
            )}

            <CollapsibleSection title="Allergies" zIndex="z-[60]">
                 <AllergiesSection formData={formData.history} dispatch={dispatch} />
            </CollapsibleSection>

            <CollapsibleSection title="Current Medications" zIndex="z-[50]">
                <MedicationsSection formData={formData.history} dispatch={dispatch} />
            </CollapsibleSection>

            <CollapsibleSection title="Family History" zIndex="z-[40]">
                <FamilyHistorySection formData={formData.history} dispatch={dispatch} />
            </CollapsibleSection>

            <CollapsibleSection title="Social History" zIndex="z-[30]">
                <SocialHistorySection formData={formData.history} dispatch={dispatch} />
            </CollapsibleSection>

            <CollapsibleSection title="Review of Systems" zIndex="z-[20]">
                <ReviewOfSystemsSection formData={formData.history} dispatch={dispatch} />
            </CollapsibleSection>
            
            <CollapsibleSection title="AI Assistant" zIndex="z-[10]">
                <HistorySummarizer
                    historyData={formData.history}
                    complaintData={formData.complaint}
                    onSummaryGenerated={handleSummaryGenerated}
                />
                <div className="mt-4">
                     <FormTextArea
                        label="Generated History Summary"
                        name="historySummary"
                        value={formData.history.historySummary}
                        onChange={handleHistoryChange}
                        rows={6}
                        placeholder="AI-generated summary will appear here..."
                    />
                </div>
            </CollapsibleSection>
        </div>
    );
};

export default HistoryStep;