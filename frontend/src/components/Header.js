import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, Search, User } from 'lucide-react';

const Header = ({ user, onMenuToggle, sidebarOpen }) => {
  return (
    <header className="glass-card border-0 rounded-none border-b border-white/10 h-16 flex items-center justify-between px-6">
      {/* Left side - Menu toggle and title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold text-white">
            {sidebarOpen ? 'Training Dashboard' : 'Void Mod Training'}
          </h1>
        </div>
      </div>

      {/* Center - Search bar (hidden on mobile) */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search training modules..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-void-purple-400 focus:bg-white/10 transition-all"
          />
        </div>
      </div>

      {/* Right side - Notifications and user */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-void-purple-400 rounded-full"></span>
        </button>

        {/* User info */}
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-white">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-xs text-gray-400">
                  {user.user_metadata?.role || 'Trainee'}
                </p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-void-purple-600 to-void-purple-400 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </>
          ) : (
            <button className="neon-button text-sm px-4 py-2">
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
