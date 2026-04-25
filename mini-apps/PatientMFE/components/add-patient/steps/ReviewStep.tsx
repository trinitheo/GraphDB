
import React from 'react';
import type { MedicalHistoryForm, Api } from '../../../types';
// FIX: Import useIntake hook to get form data from context.
import { useIntake } from '../../../context/IntakeContext';

interface ReviewStepProps {
    onEdit: (step: number) => void;
}

const DataSection: React.FC<{ title: string; step: number; onEdit: (step: number) => void; children: React.ReactNode; errors?: string[] }> = ({ title, step, onEdit, children, errors }) => (
    <div className="border-t border-slate-200 pt-4 mt-4 first:mt-0 first:border-t-0" data-error={errors && errors.length > 0 ? true : undefined}>
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                {errors && errors.length > 0 && (
                    <span className="px-2 py-0.5 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                        {errors.length} issue{errors.length > 1 ? 's' : ''}
                    </span>
                )}
            </div>
            <button onClick={() => onEdit(step)} className="text-sm font-semibold text-sky-600 hover:underline">Edit</button>
        </div>
        {errors && errors.length > 0 && (
            <div className="mt-2 text-sm text-red-600 space-y-1">
                {errors.map((error, index) => <p key={index}>- {error}</p>)}
            </div>
        )}
        <div className="mt-2 space-y-1 text-sm text-slate-600">{children}</div>
    </div>
);

const DataPair: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-4">
        <dt className="font-medium text-slate-500 col-span-1">{label}</dt>
        <dd className="text-slate-700 col-span-2">{value || <span className="italic">N/A</span>}</dd>
    </div>
);

// FIX: Component now gets data from context, so props are simplified.
const ReviewStep: React.FC<ReviewStepProps> = ({ onEdit }) => {
    const { state, validationErrors } = useIntake();
    const { formData } = state;
    const { demographics, complaint, history, examination, assessment, plan } = formData;
    const hasErrors = Object.keys(validationErrors).length > 0;
    const fullName = [demographics.firstName, demographics.middleName, demographics.lastName].filter(Boolean).join(' ');

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Review & Submit</h2>
            <p className="text-sm text-slate-600">Please review all the information below. Fix any errors before creating the new patient record.</p>

            {hasErrors && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-r-lg">
                    <h4 className="font-bold">Please resolve the following issues:</h4>
                    <ul className="list-disc list-inside mt-2 text-sm">
                        {Object.entries(validationErrors).map(([section, errors]) => (
                            <li key={section}>
                                <strong>{section}:</strong> {errors.join(', ')}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <DataSection title="Demographics" step={1} onEdit={onEdit} errors={validationErrors['Demographics']}>
                <DataPair label="Full Name" value={fullName} />
                <DataPair label="Date of Birth" value={demographics.dob} />
                <DataPair label="Gender" value={demographics.gender} />
                <DataPair label="Contact" value={`${demographics.phone || 'N/A'} / ${demographics.email || 'N/A'}`} />
                <DataPair label="Insurance" value={`${demographics.insuranceProvider || 'N/A'} - Policy #${demographics.policyNumber || 'N/A'}`} />
            </DataSection>

            <DataSection title="Chief Complaint" step={2} onEdit={onEdit} errors={validationErrors['Chief Complaint']}>
                {complaint.symptoms.length > 0 ? complaint.symptoms.map((s: Api.V1.Symptom) => (
                    // FIX: This now works because `s` is correctly typed and `s.location` is a string array.
                    <p key={s.id}>- {s.description} ({s.location?.join(', ')}, Severity: {s.severity}/10)</p>
                )) : <p className="italic">No symptoms entered.</p>}
                 <DataPair label="HPI" value={complaint.timeline} />
            </DataSection>

            <DataSection title="History" step={3} onEdit={onEdit}>
                <DataPair label="Allergies" value={history.allergies.length > 0 ? history.allergies.map(a => a.substance).join(', ') : 'None'} />
                <DataPair label="Medications" value={history.medications.length > 0 ? history.medications.map(m => m.name).join(', ') : 'None'} />
                {history.historySummary && (
                    <DataPair label="AI Summary" value={<p className="whitespace-pre-wrap">{history.historySummary}</p>} />
                )}
            </DataSection>
            
            <DataSection title="Examination" step={4} onEdit={onEdit}>
                <DataPair label="Vitals" value={`BP: ${examination.vitals.bloodPressure || 'N/A'}, HR: ${examination.vitals.heartRate || 'N/A'}, Temp: ${examination.vitals.temperature ? `${examination.vitals.temperature}°C` : 'N/A'}`} />
                {Object.entries(examination.systems).map(([system, findings]) => (
                    findings && <DataPair key={system} label={system.charAt(0).toUpperCase() + system.slice(1)} value={findings} />
                ))}
            </DataSection>

            <DataSection title="Assessment" step={5} onEdit={onEdit} errors={validationErrors['Assessment']}>
                <DataPair 
                    label="Working Dx" 
                    value={
                        assessment.workingDiagnosis.length > 0 
                        ? (
                            <ul className="list-disc list-inside">
                                {assessment.workingDiagnosis.map(wd => <li key={wd.code}>{wd.display}</li>)}
                            </ul>
                        )
                        : <span className="text-red-500 italic">None selected</span>
                    } 
                />
            </DataSection>

            <DataSection title="Plan" step={6} onEdit={onEdit}>
                 <DataPair label="Treatment Plan" value={plan.treatments} />
                 <DataPair label="Follow-up" value={plan.followUp} />
                 {plan.pendingReferrals.length > 0 && <DataPair label="Referrals" value={plan.pendingReferrals.map(r => r.specialty).join(', ')} />}
                 {plan.pendingOrders.length > 0 && <DataPair label="Orders" value={plan.pendingOrders.map(o => o.orderName).join(', ')} />}
            </DataSection>
        </div>
    );
};

export default ReviewStep;
