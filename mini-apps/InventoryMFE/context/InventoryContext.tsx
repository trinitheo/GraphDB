
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { InventoryItem, InventoryKit } from '../types';
import { mockItems, mockKits } from '../data/mockInventory';
import { authService } from '../../PatientMFE/services/authService';

export interface UsageLogEntry {
    id: string;
    timestamp: string;
    itemId: string;
    itemName: string;
    quantity: number;
    action: 'Used' | 'Added' | 'Adjustment' | 'Expired' | 'Kit Depletion';
    patientName?: string;
    userId: string;
    userName: string;
    location: string;
    notes?: string;
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    action: string;
    userId: string;
    userName: string;
    details: string;
}

interface InventoryContextType {
    items: InventoryItem[];
    kits: InventoryKit[];
    usageLogs: UsageLogEntry[];
    auditLogs: AuditLogEntry[];
    deployKit: (kitId: string, patientName?: string) => void;
    adjustStock: (itemId: string, quantityChange: number, reason: string, patientName?: string, type?: UsageLogEntry['action']) => void;
    addItem: (itemData: Omit<InventoryItem, 'id'>) => void;
    addKit: (kitData: Omit<InventoryKit, 'id'>) => void;
    refreshData: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [kits, setKits] = useState<InventoryKit[]>([]);
    const [usageLogs, setUsageLogs] = useState<UsageLogEntry[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

    useEffect(() => {
        // Initialize with mock data
        setItems(mockItems);
        setKits(mockKits);
        
        // Mock some initial logs
        setAuditLogs([
            { id: 'aud-1', timestamp: new Date().toISOString(), action: 'SYSTEM_INIT', userId: 'system', userName: 'System', details: 'Inventory system initialized' }
        ]);
    }, []);

    const refreshData = () => {
        setItems(mockItems);
    };

    const logAudit = (action: string, details: string) => {
        const user = authService.getCurrentUser();
        const newLog: AuditLogEntry = {
            id: `aud-${crypto.randomUUID()}`,
            timestamp: new Date().toISOString(),
            action,
            userId: user?.id || 'unknown',
            userName: user?.name || 'Unknown User',
            details
        };
        setAuditLogs(prev => [newLog, ...prev]);
    };

    const logUsage = (itemId: string, itemName: string, quantity: number, action: UsageLogEntry['action'], patientName?: string, notes?: string) => {
        const user = authService.getCurrentUser();
        const newLog: UsageLogEntry = {
            id: `use-${crypto.randomUUID()}`,
            timestamp: new Date().toISOString(),
            itemId,
            itemName,
            quantity: Math.abs(quantity),
            action,
            patientName,
            userId: user?.id || 'unknown',
            userName: user?.name || 'Unknown User',
            location: 'Clinic', // Defaulting for now
            notes
        };
        setUsageLogs(prev => [newLog, ...prev]);
    };

    const adjustStock = (itemId: string, quantityChange: number, reason: string, patientName?: string, type: UsageLogEntry['action'] = 'Adjustment') => {
        const itemIndex = items.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return;

        const item = { ...items[itemIndex] };
        
        if (quantityChange < 0) {
            // Deducting stock (FIFO)
            let deduction = Math.abs(quantityChange);
            // Sort by expiry
            const sortedBatches = [...item.batches].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
            
            const newBatches = sortedBatches.map(batch => {
                if (deduction <= 0) return batch;
                if (batch.quantity >= deduction) {
                    const updated = { ...batch, quantity: batch.quantity - deduction };
                    deduction = 0;
                    return updated;
                } else {
                    deduction -= batch.quantity;
                    return { ...batch, quantity: 0 };
                }
            });
            item.batches = newBatches;
        } else {
            // Adding stock - Add to most recent batch or create dummy "Adjustment Batch" if needed
            // For simplicity, we'll add to the first batch found or create one if none exist
            if (item.batches.length > 0) {
                // Add to the last expiring batch usually, or the one with most stock. 
                // Let's add to the first one for simplicity in this mock
                const batch = { ...item.batches[0] };
                batch.quantity += quantityChange;
                item.batches[0] = batch; // Replace
            } else {
                // No batches, create one
                item.batches.push({
                    id: `batch-${crypto.randomUUID()}`,
                    itemId: item.id,
                    lotNumber: 'ADJUSTMENT',
                    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
                    quantity: quantityChange,
                    location: 'General'
                });
            }
        }

        const newItems = [...items];
        newItems[itemIndex] = item;
        setItems(newItems);

        logUsage(item.id, item.name, quantityChange, type, patientName, reason);
        logAudit('STOCK_ADJUST', `Adjusted stock for ${item.name} by ${quantityChange}. Reason: ${reason}`);
    };

    const addItem = (itemData: Omit<InventoryItem, 'id'>) => {
        const newItemId = `inv-${crypto.randomUUID()}`;
        const newItem: InventoryItem = {
            ...itemData,
            id: newItemId,
            batches: itemData.batches.map((b) => ({
                ...b,
                id: `batch-${crypto.randomUUID()}`,
                itemId: newItemId
            }))
        };
        setItems(prev => [newItem, ...prev]);
        logAudit('CREATE_ITEM', `Created new item: ${newItem.name}`);
    };

    const addKit = (kitData: Omit<InventoryKit, 'id'>) => {
        const newKit: InventoryKit = {
            ...kitData,
            id: `kit-${crypto.randomUUID()}`
        };
        setKits(prev => [newKit, ...prev]);
        logAudit('CREATE_KIT', `Created kit: ${newKit.name}`);
    };

    const deployKit = (kitId: string, patientName?: string) => {
        const kit = kits.find(k => k.id === kitId);
        if (!kit) return;

        setItems(prevItems => {
            const newItems = [...prevItems];
            
            kit.items.forEach(kitComponent => {
                const itemIndex = newItems.findIndex(i => i.id === kitComponent.itemId);
                if (itemIndex === -1) return;

                const item = { ...newItems[itemIndex] };
                let quantityToDeduct = kitComponent.quantity;
                
                const sortedBatches = [...item.batches].sort((a, b) => 
                    new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
                );

                const newBatches = sortedBatches.map(batch => {
                    if (quantityToDeduct <= 0) return batch;

                    if (batch.quantity >= quantityToDeduct) {
                        const updatedBatch = { ...batch, quantity: batch.quantity - quantityToDeduct };
                        quantityToDeduct = 0;
                        return updatedBatch;
                    } else {
                        quantityToDeduct -= batch.quantity;
                        return { ...batch, quantity: 0 };
                    }
                });

                item.batches = newBatches;
                newItems[itemIndex] = item;
                
                // Log usage for each item in the kit
                // We do this inside the setState callback which is not ideal for side effects, 
                // but for this mock sync implementation it's acceptable.
                // In a real app, calculate new state first, then set it, then log.
            });
            return newItems;
        });
        
        // Log the kit usage itself
        logUsage('kit', kit.name, 1, 'Kit Depletion', patientName, `Deployed kit: ${kit.name}`);
        logAudit('DEPLOY_KIT', `Deployed kit ${kit.name} for ${patientName || 'Unknown Patient'}`);
    };

    return (
        <InventoryContext.Provider value={{ items, kits, usageLogs, auditLogs, deployKit, adjustStock, addItem, addKit, refreshData }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) throw new Error('useInventory must be used within InventoryProvider');
    return context;
};
