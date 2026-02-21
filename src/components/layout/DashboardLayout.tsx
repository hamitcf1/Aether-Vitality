import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { NavBar } from '../ui/NavBar';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '../ui/AnimatedBackground';
import { ExpPopups } from '../ui/ExpPopups';
import { Loader2 } from 'lucide-react';

const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
    </div>
);

export function DashboardLayout() {
    const location = useLocation();

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />
            <ExpPopups />
            <NavBar />
            <main className="lg:pl-[260px] pb-24 lg:pb-8 p-4 lg:p-8">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                        <Suspense fallback={<PageLoader />}>
                            <Outlet />
                        </Suspense>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
