'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Clock, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, RotateCcw, Trophy, X } from 'lucide-react'
import Link from 'next/link'

interface QuizQuestion {
  id: string
  questionNumber: number
  question: string
  options: string[]
  category: string
  difficulty: string
}

interface QuizAttempt {
  attemptId: string
  questions: QuizQuestion[]
  answers: number[]
  currentQuestion: number
  isCompleted: boolean
  startTime: Date
}

export default function QuizPage() {
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [quizResult, setQuizResult] = useState<any>(null)

  useEffect(() => {
    // Check if user is verified (in a real app, this would check session/localStorage)
    startQuiz()
  }, [])

  const startQuiz = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'temp-user-id', // This would come from authentication
          discordUserId: 'temp-discord-id', // This would come from verification
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setQuizAttempt({
          attemptId: result.data.attemptId,
          questions: result.data.questions,
          answers: new Array(result.data.questions.length).fill(-1),
          currentQuestion: 0,
          isCompleted: false,
          startTime: new Date(),
        })
      }
    } catch (error) {
      console.error('Error starting quiz:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerSelect = async (answerIndex: number) => {
    if (!quizAttempt) return

    setSelectedAnswer(answerIndex)
    
    try {
      const response = await fetch('/api/quiz/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attemptId: quizAttempt.attemptId,
          questionIndex: quizAttempt.currentQuestion,
          answer: answerIndex,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        const newAnswers = [...quizAttempt.answers]
        newAnswers[quizAttempt.currentQuestion] = answerIndex
        
        setQuizAttempt({
          ...quizAttempt,
          answers: newAnswers,
        })
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
    }
  }

  const nextQuestion = () => {
    if (!quizAttempt) return
    
    if (quizAttempt.currentQuestion < quizAttempt.questions.length - 1) {
      setQuizAttempt({
        ...quizAttempt,
        currentQuestion: quizAttempt.currentQuestion + 1,
      })
      setSelectedAnswer(quizAttempt.answers[quizAttempt.currentQuestion + 1])
    } else {
      completeQuiz()
    }
  }

  const previousQuestion = () => {
    if (!quizAttempt) return
    
    if (quizAttempt.currentQuestion > 0) {
      setQuizAttempt({
        ...quizAttempt,
        currentQuestion: quizAttempt.currentQuestion - 1,
      })
      setSelectedAnswer(quizAttempt.answers[quizAttempt.currentQuestion - 1])
    }
  }

  const completeQuiz = async () => {
    if (!quizAttempt) return

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/quiz/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attemptId: quizAttempt.attemptId,
          answers: quizAttempt.answers,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setQuizResult(result.data)
        setShowResult(true)
        setQuizAttempt({
          ...quizAttempt,
          isCompleted: true,
        })
      }
    } catch (error) {
      console.error('Error completing quiz:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const restartQuiz = () => {
    setQuizAttempt(null)
    setShowResult(false)
    setQuizResult(null)
    setSelectedAnswer(null)
    startQuiz()
  }

  if (isLoading && !quizAttempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 border-4 border-void-purple-500/30 border-t-void-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-void-purple-200 text-lg">Loading quiz...</p>
        </motion.div>
      </div>
    )
  }

  if (showResult && quizResult) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="absolute inset-0 bg-grid opacity-20" />
        
        <motion.div 
          className="relative z-10 max-w-4xl w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Result Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-6 shadow-void-glow-xl ${
              quizResult.result.passed
                ? 'bg-gradient-to-br from-green-500 to-green-600'
                : 'bg-gradient-to-br from-red-500 to-red-600'
            }`}>
              {quizResult.result.passed ? (
                <Trophy className="w-12 h-12 text-white" />
              ) : (
                <X className="w-12 h-12 text-white" />
              )}
            </div>
            
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
              quizResult.result.passed
                ? 'text-green-400'
                : 'text-red-400'
            }`}>
              {quizResult.result.passed ? 'Certification Passed!' : 'Certification Failed'}
            </h1>
            
            <p className="text-xl text-void-purple-200 leading-relaxed">
              {quizResult.result.passed
                ? 'Congratulations! You have successfully passed the moderator certification.'
                : 'You did not pass this time. Review the materials and try again.'}
            </p>
          </motion.div>

          {/* Score Details */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="gradient-border p-1">
              <div className="glass-card p-6 text-center">
                <div className="text-3xl font-bold text-void-purple-300 mb-2">
                  {quizResult.result.score}/{quizResult.result.totalQuestions}
                </div>
                <div className="text-void-purple-400 text-sm">Score</div>
              </div>
            </div>
            
            <div className="gradient-border p-1">
              <div className="glass-card p-6 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {quizResult.result.correctAnswers}
                </div>
                <div className="text-void-purple-400 text-sm">Correct</div>
              </div>
            </div>
            
            <div className="gradient-border p-1">
              <div className="glass-card p-6 text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">
                  {quizResult.result.incorrectAnswers}
                </div>
                <div className="text-void-purple-400 text-sm">Incorrect</div>
              </div>
            </div>
            
            <div className="gradient-border p-1">
              <div className="glass-card p-6 text-center">
                <div className="text-3xl font-bold text-void-purple-300 mb-2">
                  {Math.floor(quizResult.result.timeSpent / 60)}m {quizResult.result.timeSpent % 60}s
                </div>
                <div className="text-void-purple-400 text-sm">Time</div>
              </div>
            </div>
          </motion.div>

          {/* Question Review */}
          <motion.div 
            className="gradient-border p-1 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-void-purple-100 mb-6">Question Review</h2>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {quizResult.review.map((question: any, index: number) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border ${
                      question.isCorrect
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1 rounded-lg ${
                        question.isCorrect
                          ? 'bg-green-500/20'
                          : 'bg-red-500/20'
                      }`}>
                        {question.isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-void-purple-200 font-medium mb-2">
                          Question {question.questionNumber}: {question.question}
                        </p>
                        
                        <div className="text-sm text-void-purple-300 space-y-1">
                          <p>Your answer: <span className={question.isCorrect ? 'text-green-400' : 'text-red-400'}>{question.options[question.userAnswer]}</span></p>
                          {!question.isCorrect && (
                            <p>Correct answer: <span className="text-green-400">{question.options[question.correctAnswer]}</span></p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {quizResult.result.passed ? (
              <Link href="/" className="btn-primary">
                <span className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Back to Home
                </span>
              </Link>
            ) : (
              <button onClick={restartQuiz} className="btn-primary">
                <span className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5" />
                  Retry Quiz
                </span>
              </button>
            )}
            
            <Link href="/training" className="btn-secondary">
              <span className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Review Training
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  if (!quizAttempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-void-purple-200 text-lg">Unable to load quiz</p>
          <Link href="/" className="btn-primary mt-4 inline-block">
            Back to Home
          </Link>
        </motion.div>
      </div>
    )
  }

  const currentQuestion = quizAttempt.questions[quizAttempt.currentQuestion]
  const progress = ((quizAttempt.currentQuestion + 1) / quizAttempt.questions.length) * 100

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 bg-grid opacity-20" />
      
      <motion.div 
        className="relative z-10 max-w-4xl w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Progress Bar */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-void-purple-300 font-medium">
              Question {quizAttempt.currentQuestion + 1} of {quizAttempt.questions.length}
            </span>
            <span className="text-void-purple-300 font-medium">
              {Math.round(progress)}% Complete
            </span>
          </div>
          
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-void-purple-500 to-void-purple-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Question Card */}
        <motion.div 
          className="gradient-border p-1 mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-void-purple-500 to-void-purple-600 rounded-xl flex items-center justify-center shadow-void-glow">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-void-purple-400 mb-1">
                  <span className="px-2 py-1 bg-white/10 rounded-lg">
                    {currentQuestion.category.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="px-2 py-1 bg-white/10 rounded-lg">
                    {currentQuestion.difficulty.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-void-purple-100">
                  {currentQuestion.question}
                </h2>
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              <AnimatePresence>
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 rounded-xl border text-left transition-all duration-300 ${
                      selectedAnswer === index
                        ? 'bg-void-purple-500/20 border-void-purple-400 shadow-void-glow'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswer === index
                          ? 'border-void-purple-400 bg-void-purple-400'
                          : 'border-white/30'
                      }`}>
                        {selectedAnswer === index && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-void-purple-100 font-medium">
                        {option}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <button
            onClick={previousQuestion}
            disabled={quizAttempt.currentQuestion === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Previous
            </span>
          </button>

          <button
            onClick={nextQuestion}
            disabled={selectedAnswer === null}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              {quizAttempt.currentQuestion === quizAttempt.questions.length - 1 ? 'Complete Quiz' : 'Next'}
              <ArrowRight className="w-5 h-5" />
            </span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
