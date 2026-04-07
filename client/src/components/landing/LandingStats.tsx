const stats = [
    { num: 'M:N', label: 'Relational architecture' },
    { num: '3×', label: 'Replicated database nodes' },
    { num: 'JWT', label: 'Role-based access control' },
    { num: '0ms', label: 'Target failover latency' },
];

export default function LandingStats() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 px-6 md:px-16 py-12 md:py-16 border-t border-b border-border-subtle">
            {stats.map((s, i) => (
                <div
                    key={s.label}
                    className={`flex flex-col gap-2 py-6 lg:py-0 px-4 md:px-0 ${
                        i < stats.length - 1 ? 'lg:border-r lg:border-border-subtle' : ''
                    } ${i < 2 ? 'border-b lg:border-b-0 border-border-subtle' : ''}`}
                >
                    <span className="font-syne text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'rgba(108,99,255,0.85)' }}>
                        {s.num}
                    </span>
                    <span className="text-xs font-light tracking-widest uppercase text-muted-faint">
                        {s.label}
                    </span>
                </div>
            ))}
        </div>
    );
}