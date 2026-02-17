
export default function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="glass flex items-center gap-4 rounded-lg  py-4 px-3 shadow-sm transition-transform hover:scale-[1.02]">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sage-100 text-sage-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {icon}
                </svg>
            </div>
            <div >
                <p className="text-sm font-medium text-sage-500">{label}</p>
                <p className="text-2xl font-bold text-sage-900">{value}</p>
            </div>
        </div>
    );
}