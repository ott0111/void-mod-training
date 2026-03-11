import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ParticleSystem from './components/ParticleSystem';

// Pages
import Home from './pages/Home';
import TrainingModules from './pages/TrainingModules';
import QuizPage from './pages/QuizPage';
import CertificationPage from './pages/CertificationPage';
import AdminPanel from './pages/AdminPanel';

// Services
import { supabase } from './services/supabase';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize user session
    const initializeUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setCurrentUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-void-dark-500 flex items-center justify-center">
        <div className="loading-dots">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-void-dark-500 relative overflow-hidden">
        {/* Particle System */}
        <ParticleSystem />

        {/* Main Layout */}
        <div className="flex h-screen relative z-10">
          {/* Sidebar */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-64 bg-void-dark-400/50 backdrop-blur-void border-r border-white/10"
              >
                <Sidebar 
                  user={currentUser}
                  onClose={() => setSidebarOpen(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <Header 
              user={currentUser}
              onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
              sidebarOpen={sidebarOpen}
            />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Home user={currentUser} />} />
                  <Route path="/training" element={<TrainingModules user={currentUser} />} />
                  <Route path="/quiz" element={<QuizPage user={currentUser} />} />
                  <Route path="/certification" element={<CertificationPage user={currentUser} />} />
                  <Route path="/admin" element={<AdminPanel user={currentUser} />} />
                </Routes>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
