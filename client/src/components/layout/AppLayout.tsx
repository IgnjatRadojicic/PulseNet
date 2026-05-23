import Navbar  from "../post/Navbar";
import Sidebar from "../post/Sidebar";
import { useState } from 'react';

interface AppLayoutProps {
    children: React.ReactNode;
    communities?: {id: number; name: string}[];
    hideSidebar?: boolean;
}

export default function AppLayout({children, communities = [], hideSidebar = false} : AppLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-surface-base font-dm">
            <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        {!hideSidebar && (
            <Sidebar
                communities={communities}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
        )}

            <main
                className={`pt-14 transition-all duration-200 ${!hideSidebar ? (sidebarOpen ? 'lg:ml-[270px]' : 'lg:ml-[50px]') : ''}`}
            >
            
                <div className="max-w-[700px] mx-auto px-4 py-6">
                    {children}
                </div> 
            </main>
        </div>
    );
}