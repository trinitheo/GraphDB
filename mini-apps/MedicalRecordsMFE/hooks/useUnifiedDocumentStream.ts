

import { useMemo } from 'react';
import type { MedicalRecordEntry } from '../types';

export type UnifiedDocument = {
  id: string;
  timestamp: string;
  type: 'InitialEncounter' | 'FollowUp' | MedicalRecordEntry['type'];
  data: MedicalRecordEntry;
};

export const useUnifiedDocumentStream = (records: MedicalRecordEntry[]): UnifiedDocument[] => {
  const unifiedStream = useMemo(() => {
    if (!records || records.length === 0) {
      return [];
    }
    
    // Sort records to find the oldest consultation
    const sortedRecords = [...records].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    let initialEncounterFound = false;

    const documents: UnifiedDocument[] = sortedRecords.map(record => {
      let docType: UnifiedDocument['type'] = record.type;

      if (record.type === 'Consultation' && !initialEncounterFound) {
        docType = 'InitialEncounter';
        initialEncounterFound = true;
      } else if (record.type === 'Consultation') {
        docType = 'FollowUp';
      }
      
      return {
        id: record.id,
        timestamp: record.timestamp,
        type: docType,
        data: record,
      };
    });

    // Return sorted descending (newest first)
    return documents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  }, [records]);

  return unifiedStream;
};