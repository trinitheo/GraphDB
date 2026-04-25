
export interface InventoryBatch {
    id: string;
    itemId: string;
    lotNumber: string;
    expiryDate: string; // ISO Date
    quantity: number;
    location: string;
}

export type InventoryCategory = 'Medication' | 'Supply' | 'Equipment' | 'Implant' | 'Syringe' | 'IV Supply';

export interface InventoryItem {
    id: string;
    name: string;
    category: InventoryCategory;
    description: string;
    unit: string;
    minLevel: number;
    reorderLevel: number;
    unitCost: number;
    supplier: string;
    isControlled: boolean;
    controlledSchedule?: 'II' | 'III' | 'IV' | 'V';
    batches: InventoryBatch[];
}

export interface InventoryKit {
    id: string;
    name: string;
    description: string;
    items: { itemId: string; quantity: number }[];
}

// Calculated fields for UI
export interface AggregatedItem extends InventoryItem {
    totalStock: number;
    status: 'Good' | 'Low' | 'Critical';
    nextExpiry: string | null;
    value: number;
}