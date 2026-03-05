"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Call {
    id: number;
    conversation_id: string;
    call_type: string;
    status: string;
    transcript: string | null;
    duration_seconds: number | null;
    metadata: Record<string, unknown>;
    created_at: string;
}

interface CallDetail extends Call {}

function formatDuration(seconds: number | null) {
    if (seconds == null) return "—";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
}

function formatDateTime(iso: string) {
    const d = new Date(iso);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const date = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    const hours = d.getHours();
    const mins = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    return `${date}, ${displayHour}:${mins} ${ampm}`;
}

function StatusBadge({ status }: { status: string }) {
    const s = status.toLowerCase();
    let classes = "bg-amber-100 text-amber-600";
    if (s === "completed" || s === "done") classes = "bg-green-100 text-green-600";
    else if (s === "failed" || s === "error") classes = "bg-red-100 text-red-600";
    else if (s === "active" || s === "in_progress" || s === "ongoing") classes = "bg-sage-100 text-sage-600";
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${classes}`}>
            {status.replace(/_/g, " ")}
        </span>
    );
}

function TranscriptModal({ call, onClose }: { call: CallDetail; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="glass relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-sage-100 bg-white/60 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-sage-900">Call Transcript</h2>
                        <p className="text-xs text-sage-400 mt-0.5 font-mono break-all">{call.conversation_id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-sage-400 hover:text-sage-700 transition-colors mt-1 flex-shrink-0"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Meta row */}
                <div className="px-8 py-4 bg-white/40 border-b border-sage-50 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                        <span className="text-sage-400 font-medium">Type</span>
                        <span className="capitalize text-sage-800 font-semibold">{call.call_type}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-sage-400 font-medium">Status</span>
                        <StatusBadge status={call.status} />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-sage-400 font-medium">Duration</span>
                        <span className="text-sage-800 font-semibold">{formatDuration(call.duration_seconds)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-sage-400 font-medium">Date</span>
                        <span className="text-sage-800 font-semibold">{formatDateTime(call.created_at)}</span>
                    </div>
                </div>

                {/* Transcript */}
                <div className="px-8 py-6 max-h-[420px] overflow-y-auto">
                    {call.transcript ? (
                        <pre className="whitespace-pre-wrap text-sm text-sage-700 font-sans leading-relaxed">
                            {call.transcript}
                        </pre>
                    ) : (
                        <p className="text-sage-400 text-sm italic text-center py-8">No transcript available for this call.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function CallsTable() {
    const [calls, setCalls] = useState<Call[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCall, setSelectedCall] = useState<CallDetail | null>(null);
    const [loadingId, setLoadingId] = useState<number | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await api.getCalls();
                // support both array response and {data: [...]} envelope
                setCalls(Array.isArray(data) ? data : (data.data ?? data.results ?? []));
            } catch (err) {
                console.error("Failed to load calls:", err);
                setError("Failed to load calls. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const handleViewTranscript = async (call: Call) => {
        setLoadingId(call.id);
        try {
            const detail = await api.getCallStatus(call.conversation_id);
            // getCallStatus may return the object directly or wrapped
            setSelectedCall(detail?.data ?? detail);
        } catch {
            // Fallback: show data we already have
            setSelectedCall(call);
        } finally {
            setLoadingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass overflow-hidden rounded-3xl shadow-sm border border-sage-100/50 px-8 py-12 text-center">
                <p className="text-sage-500 font-medium">{error}</p>
            </div>
        );
    }

    return (
        <>
            <div className="glass overflow-hidden rounded-3xl shadow-sm border border-sage-100/50">
                <div className="px-8 py-6 border-b border-sage-100 bg-white/50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-sage-900">Call Logs</h3>
                        <p className="text-sm text-sage-500 mt-1">All voice agent calls and their transcripts.</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-sage-100 px-3 py-1 text-sm font-semibold text-sage-600">
                        {calls.length} total
                    </span>
                </div>

                {calls.length === 0 ? (
                    <div className="px-8 py-16 text-center text-sage-400 font-medium">
                        No call records found.
                    </div>
                ) : (
                    <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-sage-50/30 text-xs font-bold uppercase tracking-wider text-sage-500 sticky top-0 z-10 backdrop-blur-sm">
                                <tr>
                                    <th className="px-6 py-4 w-16 text-center">#</th>
                                    <th className="px-6 py-4">Conversation ID</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Duration</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-center">Transcript</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sage-50">
                                {calls.map((call, index) => (
                                    <tr key={call.id} className="hover:bg-sage-50/50 transition-colors">
                                        <td className="px-6 py-4 text-center text-sm font-medium text-sage-400">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs text-sage-500 truncate max-w-[180px] block">
                                                {call.conversation_id || "—"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm capitalize text-sage-700 font-medium">
                                            {call.call_type || "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={call.status} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-sage-700 font-medium whitespace-nowrap">
                                            {formatDuration(call.duration_seconds)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-sage-600 whitespace-nowrap">
                                            {formatDateTime(call.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleViewTranscript(call)}
                                                disabled={loadingId === call.id}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sage-700 bg-sage-100 rounded-lg hover:bg-sage-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                                            >
                                                {loadingId === call.id ? (
                                                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-sage-300 border-t-sage-600 inline-block" />
                                                ) : null}
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedCall && (
                <TranscriptModal call={selectedCall} onClose={() => setSelectedCall(null)} />
            )}
        </>
    );
}
