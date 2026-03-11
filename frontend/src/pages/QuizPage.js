import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { quizService } from '../services/supabase';

const QuizPage = ({ user }) => {
  const [quizState, setQuizState] = useState('intro'); // intro, quiz, results, cooldown
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [cooldownInfo, setCooldownInfo] = useState(null);

  const quizQuestions = [
    {
      question: "A user submits a roster ticket but is under 13 years old. What is the FIRST action you should take and what should you offer them as an alternative?",
      keywords: ["politely", "inform", "don't qualify", "suggest", "grinder+", "under 13", "alternative"],
      category: "Ticket Types",
      points: 10
    },
    {
      question: "Which command should be used when a user repeatedly violates community guidelines after multiple warnings? Explain your reasoning and what the command does.",
      keywords: ["/report", "repeated", "violations", "staff review", "major", "infractions"],
      category: "Mod Commands",
      points: 10
    },
    {
      question: "A user applies for Pro Roster with 24,000 Power Ranking but only $800 in earnings. What are the exact requirements they need to meet and what should you tell them?",
      keywords: ["25,000", "1,000", "both", "earnings", "power ranking", "requirements"],
      category: "Roster Categories",
      points: 10
    },
    {
      question: "Write the exact response you should give when a user applies for Content Creator role. Include the department that should review their application.",
      keywords: ["perfect", "link", "social media", "content department", "review", "shortly"],
      category: "Role Instructions",
      points: 10
    },
    {
      question: "A user has been inactive for 2 weeks and wants to return. What should you check first before restoring their roles and why?",
      keywords: ["loa", "leave of application", "performance", "before departure", "check", "status"],
      category: "Performance Metrics",
      points: 10
    },
    {
      question: "What is the most appropriate greeting for a general support ticket? Write out the exact greeting you would use.",
      keywords: ["hi there", "how may i help", "today", "professional", "greeting"],
      category: "Guidelines",
      points: 10
    },
    {
      question: "A user claims to be a coach but can't provide student success stories. What should you ask for instead and why is verifiable proof important?",
      keywords: ["verifiable", "student", "results", "success stories", "proof", "important"],
      category: "Role Instructions",
      points: 10
    },
    {
      question: "What is the minimum weekly message requirement for moderators and why is this requirement important for community engagement?",
      keywords: ["400", "messages", "minimum", "weekly", "engagement", "community"],
      category: "Performance Metrics",
      points: 10
    },
    {
      question: "In what specific situations should you use the /report command instead of /warn? Give at least two examples of when escalation is necessary.",
      keywords: ["major", "repeated", "infractions", "staff review", "escalation", "necessary"],
      category: "Mod Commands",
      points: 10
    },
    {
      question: "What are the quality requirements for Void VFX submissions and what should you tell a user who submits 1080p work?",
      keywords: ["1440p", "higher", "quality", "void vfx", "requirements", "1080p"],
      category: "Roster Categories",
      points: 10
    }
  ];

  useEffect(() => {
    if (!user) {
      setQuizState('needsAuth');
      return;
    }

    checkRetakeEligibility();
  }, [user]);

  useEffect(() => {
    if (quizState === 'quiz' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizState === 'quiz') {
      handleSubmitQuiz();
    }
  }, [timeLeft, quizState]);

  const checkRetakeEligibility = async () => {
    try {
      const canRetake = await quizService.canRetakeQuiz(user.id);
      
      if (!canRetake.canRetake) {
        setCooldownInfo(canRetake);
        setQuizState('cooldown');
      }
    } catch (error) {
      console.error('Error checking retake eligibility:', error);
    }
  };

  const startQuiz = () => {
    // Shuffle questions
    const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5);
    setQuiz(shuffled);
    setAnswers(new Array(shuffled.length).fill(null));
    setCurrentQuestion(0);
    setTimeLeft(600);
    setQuizState('quiz');
  };

  const selectAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    
    try {
      // Calculate score based on keyword matching
      let totalScore = 0;
      const questionResults = [];
      
      answers.forEach((answer, index) => {
        if (index < quiz.length && answer) {
          const question = quiz[index];
          const keywords = question.keywords || [];
          const answerText = answer.toLowerCase();
          
          // Count how many keywords are found in the answer
          const matchedKeywords = keywords.filter(keyword => 
            answerText.includes(keyword.toLowerCase())
          );
          
          // Calculate score based on keyword matches
          const keywordScore = matchedKeywords.length;
          const maxKeywords = keywords.length;
          const questionScore = Math.round((keywordScore / maxKeywords) * question.points);
          
          totalScore += questionScore;
          
          questionResults.push({
            questionId: question.id,
            question: question.question,
            userAnswer: answer,
            keywords: keywords,
            matchedKeywords: matchedKeywords,
            score: questionScore,
            maxScore: question.points,
            isCorrect: keywordScore >= (maxKeywords * 0.6), // 60% of keywords needed to pass
            category: question.category
          });
        }
      });

      const maxTotalScore = quiz.reduce((sum, q) => sum + q.points, 0);
      const passed = totalScore >= (maxTotalScore * 0.7); // 70% to pass
      
      // Submit to backend (if available)
      if (user) {
        await quizService.submitQuiz(user.id, answers, 'long-answer-quiz');
      }

      setResults({
        score: totalScore,
        total: maxTotalScore,
        passed,
        percentage: Math.round((totalScore / maxTotalScore) * 100),
        questionResults,
        categoryBreakdown: calculateCategoryBreakdown(questionResults)
      });

      setQuizState('results');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Still show results even if backend fails
      setResults({
        score: 0,
        total: quiz.reduce((sum, q) => sum + q.points, 0),
        passed: false,
        percentage: 0
      });
      setQuizState('results');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateCategoryBreakdown = (results) => {
    const breakdown = {};
    results.forEach(result => {
      if (!breakdown[result.category]) {
        breakdown[result.category] = { total: 0, correct: 0 };
      }
      breakdown[result.category].total++;
      if (result.isCorrect) {
        breakdown[result.category].correct++;
      }
    });
    return breakdown;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const resetQuiz = () => {
    setQuiz(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setTimeLeft(600);
    setResults(null);
    setQuizState('intro');
  };

  if (quizState === 'needsAuth') {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="glass-card-lg p-8">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold gradient-text mb-4">Authentication Required</h2>
          <p className="text-gray-300 mb-6">
            You need to be logged in to take the certification quiz.
          </p>
          <button className="neon-button">
            Login with Discord
          </button>
        </div>
      </div>
    );
  }

  if (quizState === 'cooldown') {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="glass-card-lg p-8">
          <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse-slow" />
          <h2 className="text-3xl font-bold gradient-text mb-4">Quiz Cooldown Active</h2>
          <p className="text-gray-300 mb-4">
            {cooldownInfo?.reason || 'You need to wait before retaking the quiz.'}
          </p>
          {cooldownInfo?.nextAttemptAllowed && (
            <p className="text-void-purple-400">
              Next attempt available: {new Date(cooldownInfo.nextAttemptAllowed).toLocaleString()}
            </p>
          )}
          <button 
            onClick={() => window.history.back()}
            className="glass-card px-6 py-3 mt-6 hover:scale-105 transition-transform"
          >
            Back to Training
          </button>
        </div>
      </div>
    );
  }

  if (quizState === 'intro') {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-lg p-8 text-center ambient-glow"
        >
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-void-purple-600 to-void-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-4">Moderator Certification Quiz</h1>
            <p className="text-xl text-gray-300 mb-6">
              Test your knowledge and become a certified Void Esports moderator
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-4">
              <h3 className="text-lg font-semibold text-void-purple-400 mb-2">10 Questions</h3>
              <p className="text-sm text-gray-400">Multiple choice format</p>
            </div>
            <div className="glass-card p-4">
              <h3 className="text-lg font-semibold text-void-purple-400 mb-2">10 Minutes</h3>
              <p className="text-sm text-gray-400">Time limit</p>
            </div>
            <div className="glass-card p-4">
              <h3 className="text-lg font-semibold text-void-purple-400 mb-2">7 to Pass</h3>
              <p className="text-sm text-gray-400">70% passing score</p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={startQuiz}
              className="neon-button w-full text-lg px-8 py-4"
            >
              Start Quiz
            </button>
            <p className="text-sm text-gray-400">
              Make sure you've reviewed all training materials before starting
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (quizState === 'quiz' && quiz) {
    const question = quiz[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.length) * 100;

    return (
      <div className="max-w-5xl mx-auto">
        <div className="glass-card-lg p-8 relative overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-void-purple-600/5 via-transparent to-void-purple-400/5 pointer-events-none" />
          
          {/* Progress Section */}
          <div className="mb-8 relative">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-sm font-medium text-gray-400">Question</div>
                <div className="text-2xl font-bold gradient-text">
                  {currentQuestion + 1} <span className="text-gray-400">of {quiz.length}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className={`w-5 h-5 ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-void-purple-400'}`} />
                <span className={`text-lg font-mono font-medium ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-void-purple-400'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="progress-bar h-4 relative">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-void-purple-600 to-void-purple-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-white/80">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.5
            }}
            className="mb-8"
          >
            <div className="glass-card-lg p-8 text-center relative">
              {/* Category Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-void-purple-600/20 to-void-purple-500/20 border border-void-purple-400/30 mb-6">
                <span className="text-sm font-medium text-void-purple-300">{question.category}</span>
              </div>
              
              {/* Question Text */}
              <h2 className="text-3xl font-bold text-white mb-8 leading-relaxed">
                {question.question}
              </h2>
            </div>
          </motion.div>

          {/* Answer Input */}
          <div className="mb-8">
            <div className="glass-card-lg p-8">
              <div className="mb-4">
                <label className="block text-lg font-medium text-void-purple-300 mb-2">
                  Your Answer:
                </label>
                <p className="text-sm text-gray-400 mb-4">
                  Provide a detailed answer. The system will check for specific keywords and concepts.
                </p>
              </div>
              
              <textarea
                value={answers[currentQuestion] || ''}
                onChange={(e) => selectAnswer(e.target.value)}
                placeholder="Type your detailed answer here..."
                className="w-full h-32 p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-void-purple-400 focus:bg-white/10 transition-all duration-300 resize-none"
                style={{
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                }}
              />
              
              {/* Character count */}
              <div className="mt-2 text-right">
                <span className="text-sm text-gray-400">
                  {answers[currentQuestion]?.length || 0} characters
                </span>
              </div>
              
              {/* Keywords hint */}
              <div className="mt-4 p-3 bg-void-purple-600/10 border border-void-purple-400/20 rounded-lg">
                <p className="text-sm text-void-purple-300 mb-2">
                  💡 Key concepts to include:
                </p>
                <div className="flex flex-wrap gap-2">
                  {question.keywords.slice(0, 4).map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-void-purple-500/20 border border-void-purple-400/30 rounded text-xs text-void-purple-200"
                    >
                      {keyword}
                    </span>
                  ))}
                  {question.keywords.length > 4 && (
                    <span className="px-2 py-1 bg-void-purple-500/20 border border-void-purple-400/30 rounded text-xs text-void-purple-200">
                      +{question.keywords.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              className="glass-card px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>
            
            {/* Question Dots */}
            <div className="flex space-x-3">
              {quiz.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentQuestion
                      ? 'bg-void-purple-400 shadow-void-glow scale-125'
                      : answers[index] && answers[index].trim().length > 0
                      ? 'bg-void-purple-600/60 hover:bg-void-purple-600/80'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                />
              ))}
            </div>

            <button
              onClick={nextQuestion}
              disabled={!answers[currentQuestion] || answers[currentQuestion].trim().length < 10}
              className="neon-button px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-lg font-semibold"
            >
              <span>{currentQuestion === quiz.length - 1 ? 'Submit Quiz' : 'Next'}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizState === 'results' && results) {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card-lg p-8 text-center ambient-glow"
        >
          <div className="mb-6">
            {results.passed ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h1 className="text-4xl font-bold gradient-text mb-4">Congratulations!</h1>
                <p className="text-xl text-gray-300 mb-2">
                  You've passed the moderator certification quiz!
                </p>
                <p className="text-void-purple-400">
                  Your Discord roles will be assigned shortly.
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h1 className="text-4xl font-bold gradient-text mb-4">Not Quite There</h1>
                <p className="text-xl text-gray-300 mb-2">
                  You scored {results.score} out of {results.total}
                </p>
                <p className="text-red-400">
                  You need 7 correct answers to pass. Try again after reviewing the materials.
                </p>
              </>
            )}
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-void-purple-400 mb-4">Score Breakdown</h3>
              <div className="space-y-2">
                {results.categoryBreakdown && Object.entries(results.categoryBreakdown).map(([category, stats]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-gray-300">{category}</span>
                    <span className="text-void-purple-400">
                      {stats.correct}/{stats.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-void-purple-400 mb-4">Performance</h3>
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">
                  {Math.round((results.score / results.total) * 100)}%
                </div>
                <p className="text-gray-300">
                  {results.passed ? 'Passing Score' : 'Below Passing Score'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {results.passed ? (
              <button
                onClick={() => window.location.href = '/certification'}
                className="neon-button w-full text-lg px-8 py-4"
              >
                View Certification
              </button>
            ) : (
              <button
                onClick={resetQuiz}
                className="glass-card w-full px-6 py-3 hover:scale-105 transition-transform flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Review and Retake</span>
              </button>
            )}
            
            <button
              onClick={() => window.location.href = '/training'}
              className="glass-card w-full px-6 py-3 hover:scale-105 transition-transform"
            >
              Back to Training
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default QuizPage;
