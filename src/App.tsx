import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAetherStore } from './store/aetherStore';
import { useAuthStore } from './store/authStore';
import { CustomCursor } from './components/ui/CustomCursor';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { GamificationOverlay } from './components/ui/GamificationOverlay';

// Lazy Load Pages
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(module => ({ default: module.RegisterPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(module => ({ default: module.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(module => ({ default: module.TermsPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(module => ({ default: module.ContactPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(module => ({ default: module.PricingPage })));
import { PublicLayout } from './components/layout/PublicLayout';
import { Restricted } from './components/auth/Restricted';

const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const TrackersPage = lazy(() => import('./pages/TrackersPage').then(module => ({ default: module.TrackersPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(module => ({ default: module.ReportsPage })));
const GamingPage = lazy(() => import('./pages/GamingPage').then(module => ({ default: module.GamingPage })));
const ChatPage = lazy(() => import('./pages/ChatPage').then(module => ({ default: module.ChatPage })));
const JournalPage = lazy(() => import('./pages/JournalPage').then(module => ({ default: module.JournalPage })));
const MeditationPage = lazy(() => import('./pages/MeditationPage').then(module => ({ default: module.MeditationPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const GuildsPage = lazy(() => import('./pages/social/GuildsPage').then(module => ({ default: module.GuildsPage })));
const ShopPage = lazy(() => import('./pages/ShopPage').then(module => ({ default: module.ShopPage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(module => ({ default: module.OnboardingPage })));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage').then(module => ({ default: module.LeaderboardPage })));
const CommunityPage = lazy(() => import('./pages/CommunityPage').then(module => ({ default: module.CommunityPage })));
const MessagesPage = lazy(() => import('./pages/social/MessagesPage').then(module => ({ default: module.MessagesPage })));
const TreasuryPage = lazy(() => import('./pages/TreasuryPage').then(module => ({ default: module.TreasuryPage })));

import { InstallPrompt } from './components/pwa/InstallPrompt';
import { OfflineBanner } from './components/pwa/OfflineBanner';
import { IOSInstallInstructions } from './components/pwa/IOSInstallInstructions';
import { ToastProvider } from './context/ToastContext';

// Loading Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
  </div>
);

const App: React.FC = () => {
  const onboardingComplete = useAetherStore((s) => s.onboardingComplete);
  const { user, loading, initialized, initAuthListener } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, [initAuthListener]);

  // Theme Engine
  const equippedTheme = useAetherStore((s) => s.equipped?.theme) || 'default';
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', equippedTheme);
  }, [equippedTheme]);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#060714]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Aetherius Vitality</h1>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-6 h-6 mx-auto border-2 border-emerald-500/20 border-t-emerald-400 rounded-full"
          />
        </motion.div>
      </div>
    );
  }

  if (!onboardingComplete && user) { // Only show onboarding if user is logged in and onboarding is not complete
    return (
      <Suspense fallback={<PageLoader />}>
        <OnboardingPage />
      </Suspense>
    );
  }



  return (
    <ToastProvider>
      <div className="min-h-screen relative">
        <OfflineBanner />
        <InstallPrompt />
        <IOSInstallInstructions />
        <CustomCursor />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
              <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
            </Route>

            {/* Protected Routes */}
            <Route element={user ? <><GamificationOverlay /><DashboardLayout /></> : <Navigate to="/login" replace />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/trackers" element={<TrackersPage />} />

              {/* Premium Features */}
              <Route path="/reports" element={
                <Restricted feature="canAccessReports">
                  <ReportsPage />
                </Restricted>
              } />
              <Route path="/gaming" element={
                <Restricted feature="canAccessGamification">
                  <GamingPage />
                </Restricted>
              } />
              <Route path="/chat" element={
                <Restricted feature="canAccessAI">
                  <ChatPage />
                </Restricted>
              } />

              <Route path="/journal" element={<JournalPage />} />
              <Route path="/meditation" element={<MeditationPage />} />

              <Route path="/guilds" element={<GuildsPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/treasury" element={<TreasuryPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
    </ToastProvider>
  );
};

export default App;
