"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from "recharts";
import { revenueData, categoryData } from "@/lib/mockData";

const COLORS = ["#359DAD", "#4A4A4A", "#8ec3cf", "#5ea4b6"];

export default function DashboardAnalytics() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        activeMenuItems: 0,
        customerSatisfaction: 98,
    });

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [orders, menu] = await Promise.all([api.getOrders(), api.getMenu()]);
                const revenue = orders.reduce((acc: number, curr: any) => acc + curr.total_cost, 0);
                setStats({
                    totalOrders: orders.length,
                    totalRevenue: revenue,
                    activeMenuItems: menu.length,
                    customerSatisfaction: 98,
                });
            } catch (error) {
                setStats({
                    totalOrders: 124,
                    totalRevenue: 1540.50,
                    activeMenuItems: 12,
                    customerSatisfaction: 98,
                });
            }
        };
        loadStats();
    }, []);

    return (
        <div className="flex flex-col gap-10">
            {/* Top Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Orders"
                    value={stats.totalOrders.toString()}
                    icon={<><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></>}
                />
                <StatCard
                    label="Revenue"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    icon={<><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>}
                />
                <StatCard
                    label="Menu Items"
                    value={stats.activeMenuItems.toString()}
                    icon={<><path d="M3 3v18h18" /><path d="M7 12V7h5v5H7Z" /><path d="M14 17h5v-5h-5v5Z" /></>}
                />
                <StatCard
                    label="Satisfaction"
                    value={`${stats.customerSatisfaction}%`}
                    icon={<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="glass rounded-3xl p-8 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-sage-900">Revenue Performance</h3>
                        <p className="text-sm text-sage-500">Weekly revenue trend vs actual orders.</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#359DAD" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#359DAD" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f7f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#359DAD', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#359DAD', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 32px rgba(53,157,173,0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#359DAD"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#4A4A4A"
                                    strokeWidth={2}
                                    fillOpacity={0}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass rounded-3xl p-8 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-sage-900">Sales Distribution</h3>
                        <p className="text-sm text-sage-500">Top selling categories by volume.</p>
                    </div>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 32px rgba(31,38,135,0.07)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="hidden sm:flex flex-col gap-3 ml-4">
                            {categoryData.map((item, i) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-sm font-medium text-sage-700">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="glass flex items-center gap-4 rounded-3xl p-6 shadow-sm transition-transform hover:scale-[1.02]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-100 text-sage-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {icon}
                </svg>
            </div>
            <div>
                <p className="text-sm font-medium text-sage-500">{label}</p>
                <p className="text-2xl font-bold text-sage-900">{value}</p>
            </div>
        </div>
    );
}
