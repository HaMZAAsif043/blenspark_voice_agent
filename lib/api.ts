const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}

export const api = {
    getOrders: () => fetchWithAuth("/orders/"),
    getMenu: () => fetchWithAuth("/menu/"),
    createMenuItem: (data: { name: string; cost: number; id?: string }) =>
        fetchWithAuth("/menu/", {
            method: "POST",
            body: JSON.stringify(data),
        }),
};
