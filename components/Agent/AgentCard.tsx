"use client";

// import { useConversation } from "@elevenlabs/react";
import { useCallback, useEffect, useRef, useState } from "react";
import VoiceVisualizer from "./VoiceVisualizer";

// interface AgentCardProps {
//     agentId: string;
// }

export default function AgentCard() {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const frequencyDataRef = useRef<Uint8Array>(new Uint8Array(0));
    const sessionReadyRef = useRef(false);
    const sendEveryMsRef = useRef(60);
    const nextSendAtRef = useRef(0);
    const nextPlayTimeRef = useRef(0);
    const activePlaybackCountRef = useRef(0);
    // Serialize audio chunk scheduling: each incoming chunk is chained onto
    // this promise so chunks are decoded and scheduled in arrival order even
    // if decodeAudioData() calls resolve out of order.
    const audioQueueRef = useRef<Promise<void>>(Promise.resolve());

    // /* ElevenLabs Code - Commented Out
    // const conversation = useConversation({
    //     onConnect: () => {
    //         console.log("Connected to ElevenLabs");
    //         setIsConnecting(false);
    //     },
    //     onDisconnect: () => {
    //         console.log("Disconnected from ElevenLabs");
    //     },
    //     onError: (error) => {
    //         console.error("ElevenLabs Error:", error);
    //         setIsConnecting(false);
    //     },
    // });

    // const { status, isSpeaking, startSession, endSession, getOutputByteFrequencyData } = conversation;
    // */

    const getOutputByteFrequencyData = () => frequencyDataRef.current;

    const cleanupConnection = useCallback(async () => {
        sessionReadyRef.current = false;

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current.onaudioprocess = null;
            processorRef.current = null;
        }

        if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null;
        }

        if (audioContextRef.current) {
            await audioContextRef.current.close();
            audioContextRef.current = null;
        }

        nextPlayTimeRef.current = 0;
        activePlaybackCountRef.current = 0;
        audioQueueRef.current = Promise.resolve();
        frequencyDataRef.current = new Uint8Array(0);

        setIsSpeaking(false);
        setIsConnected(false);
        setIsConnecting(false);
    }, []);

    const scheduleAudioChunk = useCallback(async (chunk: ArrayBuffer) => {
        const audioContext = audioContextRef.current;
        if (!audioContext) {
            return;
        }

        try {
            let audioBuffer: AudioBuffer;

            // Check if this is WAV-wrapped (starts with RIFF header)
            const isWav = chunk.byteLength > 4 &&
                new Uint8Array(chunk, 0, 4).every((v, i) => "RIFF".charCodeAt(i) === v);

            if (isWav) {
                // Use decodeAudioData for WAV files
                audioBuffer = await audioContext.decodeAudioData(chunk.slice(0));
            } else {
                // Handle raw 16-bit PCM data (16 kHz, mono)
                const pcmData = new Int16Array(chunk);
                const samples = pcmData.length;
                
                audioBuffer = audioContext.createBuffer(1, samples, 16000);

                const channelData = audioBuffer.getChannelData(0);
                for (let i = 0; i < samples; i++) {
                    channelData[i] = pcmData[i] / 32768.0; // Convert to [-1, 1] range
                }
            }

            const playbackNode = audioContext.createBufferSource();
            playbackNode.buffer = audioBuffer;
            playbackNode.connect(audioContext.destination);

            const now = audioContext.currentTime;
            if (nextPlayTimeRef.current < now) {
                nextPlayTimeRef.current = now;
            }

            const startAt = nextPlayTimeRef.current;
            playbackNode.start(startAt);
            nextPlayTimeRef.current = startAt + audioBuffer.duration;

            activePlaybackCountRef.current += 1;
            setIsSpeaking(true);

            playbackNode.onended = () => {
                activePlaybackCountRef.current = Math.max(0, activePlaybackCountRef.current - 1);
                if (activePlaybackCountRef.current === 0) {
                    setIsSpeaking(false);
                }
            };
        } catch (error) {
            console.error("Failed to decode/play audio chunk:", error);
            if (activePlaybackCountRef.current === 0) {
                setIsSpeaking(false);
            }
        }
    }, []);

    useEffect(() => {
        return () => {
            void cleanupConnection();
        };
    }, [cleanupConnection]);

    const handleToggleConversation = useCallback(async () => {
        if (isConnected) {
            await cleanupConnection();
        } else {
            setIsConnecting(true);
            try {
                sessionReadyRef.current = false;
                nextSendAtRef.current = 0;
                nextPlayTimeRef.current = 0;
                activePlaybackCountRef.current = 0;

                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaStreamRef.current = stream;

                const AudioContextCtor =
                    window.AudioContext ||
                    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

                if (!AudioContextCtor) {
                    throw new Error("AudioContext is not supported in this browser.");
                }

                let audioContext: AudioContext;
                try {
                    audioContext = new AudioContextCtor({ sampleRate: 16000 });
                } catch {
                    audioContext = new AudioContextCtor();
                }

                audioContextRef.current = audioContext;
                const source = audioContext.createMediaStreamSource(stream);
                sourceNodeRef.current = source;
                const processor = audioContext.createScriptProcessor(4096, 1, 1);
                processorRef.current = processor;

                processor.onaudioprocess = (event: AudioProcessingEvent) => {
                    const inputData = event.inputBuffer.getChannelData(0);

                    frequencyDataRef.current = new Uint8Array(inputData.length);
                    for (let i = 0; i < inputData.length; i++) {
                        frequencyDataRef.current[i] = Math.max(0, Math.min(255, (inputData[i] + 1) * 127));
                    }

                    const ws = wsRef.current;
                    const canSendNow =
                        !!ws &&
                        ws.readyState === WebSocket.OPEN &&
                        sessionReadyRef.current &&
                        performance.now() >= nextSendAtRef.current;

                    if (!canSendNow) {
                        return;
                    }

                    nextSendAtRef.current = performance.now() + sendEveryMsRef.current;

                    const pcmData = new Int16Array(inputData.length);
                    for (let i = 0; i < inputData.length; i++) {
                        pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7fff;
                    }

                    ws.send(pcmData.buffer);
                };

                source.connect(processor);
                processor.connect(audioContext.destination);

                const wsUrl = `ws://127.0.0.1:8000/ws/voice/stream/`;
                const ws = new WebSocket(wsUrl);
                ws.binaryType = "arraybuffer";

                ws.onopen = () => {
                    console.log("Connected to WebSocket");
                    sessionReadyRef.current = true;  // Allow audio transmission immediately
                    setIsConnected(true);
                    setIsConnecting(false);
                };

                ws.onmessage = (event) => {
                    if (typeof event.data === "string") {
                        try {
                            const payload = JSON.parse(event.data) as {
                                type?: string;
                                event?: string;
                                status?: string;
                            };
                            const marker = payload.type || payload.event || payload.status;
                            if (marker === "session_ready") {
                                sessionReadyRef.current = true;
                                return;
                            }
                        } catch {
                            if (event.data.toLowerCase().includes("session_ready")) {
                                sessionReadyRef.current = true;
                                return;
                            }
                        }
                    }

                    if (event.data instanceof ArrayBuffer) {
                        const chunk = (event.data as ArrayBuffer).slice(0);
                        audioQueueRef.current = audioQueueRef.current
                            .then(() => scheduleAudioChunk(chunk))
                            .catch(() => { /* error already logged inside scheduleAudioChunk */ });
                        return;
                    }

                    if (event.data instanceof Blob) {
                        audioQueueRef.current = audioQueueRef.current
                            .then(() => (event.data as Blob).arrayBuffer())
                            .then((chunk) => scheduleAudioChunk(chunk))
                            .catch(() => { /* error already logged inside scheduleAudioChunk */ });
                    }
                };

                ws.onerror = (error) => {
                    console.error("WebSocket Error:", error);
                    setIsConnecting(false);
                };

                ws.onclose = () => {
                    console.log("Disconnected from WebSocket");
                    sessionReadyRef.current = false;
                    nextPlayTimeRef.current = 0;
                    activePlaybackCountRef.current = 0;
                    setIsConnected(false);
                };

                wsRef.current = ws;
            } catch (error) {
                console.error("Failed to start session:", error);
                await cleanupConnection();
            }
        }
    }, [cleanupConnection, isConnected, scheduleAudioChunk]);

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
                    className={`flex h-14 w-full cursor-pointer items-center justify-center rounded-2xl font-semibold transition-all duration-300 ${isConnected
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
                    {isConnected ? "CONNECTED" : "DISCONNECTED"}
                </div>
            </div>
        </div>
    );
}
