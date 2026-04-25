import React, { useState, useEffect, useRef } from 'react';
import type { Api } from '../../../api_contract/patient';
import Modal from '../../MedicalRecordsMFE/components/modals/Modal';
import FormInput from '../../PatientMFE/components/form/FormInput';
import FormSelect from '../../PatientMFE/components/form/FormSelect';
import FormTextArea from '../../PatientMFE/components/form/FormTextArea';
import { useDebounce } from '../../PatientMFE/hooks/useDebounce';
import { rxNormService } from '../../PatientMFE/services/rxNormService';
import { geminiService } from '../../AIFeaturesMFE';
import { parseMedicationName } from '../utils';
import { Sparkles } from '../../../components/icons';

interface PrescriptionPadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (prescription: Omit<Api.V1.Prescription, 'id' | 'datePrescribed' | 'prescriber'>) => void;
    patient: Api.V1.Patient;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const Highlight: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
    if (!highlight.trim()) {
        return <span>{text}</span>;
    }
    const regex = new RegExp(`(${escapeRegExp(highlight)})`, 'gi');
    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <strong key={i} className="font-bold bg-sky-100 rounded">{part}</strong>
                ) : (
                    part
                )
            )}
        </span>
    );
};


const PrescriptionPadModal: React.FC<PrescriptionPadModalProps> = ({ isOpen, onClose, onSave, patient }) => {
    const [medicationName, setMedicationName] = useState('');
    const [rxcui, setRxcui] = useState<string | undefined>(undefined);
    const [suggestions, setSuggestions] = useState<Api.V1.DrugSuggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isMedicationInputFocused, setIsMedicationInputFocused] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    
    const [dose, setDose] = useState('');
    const [route, setRoute] = useState('');
    const [frequency, setFrequency] = useState('');
    const [duration, setDuration] = useState('');
    const [durationUnit, setDurationUnit] = useState('days');
    const [refills, setRefills] = useState('');
    const [notes, setNotes] = useState('');
    const [isGeneratingSig, setIsGeneratingSig] = useState(false);

    const formId = "prescription-pad-form";
    const debouncedSearchTerm = useDebounce(medicationName, 300);
    const searchRef = useRef<HTMLDivElement>(null);
    const suggestionsListRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        if (debouncedSearchTerm && !rxcui) {
            setIsSearching(true);
            setShowSuggestions(true);
            rxNormService.findDrugs(debouncedSearchTerm).then(results => {
                setSuggestions(results);
                setIsSearching(false);
                setHighlightedIndex(-1);
            });
        } else {
            setSuggestions([]);
        }
    }, [debouncedSearchTerm, rxcui]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
                setIsMedicationInputFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    useEffect(() => {
        if (highlightedIndex >= 0 && suggestionsListRef.current) {
            const highlightedElement = suggestionsListRef.current.children[highlightedIndex] as HTMLLIElement;
            if (highlightedElement) {
                highlightedElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex]);

    const resetForm = () => {
        setMedicationName('');
        setRxcui(undefined);
        setSuggestions([]);
        setDose('');
        setRoute('');
        setFrequency('');
        setDuration('');
        setDurationUnit('days');
        setRefills('');
        setNotes('');
        setIsGeneratingSig(false);
        setHighlightedIndex(-1);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSelectSuggestion = (suggestion: Api.V1.DrugSuggestion) => {
        setMedicationName(suggestion.name);
        setRxcui(suggestion.rxcui);
        const { dose: parsedDose, route: parsedRoute } = parseMedicationName(suggestion.name);
        setDose(parsedDose);
        setRoute(parsedRoute);
        setShowSuggestions(false);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMedicationName(e.target.value);
        if (rxcui) {
            setRxcui(undefined);
            setDose('');
            setRoute('');
        }
    };
    
    const handleGenerateSig = async () => {
        setIsGeneratingSig(true);
        try {
            const durationString = duration ? `${duration} ${durationUnit}` : undefined;
            const sig = await geminiService.generateSig({ name: medicationName, dosage: dose, route, frequency, duration: durationString });
            setNotes(sig);
        } catch (error) {
            console.error(error);
            // Handle error in UI
        } finally {
            setIsGeneratingSig(false);
        }
    };
    
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (!medicationName || !dose || !route || !frequency) return;
        const durationString = duration ? `${duration} ${durationUnit}` : undefined;

        onSave({
            medicationName,
            rxcui,
            dose,
            route,
            frequency,
            refills: parseInt(refills, 10) || 0,
            notes,
            duration: durationString,
        });
        resetForm();
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                    handleSelectSuggestion(suggestions[highlightedIndex]);
                }
            }
        }
    };

    const footer = (
        <div className="flex justify-end gap-4">
            <button type="button" onClick={handleClose} className="btn-neu">
                Cancel
            </button>
            <button type="submit" form={formId} className="btn-neu text-sky-600">
                Save Prescription
            </button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`New Prescription for ${patient.name}`} footer={footer}>
            <form id={formId} onSubmit={handleSave} className="space-y-4">
                <div ref={searchRef} className="relative">
                    <FormInput
                        label="Medication Name"
                        value={medicationName}
                        onChange={handleNameChange}
                        onFocus={() => {
                            setShowSuggestions(true);
                            setIsMedicationInputFocused(true);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Start typing a drug name..."
                        required
                        autoComplete="off"
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded={showSuggestions && suggestions.length > 0}
                        aria-controls="rx-suggestions-list"
                        aria-activedescendant={highlightedIndex > -1 ? `rx-suggestion-${highlightedIndex}` : undefined}
                    />
                     {isMedicationInputFocused && medicationName.length < 3 && !rxcui && (
                        <p className="mt-1 text-xs text-slate-500 animate-fade-in-fast">
                            Type at least 3 characters to start searching for medications.
                        </p>
                    )}
                    {showSuggestions && (suggestions.length > 0 || isSearching) && (
                        <ul ref={suggestionsListRef} id="rx-suggestions-list" role="listbox" className="absolute z-40 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {isSearching ? (
                                <li className="p-3 text-sm text-slate-500">Searching...</li>
                            ) : (
                                suggestions.map((s, index) => (
                                    <li
                                        key={s.rxcui}
                                        id={`rx-suggestion-${index}`}
                                        role="option"
                                        aria-selected={index === highlightedIndex}
                                        onClick={() => handleSelectSuggestion(s)}
                                        className={`p-3 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer ${index === highlightedIndex ? 'bg-slate-100' : ''}`}
                                    >
                                        <Highlight text={s.name} highlight={debouncedSearchTerm} />
                                    </li>
                                ))
                            )}
                        </ul>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Dosage" value={dose} onChange={e => setDose(e.target.value)} placeholder="e.g., 10mg" required />
                    <FormSelect label="Route" value={route} onChange={e => setRoute(e.target.value)} required>
                        <option value="">Select...</option>
                        <option>Oral</option>
                        <option>Topical</option>
                        <option>Injection</option>
                        <option>Intravenous</option>
                        <option>Inhalation</option>
                    </FormSelect>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Frequency" value={frequency} onChange={e => setFrequency(e.target.value)} placeholder="e.g., Once daily" required />
                    <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                        <div className="flex gap-2">
                            <input
                                id="duration"
                                type="number"
                                value={duration}
                                onChange={e => setDuration(e.target.value)}
                                placeholder="e.g., 14"
                                className="input-neu w-full"
                            />
                            <select
                                aria-label="Duration unit"
                                value={durationUnit}
                                onChange={e => setDurationUnit(e.target.value)}
                                className="select-neu"
                            >
                                <option value="days">days</option>
                                <option value="weeks">weeks</option>
                                <option value="months">months</option>
                            </select>
                        </div>
                    </div>
                </div>
                <FormInput label="Refills" type="number" value={refills} onChange={e => setRefills(e.target.value)} placeholder="e.g., 3" />
                <div>
                     <FormTextArea 
                        label="Directions (SIG)" 
                        value={notes} 
                        onChange={e => setNotes(e.target.value)} 
                        rows={3}
                        placeholder="Patient-friendly instructions..."
                        labelAddon={
                            <div className="ai-button-container">
                                <div className="glow"></div>
                                <div className="darkBorderBg"></div>
                                <div className="border"></div>
                                <div className="white"></div>
                                <button type="button" onClick={handleGenerateSig} disabled={isGeneratingSig || !dose || !route || !frequency} className="ai-button text-xs">
                                    {isGeneratingSig ? 'Generating...' : <><Sparkles className="w-4 h-4" /> AI Generate</>}
                                </button>
                            </div>
                        }
                     />
                </div>
            </form>
        </Modal>
    );
};

export default PrescriptionPadModal;