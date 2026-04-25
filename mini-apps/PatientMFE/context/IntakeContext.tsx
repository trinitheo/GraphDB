import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
// FIX: Import the correct form types and reducer logic.
import { formReducer, initialState, FormState, FormAction } from '../reducers/formReducer';
import type { MedicalHistoryForm } from '../types';
import { usePatients } from './PatientContext';
import { useDebounce } from '../hooks/useDebounce';
// FIX: Import new validation function
import { validateAllSteps } from '../utils/validation';
import { authService } from '../services/authService';

// --- STATE AND REDUCER ---
// Reducer logic is now imported from formReducer.ts

// --- CONTEXT DEFINITION ---

interface IntakeContextType {
    state: FormState;
    dispatch: React.Dispatch<FormAction>;
    handleSave: () => void;
    saveStatus: 'idle' | 'saving' | 'success' | 'error';
    validationErrors: Record<string, string[]>;
}

const IntakeContext = createContext<IntakeContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---

const DRAFT_KEY = 'newPatientIntakeDraft';

export const IntakeProvider: React.FC<{ children: React.ReactNode, navigate: (path: string) => void }> = ({ children, navigate }) => {
    const [state, dispatch] = useReducer(formReducer, initialState);
    const { addPatient } = usePatients();
    const [saveStatus, setSaveStatus] = useState<IntakeContextType['saveStatus']>('idle');
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
    const debouncedFormData = useDebounce(state.formData, 1000);

    // Load draft or set creator info on mount
    useEffect(() => {
        const loadInitialData = () => {
            const savedDraft = localStorage.getItem(DRAFT_KEY);
            if (savedDraft) {
                try {
                    const parsedDraft = JSON.parse(savedDraft);
                    // Basic validation to ensure draft shape is somewhat correct
                    if (parsedDraft.demographics && parsedDraft.complaint) {
                        dispatch({ type: 'RESTORE_DRAFT', payload: parsedDraft });
                    } else {
                        localStorage.removeItem(DRAFT_KEY);
                    }
                } catch {
                    localStorage.removeItem(DRAFT_KEY);
                }
            } 
        };
        loadInitialData();
    }, []);

    // Autosave draft
    useEffect(() => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(debouncedFormData));
    }, [debouncedFormData]);

    const handleSave = useCallback(async () => {
        const errors = validateAllSteps(state.formData);
        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            alert('Please fix the validation errors before submitting.');
            dispatch({ type: 'GO_TO_STEP', payload: 7 }); // Go to review step to show errors
            return;
        }

        setSaveStatus('saving');
        try {
            const newPatient = await addPatient(state.formData);
            if (newPatient) {
                setSaveStatus('success');
                localStorage.removeItem(DRAFT_KEY);
                setTimeout(() => navigate(`/patients/${newPatient.id}`), 1500);
            } else {
                throw new Error("Patient creation failed.");
            }
        } catch (error) {
            setSaveStatus('error');
            console.error("Error creating patient:", error);
        }
    }, [state.formData, addPatient, navigate, dispatch]);

    return (
        <IntakeContext.Provider value={{ state, dispatch, handleSave, saveStatus, validationErrors }}>
            {children}
        </IntakeContext.Provider>
    );
};

// --- HOOK ---

export const useIntake = (): IntakeContextType => {
    const context = useContext(IntakeContext);
    if (!context) {
        throw new Error('useIntake must be used within an IntakeProvider');
    }
    return context;
};