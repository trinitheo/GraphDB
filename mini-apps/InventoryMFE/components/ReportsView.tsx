
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useInventory } from '../context/InventoryContext';
import { CurrencyDollarIcon, TrendIcon, ClockIcon, ArchiveIcon, DownloadIcon } from '../../../components/icons';

const ReportsView: React.FC = () => {
    const { items, usageLogs } = useInventory();
    const pieChartRef = useRef<HTMLCanvasElement>(null);
    const barChartRef = useRef<HTMLCanvasElement>(null);
    const lineChartRef = useRef<HTMLCanvasElement>(null);

    // Calculate stats
    const totalValue = items.reduce((sum, item) => sum + (item.unitCost * item.batches.reduce((q, b) => q + b.quantity, 0)), 0);
    const usedLast30 = usageLogs.filter(l => new Date(l.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && l.action === 'Used').length;
    const expiringSoon = items.flatMap(i => i.batches).filter(b => {
        const days = (new Date(b.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24);
        return days > 0 && days <= 30;
    }).length;
    const expired = items.flatMap(i => i.batches).filter(b => new Date(b.expiryDate) < new Date()).length;

    useEffect(() => {
        const charts: Chart[] = [];

        // Pie Chart: Value by Category
        if (pieChartRef.current) {
            const categories: Record<string, number> = {};
            items.forEach(item => {
                const val = item.unitCost * item.batches.reduce((q, b) => q + b.quantity, 0);
                categories[item.category] = (categories[item.category] || 0) + val;
            });

            charts.push(new Chart(pieChartRef.current, {
                type: 'pie',
                data: {
                    labels: Object.keys(categories),
                    datasets: [{
                        data: Object.values(categories),
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#6366f1']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { position: 'left' } }
                }
            }));
        }

        // Bar Chart: Value by Location
        if (barChartRef.current) {
            const locations: Record<string, number> = {};
            items.flatMap(i => i.batches.map(b => ({ ...b, val: b.quantity * i.unitCost }))).forEach(b => {
                locations[b.location] = (locations[b.location] || 0) + b.val;
            });

            charts.push(new Chart(barChartRef.current, {
                type: 'bar',
                data: {
                    labels: Object.keys(locations),
                    datasets: [{
                        label: 'Value ($)',
                        data: Object.values(locations),
                        backgroundColor: '#3b82f6'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } }
                }
            }));
        }

        // Line Chart: Usage Trend (Last 30 Days)
        if (lineChartRef.current) {
            const days = Array.from({ length: 30 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (29 - i));
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
            const data = days.map(() => Math.floor(Math.random() * 5)); // Mock data as real daily data might be sparse

            charts.push(new Chart(lineChartRef.current, {
                type: 'line',
                data: {
                    labels: days,
                    datasets: [{
                        label: 'Items Used',
                        data: data,
                        borderColor: '#10b981',
                        tension: 0.1,
                        pointRadius: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } },
                    plugins: { legend: { display: false } }
                }
            }));
        }

        return () => charts.forEach(c => c.destroy());
    }, [items, usageLogs]);

    const StatCard = ({ title, value, subtext, icon, color }: any) => (
        <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-400 mt-1">{subtext}</p>
            </div>
            <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        </div>
    );

    return (
        <div className="p-6 h-full overflow-y-auto">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
                    <p className="text-slate-500">Insights into inventory and usage patterns</p>
                </div>
                <button className="btn-neu bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2">
                    <DownloadIcon className="w-4 h-4" /> Export Report
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard 
                    title="Total Inventory Value" 
                    value={`$${totalValue.toFixed(2)}`} 
                    subtext="Current stock value" 
                    icon={<CurrencyDollarIcon className="w-5 h-5 text-green-600" />} 
                    color="bg-green-50" 
                />
                <StatCard 
                    title="Items Used (30d)" 
                    value={usedLast30.toString()} 
                    subtext="Total consumption" 
                    icon={<TrendIcon className="w-5 h-5 text-blue-600" />} 
                    color="bg-blue-50" 
                />
                <StatCard 
                    title="Expiring Soon" 
                    value={expiringSoon.toString()} 
                    subtext="Within 30 days" 
                    icon={<ClockIcon className="w-5 h-5 text-yellow-600" />} 
                    color="bg-yellow-50" 
                />
                <StatCard 
                    title="Expired Items" 
                    value={expired.toString()} 
                    subtext="Value: $0.00" 
                    icon={<ArchiveIcon className="w-5 h-5 text-red-600" />} 
                    color="bg-red-50" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="card-panel p-6">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4">Inventory Value by Category</h3>
                    <div className="h-64 flex justify-center">
                        <canvas ref={pieChartRef}></canvas>
                    </div>
                </div>
                <div className="card-panel p-6">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4">Inventory Value by Location</h3>
                    <div className="h-64">
                        <canvas ref={barChartRef}></canvas>
                    </div>
                </div>
            </div>

            <div className="card-panel p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-slate-800">Usage Trend</h3>
                    <select className="bg-slate-100 border-none text-xs rounded p-1">
                        <option>Last 30 days</option>
                    </select>
                </div>
                <div className="h-64 w-full">
                    <canvas ref={lineChartRef}></canvas>
                </div>
            </div>
        </div>
    );
};

export default ReportsView;
