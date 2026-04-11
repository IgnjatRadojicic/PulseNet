const features = [
    {
        title: 'Thematic communities',
        desc: 'Creation and management of communities with hierarchical roles. Moderators control content, membership, and access.'
    },
    {
        title: 'Distributed database',
        desc: 'Master-slave replication with automatic failover ensures high availability and balanced read performance.'
    },
    {
        title: 'Personalized feed',
        desc: 'A dynamic feed combining content from communities and followed users, sorted by relevance.'
    },
    {
        title: 'Tag system',
        desc: 'Global tagging system managed by administrators. Content organization through semantic categories.'
    },
    {
        title: 'Hierarchical comments',
        desc: 'Two-level comment system with soft-delete mechanism that preserves discussion context.'
    },
    {
        title: 'Audit log',
        desc: 'Complete record of all system actions. Administrators can review every event with pagination support.'
    }
];

export default function LandingFeatures() {
    return (
        <section
            id="features"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border-subtle"
        >
            {features.map(f => (
                <div
                    key={f.title}
                    className="p-8 md:p-12 bg-surface-base transition-colors duration-300 cursor-default group hover:bg-surface-hover"
                >
                    <div className="h-px mb-8 w-8 bg-pulse transition-all duration-300 group-hover:w-12" />
                    <h3 className="font-syne text-white font-bold text-lg mb-4 tracking-tight">
                        {f.title}
                    </h3>
                    <p className="text-sm font-light leading-loose text-muted-soft">
                        {f.desc}
                    </p>
                </div>
            ))}
        </section>
    );
}