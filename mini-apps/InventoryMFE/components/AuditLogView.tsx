
import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { ShieldIcon, SearchIcon, User, ChevronDown, ClockIcon } from '../../../components/icons';

const AuditLogView: React.FC = () => {
    const { auditLogs } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLogs = auditLogs.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 h-full flex flex-col">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
                <p className="text-slate-500">Complete history of all system actions</p>
            </header>

            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-6 flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                    <ShieldIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                    <h3 className="font-bold text-purple-900">HIPAA Compliance & Security</h3>
                    <p className="text-sm text-purple-700">All actions are logged with timestamps and user information for regulatory compliance</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by action, user, or details..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-200 outline-none"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded-lg">
                        All Actions <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="overflow-auto flex-1">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white sticky top-0 z-10">
                            <tr className="border-b border-slate-100">
                                <th className="px-6 py-4 font-semibold text-slate-900">Timestamp</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Action</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">User</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                                        <ClockIcon className="w-4 h-4 text-slate-400" />
                                        <div>
                                            <p>{new Date(log.timestamp).toISOString().split('T')[0]}</p>
                                            <p className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-2 py-1 bg-sky-100 text-sky-800 rounded text-xs font-bold uppercase tracking-wide">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-slate-400" />
                                            {log.userName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{log.details}</td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-slate-400">
                                        No logs found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-100 text-center text-xs text-slate-500">
                    Showing {filteredLogs.length} of {auditLogs.length} total log entries
                </div>
            </div>
        </div>
    );
};

export default AuditLogView;
