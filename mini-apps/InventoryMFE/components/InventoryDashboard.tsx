
import React, { useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { BoxIcon, AlertCircleIcon, CurrencyDollarIcon, ArchiveIcon } from '../../../components/icons';
import StatCard from '../../WelcomeScreen/components/dashboard/StatCard';

const InventoryDashboard: React.FC = () => {
    const { items } = useInventory();

    const stats = useMemo(() => {
        let totalValue = 0;
        let lowStockCount = 0;
        let expiredCount = 0;
        let expiringSoonCount = 0;
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        items.forEach(item => {
            const totalStock = item.batches.reduce((acc, b) => acc + b.quantity, 0);
            totalValue += totalStock * item.unitCost;

            if (totalStock <= item.minLevel) lowStockCount++;

            item.batches.forEach(batch => {
                const expiry = new Date(batch.expiryDate);
                if (expiry < today) expiredCount++;
                else if (expiry <= thirtyDaysFromNow) expiringSoonCount++;
            });
        });

        return { totalValue, lowStockCount, expiredCount, expiringSoonCount };
    }, [items]);

    return (
        <div className="p-6 h-full flex flex-col gap-6">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Inventory Overview</h1>
                <div className="space-x-3">
                    <ReactRouterDOM.Link to="list" className="btn-neu">View All Items</ReactRouterDOM.Link>
                    <ReactRouterDOM.Link to="kits" className="btn-neu text-sky-600">Manage Kits</ReactRouterDOM.Link>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<CurrencyDollarIcon className="text-green-600" />}
                    title="Total Value"
                    value={`$${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subtitle="Current inventory asset value"
                    color="green"
                />
                <StatCard
                    icon={<BoxIcon className="text-blue-600" />}
                    title="Low Stock Items"
                    value={stats.lowStockCount.toString()}
                    subtitle="Items below minimum level"
                    color="blue"
                />
                <StatCard
                    icon={<AlertCircleIcon className="text-orange-600" />}
                    title="Expiring Soon"
                    value={stats.expiringSoonCount.toString()}
                    subtitle="Batches expiring in < 30 days"
                    color="orange"
                />
                <StatCard
                    icon={<ArchiveIcon className="text-red-600" />}
                    title="Expired Batches"
                    value={stats.expiredCount.toString()}
                    subtitle="Requires immediate disposal"
                    color="red"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                <div className="card-panel p-6 overflow-hidden flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Stock Alerts</h3>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                        {items.filter(i => i.batches.reduce((acc, b) => acc + b.quantity, 0) <= i.minLevel).map(item => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-lg">
                                <div>
                                    <p className="font-semibold text-red-900">{item.name}</p>
                                    <p className="text-xs text-red-700">Current: {item.batches.reduce((acc, b) => acc + b.quantity, 0)} {item.unit} (Min: {item.minLevel})</p>
                                </div>
                                <button className="text-xs font-bold text-red-600 hover:underline">Reorder</button>
                            </div>
                        ))}
                        {stats.lowStockCount === 0 && <p className="text-slate-500 text-center py-4">No stock alerts.</p>}
                    </div>
                </div>

                <div className="card-panel p-6 overflow-hidden flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Expiry Watch</h3>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                         {items.flatMap(item => item.batches.map(batch => ({ ...batch, itemName: item.name })))
                            .filter(b => new Date(b.expiryDate) < new Date(new Date().setDate(new Date().getDate() + 90)))
                            .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
                            .map(batch => {
                                const daysLeft = Math.ceil((new Date(batch.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                                const isExpired = daysLeft < 0;
                                const isCritical = daysLeft < 30;
                                const bgColor = isExpired ? 'bg-slate-200' : isCritical ? 'bg-red-50' : 'bg-yellow-50';
                                const textColor = isExpired ? 'text-slate-700' : isCritical ? 'text-red-800' : 'text-yellow-800';
                                
                                return (
                                    <div key={batch.id} className={`flex justify-between items-center p-3 rounded-lg ${bgColor}`}>
                                        <div>
                                            <p className={`font-semibold ${textColor}`}>{batch.itemName}</p>
                                            <p className={`text-xs opacity-80 ${textColor}`}>Lot: {batch.lotNumber} • {batch.location}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-bold ${textColor}`}>{new Date(batch.expiryDate).toLocaleDateString()}</p>
                                            <p className={`text-xs ${textColor}`}>{isExpired ? 'Expired' : `${daysLeft} days left`}</p>
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryDashboard;
