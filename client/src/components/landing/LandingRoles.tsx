const roles = [
    { label: 'Guest', color: 'bg-pulse', desc: 'Pregled javnih zajednica i objava. Bez mogućnosti kreiranja sadržaja ili interakcije.' },
    { label: 'User', color: 'bg-role-user', desc: 'Kreiranje zajednica, objava i komentara. Praćenje korisnika. Upravljanje sopstvenim profilom.' },
    { label: 'Administrator', color: 'bg-role-admin', desc: 'Globalni pristup. Upravljanje korisnicima, tagovima, audit logom i health statusom baze.' },
];

export default function LandingRoles() {
    return (
        <section id="roles" className="grid grid-cols-1 md:grid-cols-2 border-t border-border-subtle">
            <div className="px-6 md:px-16 py-16 md:py-24 border-b md:border-b-0 md:border-r border-border-subtle">
                <p className="text-xs tracking-widest uppercase mb-6 text-pulse-60">Access control</p>
                <h2 className="font-syne text-subhead leading-heading tracking-heading text-white font-black mb-6">
                    Tri nivoa pristupa,<br />jedna platforma
                </h2>
                <p className="text-sm font-light leading-loose max-w-sm text-muted-soft">
                    Sistem uloga od gosta do administratora osigurava da svaki korisnik ima tačno onoliko pristupa koliko mu je potrebno — ni više, ni manje.
                </p>
            </div>
            <div className="px-6 md:px-16 py-16 md:py-24 flex flex-col justify-center gap-6">
                {roles.map((r, i) => (
                    <div
                        key={r.label}
                        className={`flex gap-6 items-start pb-6 ${i < roles.length - 1 ? 'border-b border-border-subtle' : ''}`}
                    >
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${r.color}`} />
                        <div>
                            <h4 className="font-syne text-sm font-bold tracking-wide mb-1 text-muted-strong">
                                {r.label}
                            </h4>
                            <p className="text-xs font-light leading-relaxed text-muted-ghost">{r.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}