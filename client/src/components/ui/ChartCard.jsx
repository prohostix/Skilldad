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

const ChartCard = ({ title, subtitle, data, type = 'line', dataKey = 'value', color = '#5B5CFF', noCard = false, className = '' }) => {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // Custom tooltip with clean light/dark theme
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-[#0E0B1A] border border-slate-200 dark:border-white/15 rounded-xl p-3 shadow-xl">
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium font-inter mb-0.5">{payload[0].payload.name}</p>
                    <p className="text-slate-900 dark:text-white text-base font-bold font-inter">{payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    const COLORS = ['#5B5CFF', '#7A5CFF', '#B05CFF', '#C026FF'];

    const renderChart = () => {
        const xAxisProps = {
            dataKey: "name",
            axisLine: false,
            tickLine: false,
            tick: { fill: '#94a3b8', fontSize: window.innerWidth < 640 ? 9 : 11, fontFamily: 'Inter, sans-serif' },
            dy: 8
        };

        const yAxisProps = {
            axisLine: false,
            tickLine: false,
            tick: { fill: '#94a3b8', fontSize: window.innerWidth < 640 ? 9 : 11, fontFamily: 'Inter, sans-serif' },
            width: window.innerWidth < 640 ? 32 : 42
        };

        const chartMargin = {
            top: 10,
            right: 10,
            left: window.innerWidth < 640 ? -4 : -8,
            bottom: 10
        };

        switch (type) {
            case 'line':
                return (
                    <LineChart data={data} margin={chartMargin}>
                        <defs>
                            <linearGradient id="alyraLineGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#5B5CFF" />
                                <stop offset="50%" stopColor="#7A5CFF" />
                                <stop offset="100%" stopColor="#B05CFF" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                        <XAxis {...xAxisProps} />
                        <YAxis {...yAxisProps} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey={dataKey} stroke="url(#alyraLineGradient)" strokeWidth={2.5} dot={{ fill: '#5B5CFF', strokeWidth: 2, r: 3.5, stroke: '#ffffff' }} activeDot={{ r: 5, strokeWidth: 0, fill: '#B05CFF' }} />
                    </LineChart>
                );
            case 'bar':
                return (
                    <BarChart data={data} margin={chartMargin}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                        <XAxis {...xAxisProps} />
                        <YAxis {...yAxisProps} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
                        <Bar dataKey={dataKey} radius={[6, 6, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                );
            case 'area':
            default:
                return (
                    <AreaChart data={data} margin={chartMargin}>
                        <defs>
                            <linearGradient id="alyraAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#5B5CFF" stopOpacity={0.25} />
                                <stop offset="50%" stopColor="#7A5CFF" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#B05CFF" stopOpacity={0.01} />
                            </linearGradient>
                            <linearGradient id="alyraStrokeGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#5B5CFF" />
                                <stop offset="50%" stopColor="#7A5CFF" />
                                <stop offset="100%" stopColor="#B05CFF" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                        <XAxis {...xAxisProps} />
                        <YAxis {...yAxisProps} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey={dataKey} stroke="url(#alyraStrokeGradient)" fillOpacity={1} fill="url(#alyraAreaGradient)" strokeWidth={2.5} />
                    </AreaChart>
                );
        }
    };

    if (noCard) {
        return (
            <div className={`w-full h-full relative min-h-[220px] ${className}`}>
                {isMounted ? (
                    <ResponsiveContainer width="99%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-white/5 animate-pulse rounded-xl" />
                )}
            </div>
        );
    }

    return (
        <div className={`bg-white/95 dark:bg-[#0E0B1A]/80 border border-slate-200/80 dark:border-white/10 rounded-xl p-4 sm:p-5 shadow-sm ${className}`}>
            {(title || subtitle) && (
                <div className="mb-4">
                    {title && <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-inter">{title}</h3>}
                    {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-inter">{subtitle}</p>}
                </div>
            )}
            <div className="h-[220px] sm:h-[300px] w-full relative min-h-[220px]">
                {isMounted ? (
                    <ResponsiveContainer width="99%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-white/5 animate-pulse rounded-xl" />
                )}
            </div>
        </div>
    );
};

export default ChartCard;
