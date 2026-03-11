const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Quiz questions database (in production, this would come from a database)
const quizQuestions = [
  {
    id: 1,
    category: "Ticket Types",
    question: "What is the primary purpose of a General Ticket?",
    options: [
      "User applications for joining Void Esports",
      "Community support inquiries and reporting issues",
      "Staff internal communications",
      "Tournament registrations"
    ],
    correct: 1
  },
  {
    id: 2,
    category: "Ticket Types",
    question: "How should you handle a Roster Ticket?",
    options: [
      "Direct them to the tournament team",
      "Include age verification and direct to appropriate resources",
      "Immediately assign roles without verification",
      "Escalate to senior staff only"
    ],
    correct: 1
  },
  {
    id: 3,
    category: "Ticket Types",
    question: "What should all ticket responses begin with?",
    options: [
      "Informal greetings like 'Yo' or 'Bro'",
      "Professional greeting and age inquiry",
      "Immediate role assignment",
      "A warning about rules"
    ],
    correct: 1
  },
  {
    id: 4,
    category: "Roster Categories",
    question: "What Power Ranking is required for Pro Roster?",
    options: ["10,000+", "15,000+", "25,000+", "50,000+"],
    correct: 2
  },
  {
    id: 5,
    category: "Roster Categories",
    question: "What earnings threshold is required for Pro Roster?",
    options: ["$500+", "No earnings required", "$1,000+", "$5,000+"],
    correct: 2
  },
  {
    id: 6,
    category: "Mod Commands",
    question: "Where should /warn commands be used exclusively?",
    options: [
      "In direct messages to users",
      "In #staff-commands channel",
      "In public channels",
      "In #general channel"
    ],
    correct: 1
  },
  {
    id: 7,
    category: "Mod Commands",
    question: "When should you use /report instead of /warn?",
    options: [
      "For all infractions",
      "Only for minor rule violations",
      "For major or repeated infractions",
      "Never use /report"
    ],
    correct: 2
  },
  {
    id: 8,
    category: "Performance Metrics",
    question: "What is the minimum weekly ticket requirement?",
    options: ["5 tickets", "10 tickets", "20 tickets", "50 tickets"],
    correct: 2
  },
  {
    id: 9,
    category: "Performance Metrics",
    question: "How many messages are required weekly?",
    options: ["100", "200", "400", "1000"],
    correct: 2
  },
  {
    id: 10,
    category: "Guidelines",
    question: "What type of greetings should be avoided?",
    options: [
      "Professional greetings",
      "Friendly greetings",
      "Informal responses like 'Yo', 'Hi', 'Bro'",
      "Polite inquiries"
    ],
    correct: 2
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
