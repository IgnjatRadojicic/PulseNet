const features = [
    { title: 'Tematske zajednice', desc: 'Kreiranje i upravljanje zajednicama sa hijerarhijskim ulogama. Moderatori kontrolišu sadržaj, članstvo i pristup.' },
    { title: 'Distribuirana baza podataka', desc: 'Master-slave replikacija sa automatskim failoverom osigurava visoku dostupnost i ravnomerno balansiranje čitanja.' },
    { title: 'Personalizovani feed', desc: 'Dinamički feed koji kombinuje sadržaj iz zajednica i praćenih korisnika, sortiran po relevantnosti.' },
    { title: 'Sistem tagova', desc: 'Globalni sistem oznaka kojim upravljaju administratori. Organizacija sadržaja kroz semantičke kategorije.' },
    { title: 'Hijerarhijski komentari', desc: 'Dvonivovski sistem komentara sa soft-delete mehanizmom koji čuva kontekst diskusije.' },
    { title: 'Audit log', desc: 'Kompletna evidencija svih akcija u sistemu. Administratori imaju uvid u svaki događaj sa paginacijom.' },
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
                    <h3 className="font-syne text-white font-bold text-lg mb-4 tracking-tight">{f.title}</h3>
                    <p className="text-sm font-light leading-loose text-muted-soft">{f.desc}</p>
                </div>
            ))}
        </section>
    );
}