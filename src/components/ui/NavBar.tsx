import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageCircle, User, Sparkles, Activity, BarChart3, Gamepad2, Book, Wind, Shield, Trophy, LogOut, Clock, Calendar, Users } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/trackers', icon: Activity, label: 'Trackers' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/gaming', icon: Gamepad2, label: 'Gaming' },
    { path: '/journal', icon: Book, label: 'Journal' },
    { path: '/meditation', icon: Wind, label: 'Meditation' },
    { path: '/chat', icon: MessageCircle, label: 'Alchemist' },
    { path: '/guilds', icon: Shield, label: 'Guilds' },
    { path: '/community', icon: Users, label: 'Community' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaders' },
    { path: '/profile', icon: User, label: 'Profile' },
];

export const NavBar: React.FC = () => {
    const location = useLocation();
    const { features } = useUserStore();
    const logout = useAuthStore(s => s.signOut);
    const [time, setTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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
                        {navItems.map((item) => {
                            const isLocked =
                                (item.path === '/chat' && !features.canAccessAI) ||
                                (item.path === '/reports' && !features.canAccessReports) ||
                                (item.path === '/gaming' && !features.canAccessGamification);

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        'nav-item',
                                        location.pathname === item.path && 'nav-item-active',
                                        isLocked && 'opacity-50 grayscale'
                                    )}
                                >
                                    <div className="relative">
                                        <item.icon className="w-5 h-5" />
                                        {isLocked && (
                                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gray-500 rounded-full flex items-center justify-center border border-[#060714]">
                                                <div className="w-1.5 h-1.5 text-white">🔒</div>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium">{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* Clock & Date Widget */}
                    <div className="mx-3 mb-4 p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1 items-center justify-center">
                        <div className="flex items-center gap-2 text-white">
                            <Clock className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-bold tracking-wider">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span className="text-[10px] font-medium uppercase tracking-widest">{time.toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* Quick Access Bottom Actions (Logout) */}
                    <div className="px-3 pb-2 flex items-center justify-between border-t border-white/5 pt-4">
                        <p className="text-[10px] text-gray-700 font-mono">v2.0.0-alpha</p>
                        <button
                            onClick={() => logout()}
                            className="p-2 rounded-xl text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
                            title="Log Out"
                        >
                            <span className="text-xs font-bold uppercase tracking-widest hidden xl:block">Logout</span>
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile bottom bar */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-3 bg-gradient-to-t from-[#060714] to-transparent">
                <div className="glass rounded-2xl flex items-center gap-2 px-2 py-2 overflow-x-auto no-scrollbar snap-x snap-mandatory">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => cn(
                                'flex flex-col items-center gap-1 min-w-[72px] px-2 py-2 rounded-xl transition-all duration-200 snap-center shrink-0',
                                isActive
                                    ? 'text-brand-emerald bg-brand-emerald/10'
                                    : 'text-gray-600 hover:text-gray-400'
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap">{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>
        </>
    );
};
