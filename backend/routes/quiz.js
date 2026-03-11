const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Quiz questions database (in production, this would come from a database)
const quizQuestions = [
  {
    id: 1,
    category: "Ticket Types",
    question: "A user submits a roster ticket but is under 13 years old. What is the FIRST action you should take?",
    options: [
      "Immediately assign them to Grinder+ role",
      "Politely inform them they don't qualify and suggest Grinder+",
      "Ask for parental permission to proceed",
      "Forward to senior staff for age verification exception"
    ],
    correct: 1
  },
  {
    id: 2,
    category: "Mod Commands",
    question: "Which command should be used when a user repeatedly violates community guidelines after multiple warnings?",
    options: [
      "/warn @user Repeated violations",
      "/report @user Repeated rule violations - needs staff review",
      "/ban @user Repeated violations",
      "/kick @user Final warning"
    ],
    correct: 1
  },
  {
    id: 3,
    category: "Roster Categories",
    question: "A user applies for Pro Roster with 24,000 Power Ranking but only $800 in earnings. What should you do?",
    options: [
      "Accept them since they're close to the PR requirement",
      "Reject them immediately for not meeting earnings threshold",
      "Inform them they need both 25,000+ PR AND $1,000+ earnings",
      "Ask them to provide additional tournament results"
    ],
    correct: 2
  },
  {
    id: 4,
    category: "Role Instructions",
    question: "What is the correct response format when a user applies for Content Creator role?",
    options: [
      "Show me your social media accounts now",
      "Perfect! Please link your social media accounts below and @Content Department will review them shortly!",
      "You need 1k followers on Twitch/YouTube and 10k on TikTok",
      "Let me check your follower count real quick"
    ],
    correct: 1
  },
  {
    id: 5,
    category: "Performance Metrics",
    question: "A user has been inactive for 2 weeks and wants to return. What should you do?",
    options: [
      "Welcome them back and restore their roles immediately",
      "Check their LOA status and performance before departure",
      "Require them to retake the certification quiz",
      "Ask them to reapply from scratch"
    ],
    correct: 1
  },
  {
    id: 6,
    category: "Guidelines",
    question: "Which greeting is MOST appropriate for a general support ticket?",
    options: [
      "Yo what's up?",
      "Hi there, how may I help you today?",
      "Sup bro, need help?",
      "What do you want?"
    ],
    correct: 1
  },
  {
    id: 7,
    category: "Role Instructions",
    question: "A user claims to be a coach but can't provide student success stories. What should you do?",
    options: [
      "Accept them anyway since coaching is subjective",
      "Ask for alternative proof like coaching methodology",
      "Politely explain they need verifiable student results",
      "Give them a trial period to prove their coaching ability"
    ],
    correct: 2
  },
  {
    id: 8,
    category: "Performance Metrics",
    question: "What is the MINIMUM weekly message requirement for moderators?",
    options: [
      "100 messages per week",
      "200 messages per week", 
      "400 messages per week",
      "500 messages per week"
    ],
    correct: 2
  },
  {
    id: 9,
    category: "Mod Commands",
    question: "When should you use the /report command instead of /warn?",
    options: [
      "For all rule violations",
      "Only for spam messages",
      "For major or repeated infractions that need staff review",
      "Never - always use /warn"
    ],
    correct: 2
  },
  {
    id: 10,
    category: "Roster Categories",
    question: "A user wants to join Void VFX but their work is 1080p. What should you tell them?",
    options: [
      "1080p is fine, send your portfolio",
      "We need 1440p or higher quality work for Void VFX",
      "Let me make an exception for you",
      "Try Void GFX instead"
    ],
    correct: 1
  },
  {
    id: 11,
    category: "Mod Commands",
    question: "What is the proper format for documenting an LOA (Leave of Application)?",
    options: [
      "User: Name, Reason: Away, Time: 1 week",
      "User : ———-, Role : ———-, Start Time : ———-, End Time : ———-, Reason : ———-",
      "LOA: User away from date to date",
      "Away: User, Role, Dates, Reason"
    ],
    correct: 1
  },
  {
    id: 12,
    category: "Roster Categories",
    question: "A user applies for Academy Roster with 4,500 Power Ranking. What should you do?",
    options: [
      "Accept them since they're close to 5,000",
      "Reject them for not meeting the 5,000+ PR requirement",
      "Ask them to provide recent gameplay showing improvement",
      "Place them in trial academy to evaluate"
    ],
    correct: 1
  },
  {
    id: 13,
    category: "Guidelines",
    question: "Which of these is NOT a valid reason to immediately escalate a ticket to senior staff?",
    options: [
      "User threatening self-harm",
      "User reporting a bug in the system",
      "User harassing other members",
      "User attempting to exploit the system"
    ],
    correct: 1
  },
  {
    id: 14,
    category: "Performance Metrics",
    question: "What should you do if a user disputes their quiz results?",
    options: [
      "Ignore their dispute - the system is always correct",
      "Review their specific answers and provide feedback",
      "Immediately let them retake the quiz",
      "Forward to admin for manual review"
    ],
    correct: 1
  },
  {
    id: 15,
    category: "Roster Categories",
    question: "A Streamer applicant has 800 followers on Twitch but 15k on TikTok. Do they qualify?",
    options: [
      "Yes - TikTok followers count more",
      "No - they need 1,000+ on Twitch/YouTube specifically",
      "Yes - combined followers exceed requirements",
      "No - they need both platform requirements"
    ],
    correct: 1
  }
];

// In-memory storage for demo (in production, use database)
const quizAttempts = new Map();
const userCooldowns = new Map();

// Generate quiz
router.post('/generate', (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Check cooldown
    const cooldown = userCooldowns.get(userId);
    if (cooldown && cooldown.nextAttempt > Date.now()) {
      return res.status(429).json({
        error: 'Quiz cooldown active',
        nextAttemptAllowed: new Date(cooldown.nextAttempt).toISOString()
      });
    }

    // Shuffle questions and select 10
    const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 10);

    // Randomize answer options
    const quizWithRandomizedOptions = selected.map(question => {
      const options = [...question.options];
      const correctAnswer = question.correct;
      
      // Shuffle options
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      
      // Find new correct answer index
      const newCorrect = options.indexOf(question.options[correctAnswer]);
      
      return {
        ...question,
        options,
        correct: newCorrect
      };
    });

    const quizId = uuidv4();
    
    res.json({
      success: true,
      quiz: {
        id: quizId,
        questions: quizWithRandomizedOptions,
        totalQuestions: quizWithRandomizedOptions.length,
        passingScore: 7,
        timeLimit: 600 // 10 minutes
      }
    });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// Submit quiz
router.post('/submit', (req, res) => {
  try {
    const { userId, quizId, answers, startTime } = req.body;
    
    if (!userId || !quizId || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid submission data' });
    }

    // Calculate score
    let correctCount = 0;
    const questionResults = [];
    
    // For demo, we'll use the first 10 questions
    const questions = quizQuestions.slice(0, 10);
    
    answers.forEach((answer, index) => {
      if (index < questions.length) {
        const question = questions[index];
        const isCorrect = answer === question.correct;
        if (isCorrect) correctCount++;
        
        questionResults.push({
          questionId: question.id,
          question: question.question,
          userAnswer: answer,
          correctAnswer: question.correct,
          isCorrect,
          category: question.category
        });
      }
    });

    const score = correctCount;
    const totalQuestions = Math.min(answers.length, questions.length);
    const passed = score >= 7;
    
    // Store attempt
    const attempt = {
      id: uuidv4(),
      userId,
      quizId,
      score,
      totalQuestions,
      passed,
      answers,
      questionResults,
      startTime,
      endTime: new Date().toISOString(),
      submittedAt: new Date().toISOString()
    };
    
    // Store in memory (in production, use database)
    if (!quizAttempts.has(userId)) {
      quizAttempts.set(userId, []);
    }
    quizAttempts.get(userId).push(attempt);
    
    // Set cooldown if failed
    if (!passed) {
      const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours
      userCooldowns.set(userId, {
        lastAttempt: Date.now(),
        nextAttempt: Date.now() + cooldownPeriod
      });
    }
    
    // Calculate category breakdown
    const categoryBreakdown = {};
    questionResults.forEach(result => {
      if (!categoryBreakdown[result.category]) {
        categoryBreakdown[result.category] = { total: 0, correct: 0 };
      }
      categoryBreakdown[result.category].total++;
      if (result.isCorrect) {
        categoryBreakdown[result.category].correct++;
      }
    });
    
    res.json({
      success: true,
      results: {
        score,
        totalQuestions,
        passed,
        passingScore: 7,
        questionResults,
        categoryBreakdown,
        timeTaken: Date.now() - new Date(startTime).getTime()
      }
    });
    
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// Get quiz history
router.get('/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const attempts = quizAttempts.get(userId) || [];
    
    res.json({
      success: true,
      history: attempts.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    });
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    res.status(500).json({ error: 'Failed to fetch quiz history' });
  }
});

// Check retake eligibility
router.get('/can-retake/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const cooldown = userCooldowns.get(userId);
    
    if (!cooldown) {
      return res.json({
        success: true,
        canRetake: true,
        nextAttemptAllowed: null
      });
    }
    
    const now = Date.now();
    const canRetake = now >= cooldown.nextAttempt;
    
    res.json({
      success: true,
      canRetake,
      nextAttemptAllowed: canRetake ? null : new Date(cooldown.nextAttempt).toISOString(),
      reason: canRetake ? null : 'Cooldown period active'
    });
  } catch (error) {
    console.error('Error checking retake eligibility:', error);
    res.status(500).json({ error: 'Failed to check retake eligibility' });
  }
});

// Get quiz statistics
router.get('/stats', (req, res) => {
  try {
    const allAttempts = Array.from(quizAttempts.values()).flat();
    const totalAttempts = allAttempts.length;
    const passedAttempts = allAttempts.filter(attempt => attempt.passed).length;
    const averageScore = totalAttempts > 0 
      ? allAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts 
      : 0;
    
    res.json({
      success: true,
      stats: {
        totalAttempts,
        passedAttempts,
        failedAttempts: totalAttempts - passedAttempts,
        passRate: totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0,
        averageScore: Math.round(averageScore * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error fetching quiz stats:', error);
    res.status(500).json({ error: 'Failed to fetch quiz statistics' });
  }
});

module.exports = router;
