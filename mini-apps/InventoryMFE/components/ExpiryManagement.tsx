
import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { AlertCircleIcon, ClockIcon, CheckCircle, ArchiveIcon } from '../../../components/icons';

const StatCard = ({ icon, label, count, subtext, color }: any) => (
    <div className={`p-4 rounded-xl border ${color.border} ${color.bg} flex flex-col justify-between h-32`}>
        <div className="flex items-center gap-2">
            <div className={color.text}>{icon}</div>
            <span className={`font-semibold ${color.text}`}>{label}</span>
        </div>
        <div>
            <span className={`text-4xl font-bold ${color.text}`}>{count}</span>
            <p className={`text-xs ${color.subtext} mt-1`}>{subtext}</p>
        </div>
    </div>
);

const ExpiryCard: React.FC<{ batch: any, type: 'critical' | 'warning' }> = ({ batch, type }) => {
    const colorClass = type === 'critical' ? 'bg-amber-400' : 'bg-blue-500';
    const progress = Math.max(0, Math.min(100, (batch.daysLeft / (type === 'critical' ? 30 : 90)) * 100));
    
    return (
        <div className={`p-4 rounded-lg border ${type === 'critical' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'} mb-3`}>
            <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-800 text-lg">{batch.item.name}</h4>
                <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${colorClass}`}>
                    {batch.daysLeft}d left
                </span>
            </div>
            <p className="text-sm text-slate-600 mb-3">{batch.item.description} • Lot: {batch.lotNumber}</p>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1">
                <div className={`${colorClass} h-1.5 rounded-full`} style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Expires: {new Date(batch.expiryDate).toISOString().split('T')[0]}</span>
                <span>Qty: {batch.quantity}</span>
            </div>
        </div>
    );
};

const ExpiryManagement: React.FC = () => {
    const { items } = useInventory();

    const flatBatches = items.flatMap(item => 
        item.batches.map(batch => ({ 
            ...batch, 
            item,
            daysLeft: Math.ceil((new Date(batch.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
        }))
    );

    const expired = flatBatches.filter(b => b.daysLeft < 0);
    const critical = flatBatches.filter(b => b.daysLeft >= 0 && b.daysLeft <= 30);
    const warning = flatBatches.filter(b => b.daysLeft > 30 && b.daysLeft <= 90);
    const good = flatBatches.filter(b => b.daysLeft > 90);

    return (
        <div className="p-6 h-full overflow-y-auto">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Expiry Management</h1>
                <p className="text-slate-500">Monitor and manage expiring inventory</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard 
                    icon={<ArchiveIcon className="w-5 h-5" />} 
                    label="Expired" 
                    count={expired.length} 
                    subtext="Remove immediately"
                    color={{ bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', subtext: 'text-red-500' }}
                />
                <StatCard 
                    icon={<ClockIcon className="w-5 h-5" />} 
                    label="Critical (≤30d)" 
                    count={critical.length} 
                    subtext="Use or rotate soon"
                    color={{ bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-700', subtext: 'text-yellow-600' }}
                />
                <StatCard 
                    icon={<ClockIcon className="w-5 h-5" />} 
                    label="Warning (≤90d)" 
                    count={warning.length} 
                    subtext="Monitor closely"
                    color={{ bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', subtext: 'text-blue-500' }}
                />
                <StatCard 
                    icon={<CheckCircle className="w-5 h-5" />} 
                    label="Good (>90d)" 
                    count={good.length} 
                    subtext="In good standing"
                    color={{ bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-700', subtext: 'text-green-600' }}
                />
            </div>

            <div className="space-y-6">
                <section>
                    <h3 className="flex items-center gap-2 text-lg font-bold text-slate-700 mb-4">
                        <ClockIcon className="w-5 h-5 text-yellow-600" />
                        Critical - Expiring Within 30 Days
                    </h3>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        {critical.length === 0 ? <p className="text-slate-500 text-center py-4">No critical items.</p> : 
                            critical.map(b => <ExpiryCard key={b.id} batch={b} type="critical" />)
                        }
                    </div>
                </section>

                <section>
                    <h3 className="flex items-center gap-2 text-lg font-bold text-slate-700 mb-4">
                        <ClockIcon className="w-5 h-5 text-blue-600" />
                        Warning - Expiring Within 90 Days
                    </h3>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        {warning.length === 0 ? <p className="text-slate-500 text-center py-4">No warning items.</p> : 
                            warning.map(b => <ExpiryCard key={b.id} batch={b} type="warning" />)
                        }
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ExpiryManagement;
