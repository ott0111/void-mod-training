'use client'

import { motion } from 'framer-motion'
import { BookOpen, Award, Shield, Users, ChevronRight, Sparkles, Zap, Trophy } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="absolute inset-0 bg-grid opacity-20" />
        
        <motion.div 
          className="relative z-10 max-w-7xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Floating badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 glass-card rounded-full"
            animate={{ 
              y: [0, -10, 0],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="w-4 h-4 text-void-purple-300" />
            <span className="text-void-purple-200 text-sm font-medium">Enterprise Moderator Training</span>
          </motion.div>

          {/* Main title */}
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-6 text-gradient leading-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Void Mod
            <br />
            Training
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-xl md:text-2xl text-void-purple-200 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Master the art of esports moderation with our comprehensive certification program. 
            Learn from industry experts and join the elite team of Void moderators.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link href="/training" className="btn-primary group">
              <span className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Start Training
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <Link href="/verification" className="btn-secondary group">
              <span className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Take Certification Quiz
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>

          {/* Training Path */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.div 
              className="glass-card p-6 text-center glass-card-hover"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-void-purple-500 to-void-purple-600 rounded-2xl flex items-center justify-center shadow-void-glow">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-void-purple-100 mb-2">Learn</h3>
              <p className="text-void-purple-300">Study comprehensive moderation guidelines and best practices</p>
            </motion.div>

            <motion.div 
              className="glass-card p-6 text-center glass-card-hover"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-void-purple-500 to-void-purple-600 rounded-2xl flex items-center justify-center shadow-void-glow">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-void-purple-100 mb-2">Practice</h3>
              <p className="text-void-purple-300">Apply your knowledge in real-world scenario simulations</p>
            </motion.div>

            <motion.div 
              className="glass-card p-6 text-center glass-card-hover"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-void-purple-500 to-void-purple-600 rounded-2xl flex items-center justify-center shadow-void-glow">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-void-purple-100 mb-2">Complete</h3>
              <p className="text-void-purple-300">Pass the certification exam and earn your moderator role</p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-void-purple-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
              Why Choose Void Mod Training?
            </h2>
            <p className="text-xl text-void-purple-200 max-w-3xl mx-auto">
              Industry-leading moderation training designed by esports professionals
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Award,
                title: "Industry Certification",
                description: "Earn recognized certification that validates your moderation expertise"
              },
              {
                icon: Users,
                title: "Community Focused",
                description: "Learn to foster positive communities while maintaining order"
              },
              {
                icon: Shield,
                title: "Advanced Security",
                description: "Master the latest tools and techniques for community protection"
              },
              {
                icon: Zap,
                title: "Real-time Scenarios",
                description: "Practice with realistic moderation scenarios and case studies"
              },
              {
                icon: BookOpen,
                title: "Comprehensive Curriculum",
                description: "Cover all aspects of moderation from basic to advanced concepts"
              },
              {
                icon: Trophy,
                title: "Career Opportunities",
                description: "Open doors to professional moderation roles in esports"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="gradient-border p-1"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="glass-card p-8 h-full">
                  <feature.icon className="w-12 h-12 text-void-purple-400 mb-4" />
                  <h3 className="text-xl font-semibold text-void-purple-100 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-void-purple-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
