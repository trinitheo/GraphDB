
import type { InventoryItem, InventoryKit } from '../types';

export const mockItems: InventoryItem[] = [
    {
        id: 'inv-1',
        name: 'Epinephrine',
        category: 'Medication',
        description: 'EpiPen • 1mg/mL',
        unit: 'Pen',
        minLevel: 10,
        reorderLevel: 20,
        unitCost: 120.00,
        supplier: 'PharmaDist',
        isControlled: false,
        batches: [
            { id: 'b1', itemId: 'inv-1', lotNumber: 'EP2024-001', expiryDate: '2026-03-03', quantity: 15, location: 'Clinic' }
        ]
    },
    {
        id: 'inv-2',
        name: 'Morphine Sulfate',
        category: 'Medication',
        description: 'Generic • 10mg/mL',
        unit: 'Vial',
        minLevel: 5,
        reorderLevel: 10,
        unitCost: 15.00,
        supplier: 'PharmaDist',
        isControlled: true,
        controlledSchedule: 'II',
        batches: [
            { id: 'b2', itemId: 'inv-2', lotNumber: 'MS2024-045', expiryDate: '2026-06-01', quantity: 8, location: 'Clinic' }
        ]
    },
    {
        id: 'inv-3',
        name: 'Ondansetron',
        category: 'Medication',
        description: 'Zofran • 4mg/2mL',
        unit: 'Vial',
        minLevel: 20,
        reorderLevel: 40,
        unitCost: 2.50,
        supplier: 'PharmaDist',
        isControlled: false,
        batches: [
            { id: 'b3', itemId: 'inv-3', lotNumber: 'OND2024-012', expiryDate: '2026-12-03', quantity: 25, location: 'Clinic' }
        ]
    },
    {
        id: 'inv-4',
        name: 'Vitamin B12',
        category: 'Medication',
        description: 'Cyanocobalamin • 1000mcg/mL',
        unit: 'Vial',
        minLevel: 30,
        reorderLevel: 50,
        unitCost: 5.00,
        supplier: 'PharmaDist',
        isControlled: false,
        batches: [
            { id: 'b4', itemId: 'inv-4', lotNumber: 'B12-2024-078', expiryDate: '2027-05-27', quantity: 50, location: 'Clinic' }
        ]
    },
    {
        id: 'inv-5',
        name: '3mL Syringe with Needle',
        category: 'Syringe',
        description: 'BD • 3mL, 23G',
        unit: 'Box',
        minLevel: 50,
        reorderLevel: 100,
        unitCost: 12.00,
        supplier: 'MedSupply Co',
        isControlled: false,
        batches: [
            { id: 'b5', itemId: 'inv-5', lotNumber: 'SYR-2024-234', expiryDate: '2027-12-03', quantity: 120, location: 'Clinic' }
        ]
    },
    {
        id: 'inv-6',
        name: '18G IV Catheter',
        category: 'IV Supply',
        description: 'BD Insyte • 18 Gauge',
        unit: 'Box',
        minLevel: 20,
        reorderLevel: 40,
        unitCost: 45.00,
        supplier: 'MedSupply Co',
        isControlled: false,
        batches: [
            { id: 'b6', itemId: 'inv-6', lotNumber: 'CAT-2024-567', expiryDate: '2028-05-21', quantity: 45, location: 'Mobile Kit' }
        ]
    },
    {
        id: 'inv-7',
        name: 'Normal Saline 0.9%',
        category: 'IV Supply',
        description: 'Baxter • 1000mL bag',
        unit: 'Bag',
        minLevel: 20,
        reorderLevel: 50,
        unitCost: 2.50,
        supplier: 'MedSupply Co',
        isControlled: false,
        batches: [
            { id: 'b7', itemId: 'inv-7', lotNumber: 'NS-2024-891', expiryDate: '2027-02-26', quantity: 30, location: 'Clinic' }
        ]
    },
    {
        id: 'inv-8',
        name: 'Lactated Ringers',
        category: 'IV Supply',
        description: 'Baxter • 1000mL bag',
        unit: 'Bag',
        minLevel: 10,
        reorderLevel: 25,
        unitCost: 2.75,
        supplier: 'MedSupply Co',
        isControlled: false,
        batches: [
            { id: 'b8', itemId: 'inv-8', lotNumber: 'LR-2024-445', expiryDate: '2025-12-23', quantity: 12, location: 'Clinic' }
        ]
    }
];

export const mockKits: InventoryKit[] = [
    {
        id: 'kit-1',
        name: 'IV Start Kit',
        description: 'Standard setup for IV initiation',
        items: [
            { itemId: 'inv-6', quantity: 1 },
            { itemId: 'inv-7', quantity: 1 }
        ]
    }
];
