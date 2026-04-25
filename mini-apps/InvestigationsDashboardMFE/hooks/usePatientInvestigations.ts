import { useMemo } from 'react';
import type { Api } from '../../../api_contract/patient';
import type { Patient, Vitals, LabResult } from '../types';
import { parseResultsString } from '../../TestOrderingMFE/utils';

// Single source of truth for vitals configuration
const VITALS_CONFIG = {
  heartRate: { label: 'Heart Rate', trendable: true },
  bloodPressure: { label: 'Blood Pressure', trendable: true },
  temperature: { label: 'Temperature', trendable: true },
  respRate: { label: 'Respiratory Rate', trendable: true },
  spO2: { label: 'SpO2', trendable: true },
  weight: { label: 'Weight', trendable: true },
  height: { label: 'Height', trendable: false },
  bmi: { label: 'BMI', trendable: true },
  glucose: { label: 'Glucose', trendable: true },
  hba1c: { label: 'HbA1c', trendable: true },
  gcs: { label: 'GCS', trendable: false },
  avpu: { label: 'AVPU', trendable: false },
} as const;

// Derived constants - no duplication
export const TRENDABLE_VITALS = Object.entries(VITALS_CONFIG)
  .filter(([_, config]) => config.trendable)
  .map(([key, config]) => ({ key: key as keyof Vitals, label: config.label }));

export const STAT_VITALS = Object.entries(VITALS_CONFIG)
  .map(([key, config]) => ({ key: key as keyof Vitals, label: config.label }));

// Pure utility function for better testability and separation
export const processPatientLabResults = (orders: Patient['orders'] = []): LabResult[] => {
  const completedLabOrders = orders.filter((order): order is Api.V1.LabOrder => 
    order.orderType === 'Lab' && order.status === 'Completed'
  );

  const allLabResults = completedLabOrders.flatMap(order => {
    try {
      // Prefer parsedResults, fall back to parsing raw results
      if (order.parsedResults) {
        return order.parsedResults;
      }
      
      if (order.results) {
        return parseResultsString(order.results);
      }
      
      return [];
    } catch (error) {
      console.warn(`Failed to process lab order ${order.id}:`, error);
      return [];
    }
  });

  // Deduplicate by testName, keeping the most recent (assuming later = more recent)
  const uniqueResults = Array.from(
    new Map(allLabResults.map(item => [item.testName, item])).values()
  );

  return uniqueResults.sort((a, b) => a.testName.localeCompare(b.testName));
};

// React hook - clean and focused
export const usePatientInvestigations = (patient: Patient | null) => {
  return useMemo(() => {
    if (!patient) {
      return { availableLabResults: [] };
    }

    const availableLabResults = processPatientLabResults(patient.orders);

    return { availableLabResults };
  }, [patient]);
};

// Additional utility hook for specific use cases
export const useTrendableVitals = (patient: Patient | null) => {
  const { availableLabResults } = usePatientInvestigations(patient);
  
  return useMemo(() => ({
    trendableVitals: TRENDABLE_VITALS,
    labResults: availableLabResults,
    hasData: availableLabResults.length > 0
  }), [availableLabResults]);
};
