'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, AlertCircle, CheckCircle, ArrowRight, User, Hash } from 'lucide-react'
import Link from 'next/link'

export default function VerificationPage() {
  const [discordUserId, setDiscordUserId] = useState('')
  const [discordUsername, setDiscordUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean
    isMember: boolean
    message: string
  } | null>(null)

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setVerificationResult(null)

    try {
      const response = await fetch('/api/discord/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discordUserId,
          discordUsername,
        }),
      })

      const result = await response.json()
      setVerificationResult(result)
    } catch (error) {
      setVerificationResult({
        success: false,
        isMember: false,
        message: 'An error occurred during verification. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 bg-grid opacity-20" />
      
      <motion.div 
        className="relative z-10 max-w-2xl w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-void-purple-500 to-void-purple-600 rounded-2xl mb-6 shadow-void-glow">
            <Shield className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
            Discord Verification
          </h1>
          
          <p className="text-xl text-void-purple-200 leading-relaxed">
            Verify your Discord server membership to access the certification quiz
          </p>
        </motion.div>

        {/* Verification Form */}
        <motion.div 
          className="gradient-border p-1 mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="glass-card p-8">
            <form onSubmit={handleVerification} className="space-y-6">
              {/* Discord Username Input */}
              <div>
                <label className="flex items-center gap-2 text-void-purple-200 font-medium mb-3">
                  <User className="w-5 h-5" />
                  Discord Username
                </label>
                <input
                  type="text"
                  value={discordUsername}
                  onChange={(e) => setDiscordUsername(e.target.value)}
                  placeholder="Enter your Discord username"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-void-purple-100 placeholder-void-purple-400 focus:outline-none focus:border-void-purple-400 focus:bg-white/10 transition-all duration-300"
                  required
                />
                <p className="text-void-purple-400 text-sm mt-2">
                  Example: Username#1234 or just Username
                </p>
              </div>

              {/* Discord User ID Input */}
              <div>
                <label className="flex items-center gap-2 text-void-purple-200 font-medium mb-3">
                  <Hash className="w-5 h-5" />
                  Discord User ID
                </label>
                <input
                  type="text"
                  value={discordUserId}
                  onChange={(e) => setDiscordUserId(e.target.value)}
                  placeholder="Enter your Discord User ID"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-void-purple-100 placeholder-void-purple-400 focus:outline-none focus:border-void-purple-400 focus:bg-white/10 transition-all duration-300"
                  pattern="\d{17,19}"
                  required
                />
                <p className="text-void-purple-400 text-sm mt-2">
                  17-19 digit number. Right-click your profile in Discord → Copy User ID
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !discordUsername || !discordUserId}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Verify Membership
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Verification Result */}
        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`gradient-border p-1 ${
              verificationResult.success && verificationResult.isMember 
                ? 'border-green-500/50' 
                : 'border-red-500/50'
            }`}>
              <div className={`glass-card p-6 ${
                verificationResult.success && verificationResult.isMember
                  ? 'bg-green-500/5'
                  : 'bg-red-500/5'
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-xl ${
                    verificationResult.success && verificationResult.isMember
                      ? 'bg-green-500/20'
                      : 'bg-red-500/20'
                  }`}>
                    {verificationResult.success && verificationResult.isMember ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-2 ${
                      verificationResult.success && verificationResult.isMember
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                      {verificationResult.success && verificationResult.isMember
                        ? 'Verification Successful!'
                        : 'Verification Failed'
                      }
                    </h3>
                    
                    <p className="text-void-purple-200 leading-relaxed">
                      {verificationResult.message}
                    </p>

                    {verificationResult.success && verificationResult.isMember && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mt-6"
                      >
                        <Link href="/quiz" className="btn-primary w-full inline-flex items-center justify-center">
                          <span className="flex items-center gap-2">
                            Take Certification Quiz
                            <ArrowRight className="w-5 h-5" />
                          </span>
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <p className="text-void-purple-300 mb-4">
            Need help finding your Discord User ID?
          </p>
          
          <div className="glass-card p-6 text-left max-w-md mx-auto">
            <h4 className="text-void-purple-200 font-semibold mb-3">How to find your User ID:</h4>
            <ol className="space-y-2 text-void-purple-300 text-sm">
              <li>1. Go to Discord Settings</li>
              <li>2. Go to "Advanced" section</li>
              <li>3. Enable "Developer Mode"</li>
              <li>4. Right-click your profile and select "Copy User ID"</li>
            </ol>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
