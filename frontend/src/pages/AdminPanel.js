import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileQuestion, Award, TrendingUp, Search, Filter, Download } from 'lucide-react';
import { adminService } from '../services/supabase';

const AdminPanel = ({ user }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (user && user.user_metadata?.role === 'admin') {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      const [usersData, statsData] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getQuizStats()
      ]);
      
      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.user_metadata?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'passed') return matchesSearch && user.quiz_attempts?.some(attempt => attempt.passed);
    if (filterStatus === 'failed') return matchesSearch && user.quiz_attempts?.every(attempt => !attempt.passed);
    if (filterStatus === 'not_started') return matchesSearch && (!user.quiz_attempts || user.quiz_attempts.length === 0);
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading-dots">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
        </div>
      </div>
    );
  }

  if (!user || user.user_metadata?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="glass-card-lg p-8">
          <Users className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold gradient-text mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">
            You need administrator privileges to access this panel.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="neon-button"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold gradient-text mb-4">Admin Panel</h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Manage trainees, quiz results, and certifications
        </p>
      </motion.div>

      {/* Stats Overview */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-void-purple-400" />
                <span className="text-xs text-green-400 font-medium">+12%</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stats.totalAttempts}</h3>
              <p className="text-sm text-gray-400">Total Attempts</p>
            </div>
            
            <div className="glow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <Award className="w-8 h-8 text-green-400" />
                <span className="text-xs text-green-400 font-medium">+8%</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stats.passedAttempts}</h3>
              <p className="text-sm text-gray-400">Passed Quiz</p>
            </div>
            
            <div className="glow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-void-purple-400" />
                <span className="text-xs text-void-purple-400 font-medium">{stats.passRate.toFixed(1)}%</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stats.passRate.toFixed(1)}%</h3>
              <p className="text-sm text-gray-400">Pass Rate</p>
            </div>
            
            <div className="glow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <FileQuestion className="w-8 h-8 text-yellow-400" />
                <span className="text-xs text-yellow-400 font-medium">{stats.averageScore.toFixed(1)}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stats.averageScore.toFixed(1)}</h3>
              <p className="text-sm text-gray-400">Avg Score</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'users', label: 'Trainees', icon: Users },
            { id: 'quiz', label: 'Quiz Results', icon: FileQuestion },
            { id: 'certifications', label: 'Certifications', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-void-purple-600 to-void-purple-500 shadow-void-glow'
                    : 'glass-card hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Trainees Tab */}
      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="glass-card-lg p-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search trainees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-void-purple-400"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-void-purple-400"
                >
                  <option value="all">All Status</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="not_started">Not Started</option>
                </select>
              </div>
              
              <button className="glass-card px-4 py-2 hover:scale-105 transition-transform flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400">User</th>
                    <th className="text-left py-3 px-4 text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400">Quiz Score</th>
                    <th className="text-left py-3 px-4 text-gray-400">Attempts</th>
                    <th className="text-left py-3 px-4 text-gray-400">Certified</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => {
                    const latestAttempt = user.quiz_attempts?.[0];
                    const hasPassed = user.quiz_attempts?.some(attempt => attempt.passed);
                    const isCertified = user.certifications?.length > 0;
                    
                    return (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-white font-medium">
                              {user.user_metadata?.full_name || 'Unknown'}
                            </p>
                            <p className="text-sm text-gray-400">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                            hasPassed
                              ? 'bg-green-600/20 text-green-400'
                              : latestAttempt
                              ? 'bg-red-600/20 text-red-400'
                              : 'bg-yellow-600/20 text-yellow-400'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              hasPassed ? 'bg-green-400' : latestAttempt ? 'bg-red-400' : 'bg-yellow-400'
                            }`} />
                            <span>
                              {hasPassed ? 'Passed' : latestAttempt ? 'Failed' : 'Not Started'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {latestAttempt ? (
                            <span className="text-white">
                              {latestAttempt.score}/{latestAttempt.total_questions || 10}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-white">
                            {user.quiz_attempts?.length || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                            isCertified
                              ? 'bg-green-600/20 text-green-400'
                              : 'bg-gray-600/20 text-gray-400'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              isCertified ? 'bg-green-400' : 'bg-gray-400'
                            }`} />
                            <span>{isCertified ? 'Yes' : 'No'}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No trainees found</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Quiz Results Tab */}
      {activeTab === 'quiz' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="glass-card-lg p-6">
            <div className="text-center py-8">
              <FileQuestion className="w-16 h-16 text-void-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold gradient-text mb-2">Quiz Results Analysis</h3>
              <p className="text-gray-400">
                Detailed quiz analytics coming soon...
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Certifications Tab */}
      {activeTab === 'certifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="glass-card-lg p-6">
            <div className="text-center py-8">
              <Award className="w-16 h-16 text-void-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold gradient-text mb-2">Certification Management</h3>
              <p className="text-gray-400">
                Certification management tools coming soon...
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminPanel;
