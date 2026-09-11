import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PERIODS = ['This Week', 'This Month', 'This Year'];

// The period filter is UI-only for now - the app doesn't yet log time-bucketed
// activity per student, only a live per-course progress snapshot, so there's
// no different real dataset to switch to per period. Wire it up once daily/
// weekly activity tracking exists on the backend.
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white rounded-2xl shadow-xl px-4 py-2.5 text-center min-w-[84px]">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-0.5 truncate">{label}</p>
                <p className="text-lg font-black text-primary">{payload[0].value}%</p>
            </div>
        );
    }
    return null;
};

const PerformanceOverviewCard = ({ data, title = 'Performance Overview' }) => {
    const [period, setPeriod] = useState('This Week');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div id="perf-overview-chart" className="relative rounded-[32px] p-6 overflow-hidden shadow-lg shadow-purple-900/20 bg-gradient-to-r from-[#4C1D95] via-[#51239E] to-[#4C1D95]">
            {/* A global light-mode rule (`html.light-mode .recharts-text { fill:
                #4b5563 !important }`, meant for charts on light backgrounds)
                would otherwise force these axis labels dark gray regardless of
                the inline fill set below - an #id selector is the simplest way
                to out-specificity that !important rule. */}
            <style dangerouslySetInnerHTML={{ __html: `
                #perf-overview-chart .recharts-text,
                #perf-overview-chart .recharts-cartesian-axis-tick-value tspan {
                    fill: #ffffff !important;
                }
            ` }} />
            <div className="relative flex items-center justify-between mb-6">
                {/* text-white here would normally get clobbered by a global
                    `.font-bold { color: #111827 !important }` light-mode rule -
                    same bug already fixed once on the Register page caption. */}
                <h3 className="text-lg font-bold text-white [.light-mode_&]:!text-white">{title}</h3>
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setDropdownOpen(o => !o)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-xs font-semibold text-white hover:bg-white/15 transition-colors"
                    >
                        {period}
                        <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl py-1 z-20">
                            {PERIODS.map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => { setPeriod(p); setDropdownOpen(false); }}
                                    className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-gray-50 ${p === period ? 'text-primary font-bold' : 'text-gray-600'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="relative h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="perfAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#E9D5FF" stopOpacity={0.7} />
                                <stop offset="55%" stopColor="#C4B5FD" stopOpacity={0.25} />
                                <stop offset="100%" stopColor="#C4B5FD" stopOpacity={0} />
                            </linearGradient>
                            <filter id="perfLineGlow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#E9D5FF" floodOpacity="0.65" />
                            </filter>
                        </defs>
                        <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="rgba(255,255,255,0.35)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#FFFFFF', fontSize: 11, fontWeight: 600 }}
                            dy={8}
                        />
                        <YAxis
                            domain={[0, 100]}
                            ticks={[0, 25, 50, 75, 100]}
                            tickFormatter={(v) => `${v}%`}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#FFFFFF', fontSize: 11, fontWeight: 600 }}
                            width={48}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E9D5FF', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#E9D5FF"
                            strokeWidth={3}
                            fill="url(#perfAreaGradient)"
                            style={{ filter: 'url(#perfLineGlow)' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PerformanceOverviewCard;
