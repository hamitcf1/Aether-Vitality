import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function PublicLayout() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#060714] text-white font-sans selection:bg-emerald-500/30 flex flex-col relative">
            {/* Public Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#060714]/80 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-white tracking-tight">Aetherius Vitality</span>
                    </Link>

                    <div className="hidden sm:flex items-center gap-6">
                        <Link to="/pricing" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                            Pricing
                        </Link>
                        <Link to="/contact" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                            Contact
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full transition-all hover:scale-105 shadow-lg shadow-emerald-500/20"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Page Content */}
            <div className="flex-grow pt-16">
                <Outlet />
            </div>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-[#060714]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                    <Sparkles className="w-3 h-3 text-emerald-400" />
                                </div>
                                <span className="text-sm font-bold text-white">Aetherius Vitality</span>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Transform your health journey into an epic adventure.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Product</h4>
                            <div className="flex flex-col gap-2">
                                <Link to="/pricing" className="text-sm text-gray-500 hover:text-white transition-colors">Pricing</Link>
                                <Link to="/" className="text-sm text-gray-500 hover:text-white transition-colors">Features</Link>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Legal</h4>
                            <div className="flex flex-col gap-2">
                                <Link to="/privacy" className="text-sm text-gray-500 hover:text-white transition-colors">Privacy Policy</Link>
                                <Link to="/terms" className="text-sm text-gray-500 hover:text-white transition-colors">Terms of Service</Link>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Support</h4>
                            <div className="flex flex-col gap-2">
                                <Link to="/contact" className="text-sm text-gray-500 hover:text-white transition-colors">Contact Us</Link>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 text-center">
                        <p className="text-xs text-gray-600">&copy; 2026 Aetherius Vitality. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
