"use client";

import type { Order } from "@/types/order";

interface OrderDetailsModalProps {
    isOpen: boolean;
    order: Order | null;
    onClose: () => void;
}

export default function OrderDetailsModal({ isOpen, order, onClose }: OrderDetailsModalProps) {
    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-8 py-6 border-b border-sage-100 bg-sage-50/30">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-sage-900">Order Details</h3>
                        <button
                            onClick={onClose}
                            className="text-sage-400 cursor-pointer hover:text-sage-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="px-8 py-6 space-y-6">
                    {/* Customer Information */}
                    <div>
                        <h4 className="text-sm font-semibold text-sage-500 uppercase tracking-wider mb-3">Customer Information</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sage-600">Name:</span>
                                <span className="font-medium text-sage-900">{order.customer_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sage-600">Phone:</span>
                                <span className="font-medium text-sage-900">{order.phone_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sage-600">Order ID:</span>
                                <span className="font-medium text-sage-900">#{order.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sage-600">Created:</span>
                                <span className="font-medium text-sage-900">
                                    {new Date(order.created_at).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div>
                        <h4 className="text-sm font-semibold text-sage-500 uppercase tracking-wider mb-3">Delivery Address</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sage-600">Address:</span>
                                <span className="font-medium text-sage-900 text-right">{order.address}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sage-600">Landmark:</span>
                                <span className="font-medium text-sage-900 text-right">{order.landmark}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h4 className="text-sm font-semibold text-sage-500 uppercase tracking-wider mb-3">Order Items</h4>
                        <div className="space-y-3">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-sage-50/50 rounded-xl">
                                    <div className="flex-1">
                                        <p className="font-medium text-sage-900">{item.name}</p>
                                        <p className="text-sm text-sage-600">Quantity: {item.qty}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-sage-900">PKR {(item?.price || item?.cost)}</p>
                                        <p className="text-sm text-sage-600">PKR {((item?.price || item?.cost) * item?.qty)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="pt-4 border-t border-sage-100">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-sage-900">Total Price:</span>
                            <span className="text-2xl font-bold text-sage-900">PKR {order.total_price.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Status */}
                    {order.status && (
                        <div className="flex items-center justify-between p-4 bg-sage-50/50 rounded-xl">
                            <span className="text-sage-600">Status:</span>
                            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                order.status === "Completed"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-amber-100 text-amber-700"
                            }`}>
                                {order.status}
                            </span>
                        </div>
                    )}
                </div>

                <div className="px-8 py-4 border-t border-sage-100 cursor-pointer bg-sage-50/30">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 cursor-pointer bg-sage-600 text-white rounded-xl hover:bg-sage-700 transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
