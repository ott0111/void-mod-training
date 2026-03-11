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
      question: "What is the primary purpose of a General Ticket?",
      options: [
        "User applications for joining Void Esports",
        "Community support inquiries and reporting issues",
        "Staff internal communications",
        "Tournament registrations"
      ],
      correct: 1,
      category: "Ticket Types"
    },
    {
      question: "How should you handle a Roster Ticket?",
      options: [
        "Direct them to the tournament team",
        "Include age verification and direct to appropriate resources",
        "Immediately assign roles without verification",
        "Escalate to senior staff only"
      ],
      correct: 1,
      category: "Ticket Types"
    },
    {
      question: "What should all ticket responses begin with?",
      options: [
        "Informal greetings like 'Yo' or 'Bro'",
        "Professional greeting and age inquiry",
        "Immediate role assignment",
        "A warning about rules"
      ],
      correct: 1,
      category: "Ticket Types"
    },
    {
      question: "What Power Ranking is required for Pro Roster?",
      options: ["10,000+", "15,000+", "25,000+", "50,000+"],
      correct: 2,
      category: "Roster Categories"
    },
    {
      question: "What earnings threshold is required for Pro Roster?",
      options: ["$500+", "No earnings required", "$1,000+", "$5,000+"],
      correct: 2,
      category: "Roster Categories"
    },
    {
      question: "Where should /warn commands be used exclusively?",
      options: [
        "In direct messages to users",
        "In #staff-commands channel",
        "In public channels",
        "In #general channel"
      ],
      correct: 1,
      category: "Mod Commands"
    },
    {
      question: "When should you use /report instead of /warn?",
      options: [
        "For all infractions",
        "Only for minor rule violations",
        "For major or repeated infractions",
        "Never use /report"
      ],
      correct: 2,
      category: "Mod Commands"
    },
    {
      question: "What is the minimum weekly ticket requirement?",
      options: ["5 tickets", "10 tickets", "20 tickets", "50 tickets"],
      correct: 2,
      category: "Performance Metrics"
    },
    {
      question: "How many messages are required weekly?",
      options: ["100", "200", "400", "1000"],
      correct: 2,
      category: "Performance Metrics"
    },
    {
      question: "What type of greetings should be avoided?",
      options: [
        "Professional greetings",
        "Friendly greetings",
        "Informal responses like 'Yo', 'Hi', 'Bro'",
        "Polite inquiries"
      ],
      correct: 2,
      category: "Guidelines"
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
      <div className="max-w-4xl mx-auto">
        <div className="glass-card-lg p-8">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Question {currentQuestion + 1} of {quiz.length}</span>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-void-purple-400" />
                <span className={`text-sm font-medium ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-void-purple-400'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-void-purple-600 to-void-purple-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <div className="mb-4">
              <span className="text-sm text-void-purple-400 font-medium">{question.category}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-6">{question.question}</h2>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectAnswer(index)}
                  className={`quiz-option w-full text-left p-4 ${
                    answers[currentQuestion] === index ? 'selected' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      answers[currentQuestion] === index
                        ? 'border-void-purple-400 bg-void-purple-400'
                        : 'border-gray-400'
                    }`}>
                      {answers[currentQuestion] === index && (
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                          <div className="w-2 h-2 bg-void-purple-600 rounded-full" />
                        </div>
                      )}
                    </div>
                    <span className="text-white">{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              className="glass-card px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
            >
              Previous
            </button>
            
            <div className="flex space-x-2">
              {quiz.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentQuestion
                      ? 'bg-void-purple-400'
                      : answers[index] !== null
                      ? 'bg-void-purple-600'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextQuestion}
              disabled={answers[currentQuestion] === null}
              className="neon-button px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestion === quiz.length - 1 ? 'Submit' : 'Next'}
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
