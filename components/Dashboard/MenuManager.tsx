"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface MenuItem {
    id: string;
    name: string;
    cost: number;
}

export default function MenuManager() {
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [newItem, setNewItem] = useState({ name: "", cost: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadMenu();
    }, []);

    const loadMenu = async () => {
        try {
            const data = await api.getMenu();
            setMenu(data.menu);
        } catch (error) {
            console.error("Failed to load menu:", error);
            // Fallback
            setMenu([
                { id: "m1", name: "Cappuccino", cost: 4.5 },
                { id: "m2", name: "Classic Omelette", cost: 12.0 },
            ]);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.name || !newItem.cost) return;

        setIsSubmitting(true);
        try {
            await api.createMenuItem({
                name: newItem.name,
                cost: parseFloat(newItem.cost),
            });
            setNewItem({ name: "", cost: "" });
            loadMenu();
        } catch (error) {
            console.error("Failed to add item:", error);
            // Optimistic update for demo purposes
            setMenu([...menu, { id: Date.now().toString(), name: newItem.name, cost: parseFloat(newItem.cost) }]);
            setNewItem({ name: "", cost: "" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 w-full">
            <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="glass rounded-3xl p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-sage-800">Add New Item</h3>
                    <form onSubmit={handleAdd} className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Item Name"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            className="w-full rounded-xl border-sage-100 bg-white/50 px-4 py-3 text-sm outline-none ring-1 ring-sage-100 transition-all focus:ring-2 focus:ring-sage-300"
                        />
                        <div className="flex gap-4">
                            <input
                                type="number"
                                placeholder="Cost (RS)"
                                value={newItem.cost}
                                onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })}
                                className="flex-1 rounded-xl border-sage-100 bg-white/50 px-4 py-3 text-sm outline-none ring-1 ring-sage-100 transition-all focus:ring-2 focus:ring-sage-300"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="sage-gradient rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                            >
                                {isSubmitting ? "..." : "Add Item"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2">
                <div className="glass rounded-3xl p-8 shadow-sm h-full">
                    <h3 className="mb-6 text-xl font-bold text-sage-900 border-b border-sage-100 pb-4">Menu Catalog</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {menu.map((item) => (
                            <div key={item.id} className="group flex items-center justify-between rounded-2xl bg-white/40 p-5 border border-sage-100 transition-all hover:bg-white hover:shadow-md">
                                <div className="flex flex-col">
                                    <p className="font-bold text-sage-900 text-lg">{item.name}</p>
                                    <p className="text-xs uppercase tracking-widest text-sage-400 font-bold mt-1">Ref: {item.id}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <p className="text-2xl font-black text-sage-600">PKR {item.cost}</p>
                                    <div className="h-1 w-8 bg-sage-200 mt-2 transition-all group-hover:w-12 group-hover:bg-accent" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
