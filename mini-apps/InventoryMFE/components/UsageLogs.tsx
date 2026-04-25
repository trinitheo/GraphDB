
import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { BoxIcon, User, ShieldIcon, SearchIcon, ChevronDown } from '../../../components/icons';

const UsageLogs: React.FC = () => {
    const { usageLogs } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLogs = usageLogs.filter(log => 
        log.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        totalUsed: usageLogs.filter(l => l.action === 'Used' || l.action === 'Kit Depletion').reduce((acc, l) => acc + l.quantity, 0),
        encounters: new Set(usageLogs.filter(l => l.patientName).map(l => l.patientName)).size,
        controlled: 0 // Mocked for now as we don't track controlled usage explicitly in logs yet
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Usage Logs</h1>
                <p className="text-slate-500">Track consumption and patient encounters</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-slate-600">Total Items Used</span>
                        <BoxIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="text-3xl font-bold text-slate-900">{stats.totalUsed}</span>
                    <p className="text-xs text-slate-400 mt-1">Across {usageLogs.length} transactions</p>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-slate-600">Patient Encounters</span>
                        <User className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="text-3xl font-bold text-slate-900">{stats.encounters}</span>
                    <p className="text-xs text-slate-400 mt-1">Unique patients served</p>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-slate-600">Controlled Substances</span>
                        <ShieldIcon className="w-5 h-5 text-purple-500" />
                    </div>
                    <span className="text-3xl font-bold text-slate-900">{stats.controlled}</span>
                    <p className="text-xs text-slate-400 mt-1">DEA logged transactions</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by item, patient, or user..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-200 outline-none"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded-lg">
                        All Logs <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="overflow-auto flex-1">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white sticky top-0 z-10">
                            <tr className="border-b border-slate-100">
                                <th className="px-6 py-4 font-semibold text-slate-900">Date & Time</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Item</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Quantity</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Patient</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">User</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Location</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 text-slate-600">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{log.itemName}</td>
                                    <td className="px-6 py-4 font-mono font-bold text-slate-700">
                                        {log.action === 'Added' ? '+' : '-'}{log.quantity}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{log.patientName || '-'}</td>
                                    <td className="px-6 py-4 text-slate-600">{log.userName}</td>
                                    <td className="px-6 py-4 text-slate-500">{log.location}</td>
                                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={log.notes}>
                                        {log.notes || '-'}
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-slate-400">
                                        No usage logs found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UsageLogs;
