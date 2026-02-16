import AgentCard from "@/components/Agent/AgentCard";

export default function AgentPage() {
    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "";

    return (
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">
            <div className="relative w-full max-w-lg">
                {/* Background decorative elements */}
                <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-sage-100/50 blur-3xl"></div>
                <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl"></div>

                <div className="relative flex flex-col items-center">
                    <div className="mb-12 text-center">
                        <span className="mb-4 inline-block rounded-full bg-sage-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-sage-600">
                            Voice Interface
                        </span>
                        <h1 className="text-4xl font-bold tracking-tight text-sage-900 sm:text-5xl">
                            Talk to BlenSpark
                        </h1>
                        <p className="mt-4 text-lg text-sage-600">
                            The intelligent voice assistant powered by BlenSpark & ElevenLabs.
                        </p>
                    </div>

                    <AgentCard agentId={agentId} />

                    {!agentId && (
                        <div className="mt-8 rounded-xl bg-amber-50 p-4 text-sm text-amber-700 border border-amber-200">
                            <p className="font-semibold text-amber-800">Agent ID Missing</p>
                            <p>Please provide your ElevenLabs Agent ID in the <code>.env.local</code> file as <code>NEXT_PUBLIC_ELEVENLABS_AGENT_ID</code>.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
