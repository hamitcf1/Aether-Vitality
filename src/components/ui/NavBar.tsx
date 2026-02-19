import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageCircle, User, Sparkles, Activity, BarChart3, Gamepad2 } from 'lucide-react';
import { cn } from '../../lib/cn';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/trackers', icon: Activity, label: 'Trackers' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/gaming', icon: Gamepad2, label: 'Gaming' },
    { path: '/chat', icon: MessageCircle, label: 'Alchemist' },
    { path: '/profile', icon: User, label: 'Profile' },
];

export const NavBar: React.FC = () => {
    const location = useLocation();

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex fixed left-0 top-0 h-full w-[260px] flex-col z-40 p-4">
                <div className="glass rounded-2xl flex-1 flex flex-col p-4">
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-3 pt-2 pb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-glow-sm">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold gradient-text tracking-tight">AETHER VITALITY</h1>
                            <p className="text-[10px] text-gray-600 font-medium uppercase tracking-widest">The Alchemist&apos;s Hub</p>
                        </div>
                    </div>

                    {/* Nav links */}
                    <nav className="flex flex-col gap-1 flex-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    'nav-item',
                                    location.pathname === item.path && 'nav-item-active'
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-sm font-medium">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Version */}
                    <div className="px-3 pb-2">
                        <p className="text-[10px] text-gray-700 font-mono">v2.0.0-alpha</p>
                    </div>
                </div>
            </aside>

            {/* Mobile bottom bar */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-3">
                <div className="glass rounded-2xl flex items-center justify-around px-2 py-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={cn(
                                'flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-all duration-200',
                                location.pathname === item.path
                                    ? 'text-brand-emerald bg-brand-emerald/10'
                                    : 'text-gray-600 hover:text-gray-400'
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider">{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>
        </>
    );
};
