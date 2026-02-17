"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import OrderDetailsModal from "./OrderDetailsModal";
import type { Order } from "@/types/order";

export default function OrdersTable() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const data = await api.getOrders();
                setOrders(data.orders);
            } catch (error) {
                console.error("Failed to load orders:", error);
                // // Fallback for demonstration
                // setOrders([
                //     { id: "1", customer_name: "John Doe", items: "Espresso, Croissant", total_price: 12.5, status: "Pending", created_at: new Date().toISOString() },
                //     { id: "2", customer_name: "Jane Smith", items: "Latte, Avocado Toast", total_price: 18.0, status: "Completed", created_at: new Date().toISOString() },
                // ]);
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
            <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                <table className="w-full text-left min-w-[900px] table-fixed">
                    <thead className="bg-sage-50/30 text-xs font-bold uppercase tracking-wider text-sage-500 sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            <th className="px-6 py-4 w-20 text-center">#</th>
                            <th className="px-6 py-4 w-48">Customer</th>
                            <th className="px-6 py-4 w-32">Status</th>
                            <th className="px-6 py-4 w-32 text-right">Cost</th>
                            <th className="px-6 py-4 w-40">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-sage-50">
                        {orders.map((order, index) => (
                            <tr key={order.id} className="hover:bg-sage-50/50 transition-colors">
                                <td className="px-6 py-4 text-center text-sm font-medium text-sage-500">{index + 1}</td>
                                <td className="px-6 py-4 font-medium text-sage-900 truncate">{order.customer_name}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${order.status === "Completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                        }`}>
                                        {order.status || "Pending"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-sage-900">PKR {order?.total_price}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleViewDetails(order)}
                                        className="inline-flex cursor-pointer items-center px-3 py-1.5 text-xs font-medium text-sage-700 bg-sage-100 rounded-lg hover:bg-sage-200 transition-colors whitespace-nowrap"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <OrderDetailsModal
                isOpen={isModalOpen}
                order={selectedOrder}
                onClose={closeModal}
            />
        </div>
    );
}
