import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Calendar, CheckCircle, Download, Share2, Shield } from 'lucide-react';
import { userService, quizService } from '../services/supabase';

const CertificationPage = ({ user }) => {
  const [certification, setCertification] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCertificationData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadCertificationData = async () => {
    try {
      const [certs, history] = await Promise.all([
        userService.getCertifications(user.id),
        quizService.getQuizHistory(user.id)
      ]);
      
      setCertification(certs[0] || null);
      setQuizHistory(history);
    } catch (error) {
      console.error('Error loading certification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = () => {
    // Placeholder for certificate download functionality
    alert('Certificate download feature coming soon!');
  };

  const shareCertificate = () => {
    // Placeholder for certificate sharing functionality
    alert('Certificate sharing feature coming soon!');
  };

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

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="glass-card-lg p-8">
          <Shield className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold gradient-text mb-4">Authentication Required</h2>
          <p className="text-gray-300 mb-6">
            You need to be logged in to view your certification status.
          </p>
          <button className="neon-button">
            Login with Discord
          </button>
        </div>
      </div>
    );
  }

  const hasPassedQuiz = quizHistory.some(attempt => attempt.passed);

  if (!hasPassedQuiz) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass-card-lg p-8 text-center">
          <Award className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold gradient-text mb-4">Quiz Not Completed</h2>
          <p className="text-gray-300 mb-6">
            You need to pass the certification quiz to receive your moderator certification.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/quiz'}
              className="neon-button w-full"
            >
              Take Certification Quiz
            </button>
            <button
              onClick={() => window.location.href = '/training'}
              className="glass-card w-full px-6 py-3 hover:scale-105 transition-transform"
            >
              Review Training Materials
            </button>
          </div>
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
        <h1 className="text-4xl font-bold gradient-text mb-4">Your Certification</h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          View and manage your Void Esports Moderator certification
        </p>
      </motion.div>

      {/* Certificate Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card-lg p-8 ambient-glow"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-void-purple-600 to-void-purple-400 rounded-full mb-4">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold gradient-text mb-2">Void Esports Moderator</h2>
          <p className="text-xl text-gray-300 mb-2">Certification of Completion</p>
          <div className="flex items-center justify-center space-x-2 text-void-purple-400">
            <CheckCircle className="w-5 h-5" />
            <span>Certified Moderator</span>
          </div>
        </div>

        {/* Certificate Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-void-purple-400 mb-4">Certified To</h3>
            <div className="space-y-2">
              <p className="text-white">
                <span className="text-gray-400">Name:</span> {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-white">
                <span className="text-gray-400">Discord ID:</span> {user.id}
              </p>
              <p className="text-white">
                <span className="text-gray-400">Role:</span> Certified Moderator
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-void-purple-400 mb-4">Certification Details</h3>
            <div className="space-y-2">
              <p className="text-white">
                <span className="text-gray-400">Date:</span> {new Date().toLocaleDateString()}
              </p>
              <p className="text-white">
                <span className="text-gray-400">Certificate ID:</span> VM-{Date.now().toString(36).toUpperCase()}
              </p>
              <p className="text-white">
                <span className="text-gray-400">Status:</span> <span className="text-green-400">Active</span>
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={downloadCertificate}
            className="neon-button flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Certificate</span>
          </button>
          <button
            onClick={shareCertificate}
            className="glass-card px-6 py-3 hover:scale-105 transition-transform flex items-center justify-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Certificate</span>
          </button>
        </div>
      </motion.div>

      {/* Quiz History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="section-header mb-6">
          <Calendar className="w-8 h-8" />
          Quiz History
        </h2>
        
        <div className="glass-card p-6">
          {quizHistory.length > 0 ? (
            <div className="space-y-4">
              {quizHistory.map((attempt, index) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 glass-card border-l-4 border-void-purple-400"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      attempt.passed
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-red-600/20 text-red-400'
                    }`}>
                      {attempt.passed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Calendar className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {attempt.passed ? 'Passed' : 'Failed'} - {attempt.score}/{attempt.total_questions || 10}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(attempt.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    attempt.passed
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-red-600/20 text-red-400'
                  }`}>
                    {Math.round((attempt.score / (attempt.total_questions || 10)) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">
              No quiz attempts found
            </p>
          )}
        </div>
      </motion.div>

      {/* Discord Roles Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="section-header mb-6">
          <Shield className="w-8 h-8" />
          Discord Roles Status
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Trial Mod', status: 'assigned', color: 'from-green-600 to-green-400' },
            { name: 'Staff Access', status: 'assigned', color: 'from-blue-600 to-blue-400' },
            { name: 'Ticket Support', status: 'assigned', color: 'from-purple-600 to-purple-400' }
          ].map((role, index) => (
            <motion.div
              key={role.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="glow-card p-6 text-center"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${role.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{role.name}</h3>
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                role.status === 'assigned'
                  ? 'bg-green-600/20 text-green-400'
                  : 'bg-yellow-600/20 text-yellow-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  role.status === 'assigned' ? 'bg-green-400' : 'bg-yellow-400'
                }`} />
                <span>{role.status === 'assigned' ? 'Assigned' : 'Pending'}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default CertificationPage;
