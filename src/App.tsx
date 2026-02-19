import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { AnimatedBackground } from './components/ui/AnimatedBackground';
import { NavBar } from './components/ui/NavBar';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { ProfilePage } from './pages/ProfilePage';
import { TrackersPage } from './pages/TrackersPage';
import { ReportsPage } from './pages/ReportsPage';
import { GamingPage } from './pages/GamingPage';
import { JournalPage } from './pages/JournalPage';
import { MeditationPage } from './pages/MeditationPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { useAetherStore } from './store/aetherStore';
import { useAuthStore } from './store/authStore';

const App: React.FC = () => {
  const onboardingComplete = useAetherStore((s) => s.onboardingComplete);
  const { user, loading, initialized, initAuthListener } = useAuthStore();

  // Initialize Firebase auth listener
  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, [initAuthListener]);

  // Loading splash
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative">
        <AnimatedBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Aether Vitality</h1>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-6 h-6 mx-auto border-2 border-emerald-500/20 border-t-emerald-400 rounded-full"
          />
        </motion.div>
      </div>
    );
  }

  // Not logged in → auth pages
  if (!user) {
    return (
      <div className="relative">
        <AnimatedBackground />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoginPage />
              </motion.div>
            } />
            <Route path="/register" element={
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <RegisterPage />
              </motion.div>
            } />
            {/* Clean redirect for any other route to Landing Page if not logged in */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>

        {/* Conditional rendering for Auth Pages overlay if triggered from Landing Page props (optional, but Routes approach is cleaner) 
            Actually, the Landing Page controls `authPage` state but we are using Routes now? 
            No, let's keep it simple. If `authPage` state changes, we can redirect or render. 
            Better approach: 
            The LandingPage component has buttons that should navigate to /login or /register.
            Refactoring:
        */}
      </div>
    );
  }

  // Logged in but not onboarded
  if (!onboardingComplete) {
    return <OnboardingPage />;
  }

  // Fully authenticated + onboarded
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <NavBar />

      {/* Main content area */}
      <main className="lg:pl-[260px] pb-24 lg:pb-8 p-4 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/trackers" element={<TrackersPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/gaming" element={<GamingPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/meditation" element={<MeditationPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;
