import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Award, 
  Users, 
  Target, 
  TrendingUp,
  ArrowRight,
  Shield,
  Zap
} from 'lucide-react';

const Home = ({ user }) => {
  const stats = [
    { icon: Users, label: 'Total Trainees', value: '1,234', change: '+12%' },
    { icon: Award, label: 'Certified', value: '892', change: '+8%' },
    { icon: Target, label: 'Pass Rate', value: '72%', change: '+5%' },
    { icon: TrendingUp, label: 'Active Now', value: '156', change: '+23%' },
  ];

  const quickActions = [
    { 
      title: 'Start Training', 
      description: 'Begin your moderator certification journey',
      icon: BookOpen,
      link: '/training',
      color: 'from-void-purple-600 to-void-purple-400'
    },
    { 
      title: 'Take Quiz', 
      description: 'Test your knowledge and get certified',
      icon: Target,
      link: '/quiz',
      color: 'from-void-purple-500 to-void-purple-300'
    },
    { 
      title: 'View Progress', 
      description: 'Track your training achievements',
      icon: Award,
      link: '/certification',
      color: 'from-void-purple-400 to-void-purple-200'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card-lg p-8 text-center ambient-glow"
      >
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-void-purple-600 to-void-purple-400 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-4 animate-float">
            Welcome to Void Mod Training
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Become a certified Void Esports moderator through our comprehensive training program
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/training" className="neon-button inline-flex items-center space-x-2">
            <span>Start Training</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/quiz" className="glass-card px-6 py-3 inline-flex items-center space-x-2 hover:scale-105 transition-transform">
            <Target className="w-4 h-4" />
            <span>Take Quiz</span>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glow-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-void-purple-600 to-void-purple-400 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-green-400 font-medium">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="section-header">
          <Zap className="w-8 h-8" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="glow-card cursor-pointer group"
              >
                <Link to={action.link} className="block p-6">
                  <div className={`w-14 h-14 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{action.title}</h3>
                  <p className="text-gray-400 text-sm">{action.description}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Progress Overview */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card-lg p-8"
        >
          <h2 className="section-header mb-6">
            <TrendingUp className="w-8 h-8" />
            Your Progress
          </h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">Training Completion</span>
                <span className="text-void-purple-400">65%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div className="bg-gradient-to-r from-void-purple-600 to-void-purple-400 h-3 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">Quiz Status</span>
                <span className="text-yellow-400">Not Started</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-3 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Home;
