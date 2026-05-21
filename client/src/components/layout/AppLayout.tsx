import Navbar  from "../post/Navbar";
import Sidebar from "../post/Sidebar";

interface AppLayoutProps {
    children: React.ReactNode;
    communities?: {id: number; name: string}[];
    hideSidebar?: boolean;
}

export default function AppLayout({children, communities = [], hideSidebar = false} : AppLayoutProps) {
    return (
        <div className="min-h-screen bg-surface-base font-dm">
            <Navbar />
            {!hideSidebar && <Sidebar communities={communities} />}

            <main
                className="pt-14"
                style={{
                    marginLeft: hideSidebar ? 0 : '270px',
                }}
            >
                <div className="max-w-[700px] mx-auto px-4 py-6">
                    {children}
                </div> 
            </main>
        </div>
    );
}