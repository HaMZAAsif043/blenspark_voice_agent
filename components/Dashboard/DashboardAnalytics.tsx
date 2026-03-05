"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import StatCard from "./StatCard";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#359DAD", "#4A4A4A", "#8ec3cf", "#5ea4b6"];

export default function DashboardAnalytics() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        todayRevenue: 0,
        activeMenuItems: 0,
        totalCalls: 0,
        todayOrders: 0,
    });

    const [revenueData, setRevenueData] = useState<Array<{
        name: string;
        revenue: number;
        orders: number;
    }>>([]);
 const [salesData, setSalesData] = useState<Array<{
        name: string;
        value: number;
    }>>([]);
    useEffect(() => {
        const loadStats = async () => {
            try {
                const stats = await api.getStats()
                const revenueStat = await api.getRevenueStats()
                const salesDis = await api.getSalesDistribution()
setSalesData(salesDis.items_sold_history)
                // Transform API data to chart format
                const transformedData = revenueStat.last_7_days.map((item: {
                    date: string;
                    orders_count: number;
                    revenue: number;
                }) => ({
                    name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    revenue: item.revenue,
                    orders: item.orders_count
                }));

                setRevenueData(transformedData);
                setStats({
                    totalOrders: stats.total_orders,
                    totalRevenue: stats.total_revenue,
                    activeMenuItems: stats.total_menu_items,
                    totalCalls: stats.total_calls,
                    todayRevenue: stats.today_revenue,
                    todayOrders: stats.today_orders
                });
            } catch (error) {
                console.log(error)
            }
        };
        loadStats();
    }, []);

    const statCards = [
        {
            label: "Total Orders",
            value: stats.totalOrders.toString(),
            icon: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></>
        },
        {
            label: "Total Revenue",
            value: `PKR ${stats.totalRevenue.toLocaleString()}`,
            icon: <><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>
        },
        {
            label: "Menu Items",
            value: stats.activeMenuItems.toString(),
            icon: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></>
        },
        {
            label: "Total Calls",
            value: stats.totalCalls.toString(),
            icon: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></>
        },
        {
            label: "Today Revenue",
            value: `PKR ${stats.todayRevenue.toLocaleString()}`,
            icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>
        },
        {
            label: "Today Orders",
            value: stats.todayOrders.toString(),
            icon: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>
        }
    ];

    return (
        <div className="flex flex-col gap-10">
            {/* Top Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card, index) => (
                    <StatCard
                        key={index}
                        label={card.label}
                        value={card.value}
                        icon={card.icon}
                    />
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="glass rounded-3xl p-8 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-sage-900">Revenue Performance</h3>
                        <p className="text-sm text-sage-500">Weekly revenue trend vs actual orders.</p>
                    </div>
                    <div className="h-[300px] w-full">
                        {revenueData.length > 0 ? (
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
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-500"></div>
                            </div>
                        )}
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
                                    data={salesData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {salesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 32px rgba(31,38,135,0.07)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="hidden sm:flex flex-col gap-3 ml-4">
                            {salesData.map((item, i) => (
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

