import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import GlassCard from '../ui/GlassCard';

const ChartCard = ({ title, subtitle, data, type = 'line', dataKey = 'value', color = '#5B5CFF' }) => {
    // Custom tooltip with Alyra dark theme
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background-mid/90 backdrop-blur-xl border border-primary/30 rounded-2xl p-4 shadow-glow-purple">
                    <p className="text-text-secondary text-xs font-bold uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                    <p className="text-text-primary text-lg font-black">{payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    const COLORS = ['#5B5CFF', '#7A5CFF', '#B05CFF', '#C026FF'];

    const renderChart = () => {
        switch (type) {
            case 'line':
                return (
                    <LineChart data={data}>
                        <defs>
                            <linearGradient id="alyraLineGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#5B5CFF" />
                                <stop offset="50%" stopColor="#7A5CFF" />
                                <stop offset="100%" stopColor="#B05CFF" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6E72A5', fontSize: 12, fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6E72A5', fontSize: 12, fontWeight: 600 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey={dataKey} stroke="url(#alyraLineGradient)" strokeWidth={3} dot={{ fill: '#5B5CFF', strokeWidth: 2, r: 4, stroke: '#020005' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#B05CFF', filter: 'drop-shadow(0 0 8px rgba(176,92,255,0.6))' }} />
                    </LineChart>
                );
            case 'bar':
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6E72A5', fontSize: 12, fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6E72A5', fontSize: 12, fontWeight: 600 }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Bar dataKey={dataKey} radius={[10, 10, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                );
            case 'area':
            default:
                return (
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="alyraAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#5B5CFF" stopOpacity={0.4} />
                                <stop offset="50%" stopColor="#7A5CFF" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#B05CFF" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="alyraStrokeGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#5B5CFF" />
                                <stop offset="50%" stopColor="#7A5CFF" />
                                <stop offset="100%" stopColor="#B05CFF" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6E72A5', fontSize: 12, fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6E72A5', fontSize: 12, fontWeight: 600 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey={dataKey} stroke="url(#alyraStrokeGradient)" fillOpacity={1} fill="url(#alyraAreaGradient)" strokeWidth={3} />
                    </AreaChart>
                );
        }
    };

    return (
        <GlassCard>
            <div className="mb-6">
                <h3 className="text-lg font-bold text-text-primary font-poppins">{title}</h3>
                {subtitle && <p className="text-xs text-text-muted mt-1 font-inter">{subtitle}</p>}
            </div>
            <div className="h-[300px] w-full" style={{ minWidth: '300px', minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        </GlassCard>
    );
};

export default ChartCard;
