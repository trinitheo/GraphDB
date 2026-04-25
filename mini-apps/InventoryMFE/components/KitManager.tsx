
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { ChevronLeft, BoxIcon, PlusIcon, TrashIcon } from '../../../components/icons';
import CreateKitModal from './CreateKitModal';
import UseKitModal from './UseKitModal';
import type { InventoryKit } from '../types';

const KitManager: React.FC = () => {
    const { kits, items, deployKit, addKit } = useInventory();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedKit, setSelectedKit] = useState<InventoryKit | null>(null);

    const handleDeployClick = (kit: InventoryKit) => {
        setSelectedKit(kit);
    };

    const handleConfirmDeploy = (patientName: string) => {
        if (selectedKit) {
            deployKit(selectedKit.id, patientName);
            setSelectedKit(null);
        }
    };

    const handleSaveKit = (kitData: Omit<InventoryKit, 'id'>) => {
        addKit(kitData);
        setIsCreateModalOpen(false);
    };

    return (
        <div className="p-6 h-full flex flex-col bg-white">
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <ReactRouterDOM.Link to="/inventory" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6 text-slate-600" />
                    </ReactRouterDOM.Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Kits & Bundles</h1>
                        <p className="text-slate-500 text-sm mt-1">Pre-configured item sets for common procedures</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                >
                    <PlusIcon className="w-5 h-5" /> Create Kit
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto pb-4">
                {kits.map(kit => (
                    <div key={kit.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">{kit.name}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2 mt-1">{kit.description}</p>
                            </div>
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md whitespace-nowrap">
                                {kit.items.length} items
                            </span>
                        </div>
                        
                        <div className="bg-slate-50 rounded-lg p-4 mb-6 flex-1 border border-slate-100">
                            <ul className="space-y-2">
                                {kit.items.slice(0, 4).map((kitItem, idx) => {
                                    const actualItem = items.find(i => i.id === kitItem.itemId);
                                    return (
                                        <li key={idx} className="text-sm flex justify-between text-slate-700">
                                            <span className="truncate pr-2">{actualItem?.name || 'Unknown Item'}</span>
                                            <span className="font-mono text-slate-500 text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200">{kitItem.quantity}x</span>
                                        </li>
                                    );
                                })}
                                {kit.items.length > 4 && (
                                    <li className="text-xs text-slate-400 pt-1 text-center italic">
                                        + {kit.items.length - 4} more items
                                    </li>
                                )}
                            </ul>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => handleDeployClick(kit)}
                                className="flex-1 px-4 py-2.5 bg-slate-950 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                Use Kit
                            </button>
                            <button className="p-2.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <CreateKitModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleSaveKit}
            />

            {selectedKit && (
                <UseKitModal
                    isOpen={!!selectedKit}
                    onClose={() => setSelectedKit(null)}
                    onConfirm={handleConfirmDeploy}
                    kit={selectedKit}
                />
            )}
        </div>
    );
};

export default KitManager;
