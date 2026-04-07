export default function LandingFooter() {
    return (
        <footer className="flex flex-col md:flex-row justify-between items-center gap-2 px-6 md:px-16 py-8 md:py-10 border-t border-border-subtle">
            <p className="text-xs font-light tracking-wider text-muted-whisper">
                PulseNet  Distributed social networking platform
            </p>
            <p className="text-xs font-light tracking-wider text-muted-whisper">
                Node.js + Express + MySQL Master-Slave Replication
            </p>
        </footer>
    );
}