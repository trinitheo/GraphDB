import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import FormTextArea from '../../../PatientMFE/components/form/FormTextArea'; // Shared component
import type { MedicalRecordEntry, Api } from '../../types';
import SnomedSearchInput from '../../../PatientMFE/components/ui/SnomedSearchInput';
import FormField from '../../../PatientMFE/components/form/FormField';
import { XIcon } from '../../../../components/icons';
import type { UserRole } from '../../../../api_contract/shared';

type SnomedConcept = Api.V1.SnomedConcept;

interface FollowUpNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (noteData: { subjective: string, objective: string, assessment: string, plan: string, pendingDiagnoses: SnomedConcept[] }) => void;
    records: MedicalRecordEntry[];
    userRole: UserRole;
}

const ComparisonDisplay: React.FC<{ title: string, text: string, onClose: () => void, containerRef: React.RefObject<HTMLDivElement> }> = ({ title, text, onClose, containerRef }) => {
    useEffect(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [containerRef]);
    
    return (
        <div ref={containerRef} className="p-3 mt-2 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm text-sm w-full animate-fade-in-fast">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-yellow-800">Previous Note: {title}</h4>
                <button type="button" onClick={onClose} className="p-1 rounded-full text-slate-500 hover:text-slate-800">
                    <XIcon size={16} />
                </button>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-slate-700 max-h-32 overflow-y-auto">
                {text}
            </pre>
        </div>
    );
};

const parseSoapContent = (content: string): { subjective: string; objective: string; assessment: string; plan: string; } => {
    const sections = { subjective: '', objective: '', assessment: '', plan: '' };
    if (!content) return sections;

    const sMatch = content.match(/S: Subjective\n([\s\S]*?)(?=\n\nO: Objective|\n\nA: Assessment|\n\nP: Plan|$)/);
    if (sMatch) sections.subjective = sMatch[1].trim();

    const oMatch = content.match(/O: Objective\n([\s\S]*?)(?=\n\nA: Assessment|\n\nP: Plan|$)/);
    if (oMatch) sections.objective = oMatch[1].trim();

    const aMatch = content.match(/A: Assessment\n([\s\S]*?)(?=\n\nP: Plan|$)/);
    if (aMatch) sections.assessment = aMatch[1].trim();

    const pMatch = content.match(/P: Plan\n([\s\S]*?$)/);
    if (pMatch) sections.plan = pMatch[1].trim();

    return sections;
};


const FollowUpNoteModal: React.FC<FollowUpNoteModalProps> = ({ isOpen, onClose, onSave, records, userRole }) => {
    const [subjective, setSubjective] = useState('');
    const [objective, setObjective] = useState('');
    const [assessment, setAssessment] = useState('');
    const [plan, setPlan] = useState('');
    const [pendingDiagnoses, setPendingDiagnoses] = useState<SnomedConcept[]>([]);
    const [error, setError] = useState('');

    const [previousNote, setPreviousNote] = useState<MedicalRecordEntry | null>(null);
    const [comparison, setComparison] = useState<{ section: keyof ReturnType<typeof parseSoapContent>, text: string } | null>(null);
    const comparisonRef = useRef<HTMLDivElement>(null);

    const isClinician = userRole === 'Clinician' || userRole === 'Owner';

    useEffect(() => {
        if (!isOpen) return;

        const timeout = setTimeout(() => {
            if (subjective || objective || assessment || plan || pendingDiagnoses.length > 0) {
                localStorage.setItem('soapNoteDraft', JSON.stringify({ subjective, objective, assessment, plan, pendingDiagnoses }));
            }
        }, 1000);

        return () => clearTimeout(timeout);
    }, [subjective, objective, assessment, plan, pendingDiagnoses, isOpen]);

    useEffect(() => {
        if (isOpen) {
            const draft = localStorage.getItem('soapNoteDraft');
            if (draft) {
                const parsed = JSON.parse(draft);
                setSubjective(parsed.subjective || '');
                setObjective(parsed.objective || '');
                setAssessment(parsed.assessment || '');
                setPlan(parsed.plan || '');
                setPendingDiagnoses(parsed.pendingDiagnoses || []);
            }
            if (records && records.length > 0) {
                const lastNote = [...records].filter(r => r.type === 'Consultation').sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                setPreviousNote(lastNote);
            }
        } else {
            setPreviousNote(null);
            setComparison(null);
        }
    }, [isOpen, records]);

    const clearDraftAndClose = () => {
        setSubjective('');
        setObjective('');
        setAssessment('');
        setPlan('');
        setPendingDiagnoses([]);
        setError('');
        localStorage.removeItem('soapNoteDraft');
        onClose();
    };
    
    const handleSave = () => {
        if (isClinician && (!assessment.trim() || !plan.trim())) {
            setError('Assessment and Plan are required fields for your role.');
            return;
        }
        onSave({ subjective, objective, assessment, plan, pendingDiagnoses });
        clearDraftAndClose();
    };

    const handleShowComparison = (section: keyof ReturnType<typeof parseSoapContent>) => {
        if (comparison?.section === section) {
            setComparison(null);
        } else if (previousNote) {
            const parsedContent = parseSoapContent(previousNote.content);
            if(parsedContent[section]){
                 setComparison({ section, text: parsedContent[section] });
            }
        }
    };
    
    const createComparisonAddon = (section: keyof ReturnType<typeof parseSoapContent>) => {
        if (previousNote && parseSoapContent(previousNote.content)[section]) {
            const isActive = comparison?.section === section;
            return (
                <button
                    type="button"
                    onClick={() => handleShowComparison(section)}
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full transition-colors ${
                        isActive 
                        ? 'bg-yellow-200 text-yellow-800' 
                        : 'bg-sky-100 hover:bg-sky-200'
                    }`}
                    title="Compare with previous note"
                >
                    Compare
                </button>
            );
        }
        return null;
    };

    const footer = (
        <div className="flex justify-end gap-4">
            <button type="button" onClick={clearDraftAndClose} className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300 transition-colors">
                Cancel
            </button>
            <button type="button" onClick={handleSave} className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 transition-colors">
                Save Note
            </button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={clearDraftAndClose} title="Add Follow-up Note (SOAP)" footer={footer}>
            <div className="space-y-4">
                <div>
                    <FormTextArea
                        label="Subjective"
                        value={subjective}
                        onChange={(e) => setSubjective(e.target.value)}
                        placeholder="Patient's report of symptoms, feelings, and concerns..."
                        rows={3}
                        labelAddon={createComparisonAddon('subjective')}
                    />
                     {comparison?.section === 'subjective' && (
                        <ComparisonDisplay title="Subjective" text={comparison.text} onClose={() => setComparison(null)} containerRef={comparisonRef} />
                    )}
                </div>
                <div>
                    <FormTextArea
                        label="Objective"
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        placeholder="Clinician's objective findings (vitals, exam results, lab data)..."
                        rows={3}
                        labelAddon={createComparisonAddon('objective')}
                    />
                    {comparison?.section === 'objective' && (
                        <ComparisonDisplay title="Objective" text={comparison.text} onClose={() => setComparison(null)} containerRef={comparisonRef} />
                    )}
                </div>
                <div>
                    <FormTextArea
                        label="Assessment"
                        value={assessment}
                        onChange={(e) => setAssessment(e.target.value)}
                        placeholder="Your diagnosis or assessment of the patient's condition..."
                        rows={3}
                        required={isClinician}
                        labelAddon={createComparisonAddon('assessment')}
                    />
                    {comparison?.section === 'assessment' && (
                        <ComparisonDisplay title="Assessment" text={comparison.text} onClose={() => setComparison(null)} containerRef={comparisonRef} />
                    )}
                    <div className="mt-4">
                        <FormField
                            label="Add Pending Diagnoses (Optional)"
                            help="Search for and add potential diagnoses to be investigated further."
                        >
                             <SnomedSearchInput
                                value={pendingDiagnoses}
                                onChange={setPendingDiagnoses}
                                placeholder="Search for conditions (e.g., headache, asthma)..."
                            />
                        </FormField>
                    </div>
                </div>
                <div>
                    <FormTextArea
                        label="Plan"
                        value={plan}
                        onChange={(e) => setPlan(e.target.value)}
                        placeholder="The treatment plan, including medications, therapies, referrals, and patient education..."
                        rows={3}
                        required={isClinician}
                        labelAddon={createComparisonAddon('plan')}
                    />
                    {comparison?.section === 'plan' && (
                        <ComparisonDisplay title="Plan" text={comparison.text} onClose={() => setComparison(null)} containerRef={comparisonRef} />
                    )}
                </div>
                 {error && <p className="text-sm text-center text-red-600">{error}</p>}
            </div>
        </Modal>
    );
};

export default FollowUpNoteModal;