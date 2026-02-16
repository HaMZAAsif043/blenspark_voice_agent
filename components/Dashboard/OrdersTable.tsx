"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Order {
    id: string;
    customer_name: string;
    items: string;
    total_cost: number;
    status: string;
    created_at: string;
}

export default function OrdersTable() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const data = await api.getOrders();
                setOrders(data);
            } catch (error) {
                console.error("Failed to load orders:", error);
                // Fallback for demonstration
                setOrders([
                    { id: "1", customer_name: "John Doe", items: "Espresso, Croissant", total_cost: 12.5, status: "Pending", created_at: new Date().toISOString() },
                    { id: "2", customer_name: "Jane Smith", items: "Latte, Avocado Toast", total_cost: 18.0, status: "Completed", created_at: new Date().toISOString() },
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        loadOrders();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-500"></div>
            </div>
        );
    }

    return (
        <div className="glass overflow-hidden rounded-3xl shadow-sm border border-sage-100/50">
            <div className="px-8 py-6 border-b border-sage-100 bg-white/50">
                <h3 className="text-xl font-bold text-sage-900">Order History</h3>
                <p className="text-sm text-sage-500 mt-1">Manage and track all customer interactions.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-sage-50/30 text-xs font-bold uppercase tracking-wider text-sage-500">
                        <tr>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Items</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Cost</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-sage-50">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-sage-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-sage-900">{order.customer_name}</td>
                                <td className="px-6 py-4 text-sm text-sage-600">{order.items}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${order.status === "Completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-sage-900">${order.total_cost.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
