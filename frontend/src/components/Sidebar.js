import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  BookOpen, 
  FileQuestion, 
  Award, 
  Settings, 
  LogOut,
  User,
  Shield
} from 'lucide-react';

const Sidebar = ({ user, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/training', icon: BookOpen, label: 'Training Modules' },
    { path: '/quiz', icon: FileQuestion, label: 'Quiz' },
    { path: '/certification', icon: Award, label: 'Certification' },
    { path: '/admin', icon: Settings, label: 'Admin Panel', adminOnly: true },
  ];

  const handleLogout = async () => {
    try {
      const { supabase } = await import('../services/supabase');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="h-full flex flex-col glass-card border-0 rounded-none">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-void-purple-600 to-void-purple-400 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">Void Mod Training</h1>
            <p className="text-xs text-gray-400">Esports Certification</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            if (item.adminOnly && (!user || user.user_metadata?.role !== 'admin')) {
              return null;
            }

            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.li
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 w-1 h-8 bg-gradient-to-b from-void-purple-400 to-void-purple-600 rounded-r-full"
                    />
                  )}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/10">
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5">
              <div className="w-8 h-8 bg-gradient-to-r from-void-purple-600 to-void-purple-400 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-xs text-gray-400">
                  {user.user_metadata?.role || 'Trainee'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="sidebar-item w-full text-red-400 hover:text-red-300"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-3">Not logged in</p>
            <button className="neon-button w-full text-sm">
              Login with Discord
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
