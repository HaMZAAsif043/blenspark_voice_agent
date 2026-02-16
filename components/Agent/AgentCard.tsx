"use client";

import { useConversation } from "@elevenlabs/react";
import { useCallback, useState } from "react";
import VoiceVisualizer from "./VoiceVisualizer";

interface AgentCardProps {
    agentId: string;
}

export default function AgentCard({ agentId }: AgentCardProps) {
    const [isConnecting, setIsConnecting] = useState(false);

    const conversation = useConversation({
        onConnect: () => {
            console.log("Connected to ElevenLabs");
            setIsConnecting(false);
        },
        onDisconnect: () => {
            console.log("Disconnected from ElevenLabs");
        },
        onError: (error) => {
            console.error("ElevenLabs Error:", error);
            setIsConnecting(false);
        },
    });

    const { status, isSpeaking, startSession, endSession, getOutputByteFrequencyData } = conversation;

    const handleToggleConversation = useCallback(async () => {
        if (status === "connected") {
            await endSession();
        } else {
            setIsConnecting(true);
            try {
                // Request microphone access
                await navigator.mediaDevices.getUserMedia({ audio: true });
                console.log(agentId)
                await startSession({
                    agentId: agentId,
                    connectionType: "webrtc",
                });
                console.log(agentId)

            } catch (error) {
                console.error("Failed to start session:", error);
                setIsConnecting(false);
            }
        }
    }, [status, agentId, startSession, endSession]);

    const isConnected = status === "connected";

    return (
        <div className="glass w-full max-w-md rounded-3xl p-8 transition-all duration-500 hover:shadow-2xl">
            <div className="mb-8 flex flex-col items-center text-center">
                <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sage-50 text-sage-500 ${isConnected ? 'animate-pulse-soft' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-sage-900">BlenSpark Voice Assistant</h2>
                <p className="mt-2 text-sage-600">
                    {isConnected ? "Listening for your voice..." : "Ready to assist you today."}
                </p>
            </div>

            <VoiceVisualizer
                isSpeaking={isSpeaking || isConnected}
                getByteFrequencyData={getOutputByteFrequencyData}
            />

            <div className="mt-8 flex flex-col gap-4">
                <button
                    onClick={handleToggleConversation}
                    disabled={isConnecting}
                    className={`flex h-14 w-full items-center justify-center rounded-2xl font-semibold transition-all duration-300 ${isConnected
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "sage-gradient text-white shadow-lg hover:shadow-sage-200"
                        } disabled:opacity-50`}
                >
                    {isConnecting ? (
                        <span className="flex items-center gap-2">
                            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Connecting...
                        </span>
                    ) : isConnected ? (
                        "End Session"
                    ) : (
                        "Start Conversation"
                    )}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs font-medium text-sage-400">
                    <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-sage-500' : 'bg-slate-300'}`}></div>
                    {status.toUpperCase()}
                </div>
            </div>
        </div>
    );
}
