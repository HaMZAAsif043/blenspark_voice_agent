"use client";

import { useState } from "react";
import OrdersTable from "@/components/Dashboard/OrdersTable";
import MenuManager from "@/components/Dashboard/MenuManager";
import DashboardAnalytics from "@/components/Dashboard/DashboardAnalytics";

type TabType = "analytics" | "menu" | "orders";

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<TabType>("analytics");

    return (
        <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end border-b border-sage-100 pb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-sage-900 sm:text-4xl uppercase tracking-tighter">BlenSpark Hub</h1>
                    <p className="mt-2 text-sage-600 font-medium">Precision restaurant management powered by AI.</p>
                </div>

                <div className="flex rounded-2xl bg-sage-100/50 p-1.5 ring-1 ring-sage-200/50">
                    <TabButton
                        active={activeTab === "analytics"}
                        onClick={() => setActiveTab("analytics")}
                        label="Analytics"
                    />
                    <TabButton
                        active={activeTab === "menu"}
                        onClick={() => setActiveTab("menu")}
                        label="Menu"
                    />
                    <TabButton
                        active={activeTab === "orders"}
                        onClick={() => setActiveTab("orders")}
                        label="Orders"
                    />
                </div>
            </div>

            <div className="relative min-h-[500px]">
                {activeTab === "analytics" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <DashboardAnalytics />
                    </div>
                )}

                {activeTab === "menu" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <MenuManager />
                    </div>
                )}

                {activeTab === "orders" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <OrdersTable />
                    </div>
                )}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-2.5 text-sm font-bold transition-all cursor-pointer duration-300 rounded-xl ${active
                ? "bg-white text-sage-900 shadow-sm"
                : "text-sage-500 hover:text-sage-700"
                }`}
        >
            {label}
        </button>
    );
}
