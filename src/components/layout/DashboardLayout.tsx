import { Outlet } from 'react-router-dom';
import { NavBar } from '../ui/NavBar';
import { AnimatePresence } from 'framer-motion';
import { AnimatedBackground } from '../ui/AnimatedBackground';

export function DashboardLayout() {
    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />
            <NavBar />
            <main className="lg:pl-[260px] pb-24 lg:pb-8 p-4 lg:p-8">
                <div className="max-w-5xl mx-auto">
                    <AnimatePresence mode="wait">
                        <Outlet />
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
