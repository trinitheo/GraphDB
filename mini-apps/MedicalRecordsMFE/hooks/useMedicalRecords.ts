import { useState, useEffect, useCallback } from 'react';
import type { MedicalRecordEntry } from '../types';
import { medicalRecordService } from '../../PatientMFE/services/medicalRecordService';

export const useMedicalRecords = (patientId?: string) => {
    const [records, setRecords] = useState<MedicalRecordEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRecords = useCallback(async () => {
        if (!patientId) {
            setRecords([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await medicalRecordService.getMedicalRecord(patientId);
            if (response.data) {
                const sortedRecords = response.data.entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setRecords(sortedRecords);
            }
        } catch (err) {
            setError('Failed to load medical records.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    return { records, isLoading, error, refetch: fetchRecords };
};
