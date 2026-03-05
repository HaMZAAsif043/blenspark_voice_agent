const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";

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

    // 204 No Content — nothing to parse
    if (response.status === 204 || response.headers.get("content-length") === "0") {
        return undefined;
    }

    return response.json();
}

export const api = {
    getOrders: () => fetchWithAuth("/orders/"),
    getMenu: () => fetchWithAuth("/menu/"),
  getStats: () => fetchWithAuth('/order_stats/'),
  getRevenueStats: () => fetchWithAuth('/Revenue_Performance/'),
  getSalesDistribution: () => fetchWithAuth('/Sales_Distribution/'),
    createMenuItem: (data: { name: string; cost: number; id?: string }) =>
        fetchWithAuth("/menu/", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    // ── Calls ─────────────────────────────────────────────────────────────────
    getCalls: () => fetchWithAuth("/calls/"),
    getCallStatus: (conversationId: string) => fetchWithAuth(`/calls/status/${conversationId}/`),

    // ── Appointments ─────────────────────────────────────────────────────────
    getAppointments: () => fetchWithAuth("/appointment/all/"),

    // ── Appointment Schedules ────────────────────────────────────────────────
    getSchedules: () =>
        fetchWithAuth("/appointment/schedule/"),

    createSchedule: (data: import("@/types/schedule").SchedulePayload) =>
        fetchWithAuth("/appointment/schedule/", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    updateSchedule: (id: number, data: import("@/types/schedule").SchedulePayload) =>
        fetchWithAuth(`/appointment/schedule/`, {
            method: "PATCH",
            body: JSON.stringify(data),
        }),

    deleteSchedule: (id: number) =>
        fetchWithAuth(`/appointment/schedule/${id}/`, {
            method: "DELETE",
        }),
};
