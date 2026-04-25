

import type { Api } from '../../api_contract/patient';

export type Patient = Api.V1.Patient;
export type Vitals = Api.V1.Vitals;
export type VitalsRecord = Api.V1.VitalsRecord;
export type Order = Api.V1.Order;
export type ImagingStudy = Api.V1.ImagingStudy;

// FIX: Align the LabResult type with the canonical API contract definition.
export type LabResult = Api.V1.LabResultValue;

// Types for the new widget-based dashboard
export type WidgetType = 'trend' | 'radial' | 'stat';

export interface TrendWidgetConfig {
    vitalKey: keyof Vitals;
    yMin?: string;
    yMax?: string;
}

export interface RadialWidgetConfig {
    testName: string;
    customRange?: {
        min: string;
        max: string;
    };
}

export interface StatWidgetConfig {
    vitalKey: keyof Vitals;
    title: string;
}

export interface Widget {
    id: string;
    type: WidgetType;
    config: TrendWidgetConfig | RadialWidgetConfig | StatWidgetConfig;
    gridSpan?: number; // Optional grid span for layout
}