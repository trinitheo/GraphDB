
import React, { useState } from 'react';
import type { Patient } from '../../../PatientMFE/types';
import FormCheckbox from '../../../PatientMFE/components/form/FormCheckbox';
import { useAuth } from '../../../PatientMFE/hooks/useAuth';
import { medicalRecordService } from '../../../PatientMFE/services/medicalRecordService';
import { CheckCircle, AlertTriangle, ClockIcon } from '../../../../components/icons';

interface PrepChecklistProps {
    patient: Patient;
    onPrepComplete: () => void;
}

const initialTasks = [
    { id: 'confirm-id', label: 'Confirm patient identity' },
    { id: 'review-reason', label: 'Review reason for visit' },
    { id: 'prep-equipment', label: 'Prepare necessary equipment' },
    { id: 'review-allergies', label: 'Review and confirm allergies' },
    { id: 'vitals-taken', label: 'Vitals have been taken and recorded' },
];

const PrepChecklist: React.FC<PrepChecklistProps> = ({ patient, onPrepComplete }) => {
    const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const { user } = useAuth();

    const handleToggle = (taskId: string) => {
        if (isSubmitted || isSaving) return;
        setCheckedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    const handleSelectAll = (checked: boolean) => {
        if (isSubmitted || isSaving) return;
        if (checked) {
            setCheckedTasks(new Set(initialTasks.map(t => t.id)));
        } else {
            setCheckedTasks(new Set());
        }
    };

    const handleMarkAsReady = async () => {
        if (!isComplete || !user) return;

        setIsSaving(true);
        setFeedback(null);
        try {
            const content = `Patient preparation checklist completed by ${user.name}. Patient is ready for clinician.`;
            await medicalRecordService.addMedicalRecordEntry({
                patientId: patient.id,
                content,
                type: 'Consultation',
            });
            setIsSubmitted(true);
            setFeedback({ type: 'success', message: 'Patient marked as ready. Clinician notified.' });
            onPrepComplete();
        } catch (error) {
            console.error("Failed to save prep complete note:", error);
            setFeedback({ type: 'error', message: 'Failed to save status. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const isComplete = checkedTasks.size === initialTasks.length;
    const isIndeterminate = checkedTasks.size > 0 && checkedTasks.size < initialTasks.length;

    return (
        <div className="card-panel p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                Prep Checklist
                {isSubmitted && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">Completed</span>}
            </h3>
            
            <div className="mb-4">
                <FormCheckbox
                    id="select-all-tasks"
                    label={<span className="font-bold text-slate-700">Select All Tasks</span>}
                    checked={isComplete}
                    isIndeterminate={isIndeterminate}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    disabled={isSubmitted || isSaving}
                />
            </div>
            
            <div className="h-px bg-slate-100 mb-4"></div>

            <div className="space-y-3">
                {initialTasks.map(task => (
                    <FormCheckbox
                        key={task.id}
                        id={task.id}
                        label={task.label}
                        checked={checkedTasks.has(task.id)}
                        onChange={() => handleToggle(task.id)}
                        disabled={isSubmitted || isSaving}
                    />
                ))}
            </div>
            
            {feedback && (
                <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm font-medium animate-fade-in ${
                    feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {feedback.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0"/> : <AlertTriangle className="w-5 h-5 flex-shrink-0"/>}
                    {feedback.message}
                </div>
            )}

            {!isSubmitted && (
                <button
                    onClick={handleMarkAsReady}
                    disabled={!isComplete || isSaving}
                    className={`btn-neu w-full mt-4 flex items-center justify-center gap-2 transition-colors
                    ${isComplete 
                        ? 'bg-green-600 text-white font-bold hover:bg-green-700 shadow-md border-transparent'
                        : 'text-slate-400 cursor-not-allowed bg-slate-100 border-slate-200'
                    }`}
                >
                    {isSaving ? (
                        <>
                            <ClockIcon className="w-4 h-4 animate-spin" /> Saving...
                        </>
                    ) : (
                        'Mark as Ready & Notify'
                    )}
                </button>
            )}
        </div>
    );
};

export default PrepChecklist;
