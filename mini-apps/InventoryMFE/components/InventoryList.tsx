
import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { SearchIcon, ChevronDown, PlusIcon, BoxIcon, Pencil, ShieldIcon, ClipboardIcon } from '../../../components/icons';
import type { InventoryItem } from '../types';
import AddItemModal from './AddItemModal';
import AdjustStockModal from './AdjustStockModal';

const InventoryList: React.FC = () => {
    const { items, addItem } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All Categories');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);

    const filteredItems = useMemo(() => {
        return items.filter(item => 
            (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             item.batches.some(b => b.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()))) &&
            (categoryFilter === 'All Categories' || item.category === categoryFilter)
        );
    }, [searchTerm, items, categoryFilter]);

    const getExpiryStatus = (dateStr: string) => {
        const expiry = new Date(dateStr);
        const today = new Date();
        const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

        if (daysLeft < 0) return { label: 'Expired', color: 'bg-red-500 text-white' };
        if (daysLeft <= 30) return { label: 'Exp. Soon', color: 'bg-yellow-500 text-white' };
        if (daysLeft <= 90) return { label: `Exp. ${daysLeft}d`, color: 'bg-blue-500 text-white' };
        return null;
    };

    const handleSaveItem = (newItem: Omit<InventoryItem, 'id'>) => {
        addItem(newItem);
        setIsAddModalOpen(false);
    };

    return (
        <div className="p-6 h-full flex flex-col bg-white">
            <header className="flex flex-col gap-6 mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
                        <p className="text-slate-500 mt-1">Manage and track all consumables</p>
                    </div>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add Item
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, brand, or lot number..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 transition-all"
                        />
                    </div>
                    <div className="relative w-full md:w-64">
                        <select 
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full appearance-none bg-slate-50 border-none text-slate-700 py-2.5 pl-4 pr-10 rounded-lg focus:ring-2 focus:ring-sky-500 cursor-pointer"
                        >
                            <option>All Categories</option>
                            <option>Medication</option>
                            <option>Supply</option>
                            <option>Syringe</option>
                            <option>IV Supply</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                </div>
            </header>

            <div className="border border-slate-200 rounded-xl overflow-hidden flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white z-10 shadow-sm">
                        <tr className="border-b border-slate-100">
                            <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wide">Item</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wide">Category</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wide">Lot #</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wide">Location</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wide text-right">Quantity</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wide">Expiry</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wide">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wide text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredItems.map(item => {
                            const totalStock = item.batches.reduce((acc, b) => acc + b.quantity, 0);
                            const primaryBatch = item.batches[0];
                            const expiryStatus = primaryBatch ? getExpiryStatus(primaryBatch.expiryDate) : null;

                            return (
                                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-900 text-sm">{item.name}</span>
                                                {item.isControlled && (
                                                    <ShieldIcon className="w-3.5 h-3.5 text-purple-600" />
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-500 mt-0.5">{item.description}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-600">{item.category}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-slate-900">{primaryBatch?.lotNumber || '-'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-600">{primaryBatch?.location || '-'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-semibold text-slate-900">{totalStock}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-600 font-mono">
                                            {primaryBatch ? new Date(primaryBatch.expiryDate).toISOString().split('T')[0] : '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {expiryStatus ? (
                                            <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold ${expiryStatus.color}`}>
                                                {expiryStatus.label}
                                            </span>
                                        ) : (
                                            <span className="inline-block w-2 h-2 rounded-full bg-green-400 ml-2"></span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => setAdjustItem(item)}
                                                className="p-1.5 hover:bg-slate-200 rounded-md text-slate-600 transition-colors border border-slate-200"
                                                title="Adjust Stock"
                                            >
                                                <BoxIcon className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 hover:bg-slate-200 rounded-md text-slate-500 transition-colors border border-slate-200">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <AddItemModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSave={handleSaveItem} 
            />
            {adjustItem && (
                <AdjustStockModal
                    isOpen={!!adjustItem}
                    onClose={() => setAdjustItem(null)}
                    item={adjustItem}
                />
            )}
        </div>
    );
};

export default InventoryList;
