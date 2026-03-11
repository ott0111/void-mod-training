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
      question: "A user submits a roster ticket but is under 13 years old. What is the FIRST action you should take?",
      options: [
        "Immediately assign them to Grinder+ role",
        "Politely inform them they don't qualify and suggest Grinder+",
        "Ask for parental permission to proceed",
        "Forward to senior staff for age verification exception"
      ],
      correct: 1,
      category: "Ticket Types"
    },
    {
      question: "Which command should be used when a user repeatedly violates community guidelines after multiple warnings?",
      options: [
        "/warn @user Repeated violations",
        "/report @user Repeated rule violations - needs staff review",
        "/ban @user Repeated violations",
        "/kick @user Final warning"
      ],
      correct: 1,
      category: "Mod Commands"
    },
    {
      question: "A user applies for Pro Roster with 24,000 Power Ranking but only $800 in earnings. What should you do?",
      options: [
        "Accept them since they're close to the PR requirement",
        "Reject them immediately for not meeting earnings threshold",
        "Inform them they need both 25,000+ PR AND $1,000+ earnings",
        "Ask them to provide additional tournament results"
      ],
      correct: 2,
      category: "Roster Categories"
    },
    {
      question: "What is the correct response format when a user applies for Content Creator role?",
      options: [
        "Show me your social media accounts now",
        "Perfect! Please link your social media accounts below and @Content Department will review them shortly!",
        "You need 1k followers on Twitch/YouTube and 10k on TikTok",
        "Let me check your follower count real quick"
      ],
      correct: 1,
      category: "Role Instructions"
    },
    {
      question: "A user has been inactive for 2 weeks and wants to return. What should you do?",
      options: [
        "Welcome them back and restore their roles immediately",
        "Check their LOA status and performance before departure",
        "Require them to retake the certification quiz",
        "Ask them to reapply from scratch"
      ],
      correct: 1,
      category: "Performance Metrics"
    },
    {
      question: "Which greeting is MOST appropriate for a general support ticket?",
      options: [
        "Yo what's up?",
        "Hi there, how may I help you today?",
        "Sup bro, need help?",
        "What do you want?"
      ],
      correct: 1,
      category: "Guidelines"
    },
    {
      question: "A user claims to be a coach but can't provide student success stories. What should you do?",
      options: [
        "Accept them anyway since coaching is subjective",
        "Ask for alternative proof like coaching methodology",
        "Politely explain they need verifiable student results",
        "Give them a trial period to prove their coaching ability"
      ],
      correct: 2,
      category: "Role Instructions"
    },
    {
      question: "What is the MINIMUM weekly message requirement for moderators?",
      options: [
        "100 messages per week",
        "200 messages per week", 
        "400 messages per week",
        "500 messages per week"
      ],
      correct: 2,
      category: "Performance Metrics"
    },
    {
      question: "When should you use the /report command instead of /warn?",
      options: [
        "For all rule violations",
        "Only for spam messages",
        "For major or repeated infractions that need staff review",
        "Never - always use /warn"
      ],
      correct: 2,
      category: "Mod Commands"
    },
    {
      question: "A user wants to join Void VFX but their work is 1080p. What should you tell them?",
      options: [
        "1080p is fine, send your portfolio",
        "We need 1440p or higher quality work for Void VFX",
        "Let me make an exception for you",
        "Try Void GFX instead"
      ],
      correct: 1,
      category: "Roster Categories"
    },
    {
      question: "What is the proper format for documenting an LOA (Leave of Application)?",
      options: [
        "User: Name, Reason: Away, Time: 1 week",
        "User : ———-, Role : ———-, Start Time : ———-, End Time : ———-, Reason : ———-",
        "LOA: User away from date to date",
        "Away: User, Role, Dates, Reason"
      ],
      correct: 1,
      category: "Mod Commands"
    },
    {
      question: "A user applies for Academy Roster with 4,500 Power Ranking. What should you do?",
      options: [
        "Accept them since they're close to 5,000",
        "Reject them for not meeting the 5,000+ PR requirement",
        "Ask them to provide recent gameplay showing improvement",
        "Place them in trial academy to evaluate"
      ],
      correct: 1,
      category: "Roster Categories"
    },
    {
      question: "Which of these is NOT a valid reason to immediately escalate a ticket to senior staff?",
      options: [
        "User threatening self-harm",
        "User reporting a bug in the system",
        "User harassing other members",
        "User attempting to exploit the system"
      ],
      correct: 1,
      category: "Guidelines"
    },
    {
      question: "What should you do if a user disputes their quiz results?",
      options: [
        "Ignore their dispute - the system is always correct",
        "Review their specific answers and provide feedback",
        "Immediately let them retake the quiz",
        "Forward to admin for manual review"
      ],
      correct: 1,
      category: "Performance Metrics"
    },
    {
      question: "A Streamer applicant has 800 followers on Twitch but 15k on TikTok. Do they qualify?",
      options: [
        "Yes - TikTok followers count more",
        "No - they need 1,000+ on Twitch/YouTube specifically",
        "Yes - combined followers exceed requirements",
        "No - they need both platform requirements"
      ],
      correct: 1,
      category: "Roster Categories"
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

  const selectAnswer = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
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
      // Calculate score
      let correctCount = 0;
      const questionResults = quiz.map((question, index) => {
        const isCorrect = answers[index] === question.correct;
        if (isCorrect) correctCount++;
        return {
          question: question.question,
          userAnswer: answers[index],
          correctAnswer: question.correct,
          isCorrect,
          category: question.category
        };
      });

      const passed = correctCount >= 7; // 7 out of 10 to pass
      const score = correctCount;

      // Submit to backend (if available)
      if (user) {
        await quizService.submitQuiz(user.id, answers, 'internal-quiz');
      }

      setResults({
        score,
        total: quiz.length,
        passed,
        questionResults,
        categoryBreakdown: calculateCategoryBreakdown(questionResults)
      });

      setQuizState('results');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Still show results even if backend fails
      const correctCount = answers.filter((answer, index) => answer === quiz[index].correct).length;
      setResults({
        score: correctCount,
        total: quiz.length,
        passed: correctCount >= 7
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

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {question.options.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => selectAnswer(index)}
                  className={`quiz-option w-full text-left p-6 relative group ${
                    answers[currentQuestion] === index ? 'selected' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Option Indicator */}
                    <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                      answers[currentQuestion] === index
                        ? 'border-void-purple-400 bg-void-purple-400'
                        : 'border-gray-400 group-hover:border-void-purple-400'
                    }`}>
                      {answers[currentQuestion] === index && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-white rounded-full"
                        />
                      )}
                    </div>
                    
                    {/* Option Text */}
                    <span className="text-lg text-white group-hover:text-void-purple-200 transition-colors">
                      {option}
                    </span>
                  </div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-void-purple-600/10 to-void-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </motion.div>
            ))}
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
                      : answers[index] !== null
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
              disabled={answers[currentQuestion] === null}
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
