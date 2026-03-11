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
        className="glass-card-lg p-12 text-center ambient-glow relative overflow-hidden"
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-void-purple-600/10 via-transparent to-void-purple-400/10 pointer-events-none" />
        
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-void-purple-600 to-void-purple-400 rounded-3xl mb-6 shadow-void-glow-lg float-animation">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-6xl font-bold gradient-text mb-6 float-animation-slow"
          >
            Welcome to Void Mod Training
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Become a certified Void Esports moderator through our comprehensive training program
          </motion.p>
          
          {/* Training Path */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-10"
          >
            {[
              { step: 'Learn', icon: BookOpen, delay: 0.6 },
              { step: 'Practice', icon: Target, delay: 0.7 },
              { step: 'Complete', icon: Award, delay: 0.8 }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: item.delay, duration: 0.6 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-void-purple-600/20 to-void-purple-500/20 rounded-xl flex items-center justify-center border border-void-purple-400/30">
                    <Icon className="w-6 h-6 text-void-purple-300" />
                  </div>
                  <span className="text-lg font-semibold text-white">{item.step}</span>
                  {index < 2 && (
                    <div className="hidden sm:block w-8 h-0.5 bg-gradient-to-r from-void-purple-400/50 to-transparent" />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-12 relative z-10"
        >
          <Link to="/training" className="neon-button inline-flex items-center space-x-3 text-lg px-8 py-4 shadow-void-glow-lg">
            <span>Start Training</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/quiz" className="glass-card px-8 py-4 inline-flex items-center space-x-3 hover:scale-105 transition-all duration-300 text-lg">
            <Target className="w-5 h-5" />
            <span>Take Quiz</span>
          </Link>
        </motion.div>
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
