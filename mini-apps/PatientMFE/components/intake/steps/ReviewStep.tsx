import React, { useRef } from 'react';
import { useIntake } from '../../../context/IntakeContext';
import { PrintIcon, Share2 as ShareIcon } from '../../../../../components/icons';
import type { MedicalHistoryForm, Api } from '../../../types';

interface ReviewStepProps {
    onEdit: (step: number) => void;
}

// FIX: Update function to use MedicalHistoryForm type
const formatIntakeForShare = (formData: MedicalHistoryForm): string => {
    const { demographics, complaint, history, examination, assessment, plan } = formData;
    const name = `${demographics.firstName} ${demographics.lastName}`;

    const medicationList = history.medications.map(m => `${m.name} ${m.dose} ${m.frequency}`).join(', ') || 'None';

    const rosSummary = Object.entries(history.reviewOfSystems)
        .filter(([, symptoms]) => (symptoms as string[]).length > 0)
        .map(([category, symptoms]) => `  - ${category.charAt(0).toUpperCase() + category.slice(1)}: ${(symptoms as string[]).join(', ')}`)
        .join('\n') || 'None reported.';

    const sections = [
        `PATIENT INTAKE SUMMARY: ${name}`,
        `====================`,
        ``,
        `DEMOGRAPHICS`,
        `Name: ${name}`,
        `DOB: ${demographics.dob || 'N/A'}`,
        `Gender: ${demographics.gender || 'N/A'}`,
        `Sex: ${demographics.sex || 'N/A'}`,
        `Blood Type: ${demographics.bloodType || 'N/A'}`,
        `Phone: ${demographics.phone || 'N/A'}`,
        `Email: ${demographics.email || 'N/A'}`,
        `Address: ${demographics.address || 'N/A'}`,
        ``,
        `CHIEF COMPLAINT`,
        `Symptoms: ${complaint.symptoms.map(s => s.description).join(', ') || 'N/A'}`,
        `Timeline: ${complaint.timeline || 'N/A'}`,
        ``,
        `HISTORY`,
        `Medical: ${history.medicalHistory.map(h => h.condition).join(', ') || 'None'}`,
        `Surgical: ${history.surgicalHistory.map(h => h.procedure).join(', ') || 'None'}`,
        `Family: ${history.familyHistory.map(h => `${h.relation}: ${h.condition}`).join(', ') || 'None'}`,
        `Medications: ${medicationList}`,
        `Allergies: ${history.allergies.map(a => a.substance).join(', ') || 'None'}`,
        `Social: Smoking: ${history.socialHistory.smokingStatus || 'N/A'}, Alcohol: ${history.socialHistory.alcoholConsumption || 'N/A'}, Occupation: ${history.socialHistory.occupation || 'N/A'}, Living Situation: ${history.socialHistory.livingSituation || 'N/A'}, Diet: ${history.socialHistory.diet || 'N/A'}`,
        `Review of Systems:\n${rosSummary}`,
        ``,
        `EXAMINATION`,
        `Vitals: BP ${examination.vitals.bloodPressure || 'N/A'}, HR ${examination.vitals.heartRate || 'N/A'}, RR ${examination.vitals.respRate || 'N/A'}, Temp ${examination.vitals.temperature || 'N/A'} °C, SpO2 ${examination.vitals.spO2 || 'N/A'} %`,
        `General: ${examination.systems.general || 'N/A'}`,
        `Neuro: ${examination.systems.neurological || 'N/A'}`,
        `Cardio: ${examination.systems.cardiovascular || 'N/A'}`,
        `Resp: ${examination.systems.respiratory || 'N/A'}`,
        `Abdo: ${examination.systems.abdominal || 'N/A'}`,
        ``,
        `ASSESSMENT`,
        // FIX: workingDiagnosis is an array of SnomedConcept, so we map to display names and join them.
        `Working Diagnosis: ${assessment.workingDiagnosis.map(d => d.display).join(', ') || 'N/A'}`,
        `Differential: ${assessment.differentialDiagnosis.map(d => d.display).join(', ') || 'None'}`,
        ``,
        `PLAN`,
        `Treatments: ${plan.treatments || 'None'}`,
        `Pending Orders: ${plan.pendingOrders.map(o => o.orderName).join(', ') || 'None'}`,
        `Pending Referrals: ${plan.pendingReferrals.map(r => r.specialty).join(', ') || 'None'}`,
        `Follow-up: ${plan.followUp || 'N/A'}`
    ];

    return sections.join('\n');
};


const DataSection: React.FC<{ title: string; step: number; onEdit: (step: number) => void; children: React.ReactNode; errors?: string[] }> = ({ title, step, onEdit, children, errors }) => (
    <div className="border-t border-slate-200 pt-4 mt-4 first:mt-0 first:border-t-0 print-avoid-break">
        <div className="flex justify-between items-center">
             <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <button onClick={() => onEdit(step)} className="text-sm font-semibold text-sky-600 hover:underline">Edit</button>
        </div>
        <div className="mt-2 space-y-1 text-sm text-slate-600">{children}</div>
    </div>
);

const DataPair: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-4">
        <dt className="font-medium text-slate-500 col-span-1">{label}</dt>
        <dd className="text-slate-700 col-span-2">{value || <span className="italic">N/A</span>}</dd>
    </div>
);

const ReviewStep: React.FC<ReviewStepProps> = ({ onEdit }) => {
    const { state, validationErrors } = useIntake();
    const { formData } = state;
    // FIX: Destructure assessment from formData to fix "Cannot find name 'assessment'" errors.
    const { assessment } = formData;
    const hasErrors = Object.keys(validationErrors).length > 0;
    const reviewRef = useRef<HTMLDivElement>(null);
    const showShare = 'share' in navigator;

    const handlePrint = () => {
        if (!reviewRef.current) return;
        const elementToPrint = reviewRef.current;
        elementToPrint.classList.add('printable-section');
        const onAfterPrint = () => {
            elementToPrint.classList.remove('printable-section');
            window.removeEventListener('afterprint', onAfterPrint);
        };
        window.addEventListener('afterprint', onAfterPrint);
        window.print();
    };

    const handleShare = async () => {
        // FIX: Pass the correct formData type
        const shareText = formatIntakeForShare(formData);
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Patient Intake: ${formData.demographics.firstName} ${formData.demographics.lastName}`,
                    text: shareText,
                });
            } catch (error) {
                console.error('Error sharing intake summary:', error);
            }
        }
    };

    const renderMedications = (meds: (Omit<Api.V1.Medication, 'id'> & { id: string })[]) => {
        if (meds.length === 0) return <span className="italic">N/A</span>;
        return (
            <ul className="list-disc list-inside">
                {meds.map(med => (
                    <li key={med.id}>
                        {/* FIX: Use 'dose' instead of 'dosage' */}
                        {med.name} ({med.dose}, {med.frequency}) - Started: {med.startDate}
                    </li>
                ))}
            </ul>
        );
    };

    const renderRos = (rosData: Api.V1.ReviewOfSystems) => {
        const allSymptoms = Object.entries(rosData)
            .filter(([, symptoms]) => symptoms.length > 0)
            .map(([category, symptoms]) => {
                const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
                return `${formattedCategory}: ${symptoms.join(', ')}`;
            });

        if (allSymptoms.length === 0) {
            return <span className="italic">No systems reviewed positive.</span>;
        }

        return (
            <ul className="list-disc list-inside">
                {allSymptoms.map(line => <li key={line}>{line}</li>)}
            </ul>
        );
    };

    return (
         <div className="space-y-4" ref={reviewRef}>
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Review & Submit</h2>
                    <p className="text-sm text-slate-600">Please review all information before creating the new patient record.</p>
                </div>
                 <div className="flex items-center gap-2 flex-shrink-0">
                    {showShare && (
                        <button onClick={handleShare} className="btn-icon-neu" title="Share Summary">
                            <ShareIcon className="w-5 h-5" />
                        </button>
                    )}
                    <button onClick={handlePrint} className="btn-icon-neu" title="Print Summary">
                        <PrintIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

             {hasErrors && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-r-lg print-avoid-break">
                    <h4 className="font-bold">Please resolve the validation errors before submitting.</h4>
                </div>
            )}

            <DataSection title="Demographics" step={1} onEdit={onEdit}>
                <DataPair label="Name" value={`${formData.demographics.firstName} ${formData.demographics.lastName}`} />
                <DataPair label="DOB" value={formData.demographics.dob} />
                <DataPair label="Gender" value={formData.demographics.gender} />
                <DataPair label="Sex" value={formData.demographics.sex} />
                <DataPair label="Blood Type" value={formData.demographics.bloodType} />
                <DataPair label="Phone" value={formData.demographics.phone} />
                <DataPair label="Email" value={formData.demographics.email} />
                <DataPair label="Address" value={formData.demographics.address} />
            </DataSection>

            <DataSection title="Chief Complaint" step={2} onEdit={onEdit}>
                <DataPair label="Symptoms" value={formData.complaint.symptoms.map(s => s.description).join(', ') || 'N/A'} />
                <DataPair label="Timeline" value={formData.complaint.timeline} />
            </DataSection>
            
            <DataSection title="History" step={3} onEdit={onEdit}>
                 <DataPair label="Medical" value={formData.history.medicalHistory.map(h => h.condition).join(', ') || 'N/A'} />
                 <DataPair label="Surgical" value={formData.history.surgicalHistory.map(h => h.procedure).join(', ') || 'N/A'} />
                 <DataPair label="Family" value={formData.history.familyHistory.map(f => `${f.relation}: ${f.condition}`).join(', ') || 'N/A'} />
                 <DataPair label="Medications" value={renderMedications(formData.history.medications)} />
                 <DataPair label="Allergies" value={formData.history.allergies.map(a => a.substance).join(', ') || 'N/A'} />
                 <DataPair label="Social History" value={
                     <div className="flex flex-col">
                        {/* FIX: Use correct property names */}
                        <span><strong>Smoking:</strong> {formData.history.socialHistory.smokingStatus || 'N/A'}</span>
                        <span><strong>Alcohol:</strong> {formData.history.socialHistory.alcoholConsumption || 'N/A'}</span>
                        <span><strong>Occupation:</strong> {formData.history.socialHistory.occupation || 'N/A'}</span>
                        <span><strong>Living Situation:</strong> {formData.history.socialHistory.livingSituation || 'N/A'}</span>
                        <span><strong>Diet:</strong> {formData.history.socialHistory.diet || 'N/A'}</span>
                    </div>
                 } />
                 <DataPair label="Review of Systems" value={renderRos(formData.history.reviewOfSystems)} />
            </DataSection>

            <DataSection title="Examination" step={4} onEdit={onEdit}>
                {/* FIX: Use correct property names */}
                <DataPair label="Vitals" value={`BP: ${formData.examination.vitals.bloodPressure || 'N/A'}, HR: ${formData.examination.vitals.heartRate || 'N/A'}, RR: ${formData.examination.vitals.respRate || 'N/A'}, Temp: ${formData.examination.vitals.temperature || 'N/A'}, SpO2: ${formData.examination.vitals.spO2 || 'N/A'}`} />
                <DataPair label="General Appearance" value={formData.examination.systems.general} />
                <DataPair label="Neuro Exam" value={formData.examination.systems.neurological} />
                <DataPair label="Cardio Exam" value={formData.examination.systems.cardiovascular} />
                <DataPair label="Resp Exam" value={formData.examination.systems.respiratory} />
                <DataPair label="Abdo Exam" value={formData.examination.systems.abdominal} />
            </DataSection>

            <DataSection title="Assessment" step={5} onEdit={onEdit}>
                {/* FIX: workingDiagnosis is an array of SnomedConcept, so we map to display names and join them. */}
                <DataPair label="Working Diagnosis" value={assessment.workingDiagnosis.map(d => d.display).join(', ')} />
                <DataPair label="Differential" value={assessment.differentialDiagnosis.map(d => d.display).join(', ') || 'N/A'} />
            </DataSection>

            <DataSection title="Plan" step={6} onEdit={onEdit}>
                {/* FIX: Use correct property names */}
                <DataPair label="Treatments" value={formData.plan.treatments} />
                <DataPair label="Pending Orders" value={formData.plan.pendingOrders.map(o => o.orderName).join(', ') || 'N/A'} />
                <DataPair label="Pending Referrals" value={formData.plan.pendingReferrals.map(r => r.specialty).join(', ') || 'N/A'} />
                <DataPair label="Follow-up" value={formData.plan.followUp || 'N/A'} />
            </DataSection>
        </div>
    );
};

export default ReviewStep;