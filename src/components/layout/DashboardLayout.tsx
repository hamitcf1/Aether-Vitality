import { Outlet, useLocation } from 'react-router-dom';
import { NavBar } from '../ui/NavBar';
import { AnimatePresence, motion } from 'framer-motion';
import { AnimatedBackground } from '../ui/AnimatedBackground';
import { ExpPopups } from '../ui/ExpPopups';

export function DashboardLayout() {
    const location = useLocation();

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />
            <ExpPopups />
            <NavBar />
            <main className="lg:pl-[260px] pb-24 lg:pb-8 p-4 lg:p-8">
                <div className="max-w-5xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
