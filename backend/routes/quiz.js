const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Quiz questions database (in production, this would come from a database)
const quizQuestions = [
  {
    id: 1,
    category: "Ticket Types",
    question: "A user submits a roster ticket but is under 13 years old. What is the FIRST action you should take and what should you offer them as an alternative?",
    keywords: ["politely", "inform", "don't qualify", "suggest", "grinder+", "under 13", "alternative"],
    points: 10
  },
  {
    id: 2,
    category: "Mod Commands",
    question: "Which command should be used when a user repeatedly violates community guidelines after multiple warnings? Explain your reasoning and what the command does.",
    keywords: ["/report", "repeated", "violations", "staff review", "major", "infractions"],
    points: 10
  },
  {
    id: 3,
    category: "Roster Categories",
    question: "A user applies for Pro Roster with 24,000 Power Ranking but only $800 in earnings. What are the exact requirements they need to meet and what should you tell them?",
    keywords: ["25,000", "1,000", "both", "earnings", "power ranking", "requirements"],
    points: 10
  },
  {
    id: 4,
    category: "Role Instructions",
    question: "Write the exact response you should give when a user applies for Content Creator role. Include the department that should review their application.",
    keywords: ["perfect", "link", "social media", "content department", "review", "shortly"],
    points: 10
  },
  {
    id: 5,
    category: "Performance Metrics",
    question: "A user has been inactive for 2 weeks and wants to return. What should you check first before restoring their roles and why?",
    keywords: ["loa", "leave of application", "performance", "before departure", "check", "status"],
    points: 10
  },
  {
    id: 6,
    category: "Guidelines",
    question: "What is the most appropriate greeting for a general support ticket? Write out the exact greeting you would use.",
    keywords: ["hi there", "how may i help", "today", "professional", "greeting"],
    points: 10
  },
  {
    id: 7,
    category: "Role Instructions",
    question: "A user claims to be a coach but can't provide student success stories. What should you ask for instead and why is verifiable proof important?",
    keywords: ["verifiable", "student", "results", "success stories", "proof", "important"],
    points: 10
  },
  {
    id: 8,
    category: "Performance Metrics",
    question: "What is the minimum weekly message requirement for moderators and why is this requirement important for community engagement?",
    keywords: ["400", "messages", "minimum", "weekly", "engagement", "community"],
    points: 10
  },
  {
    id: 9,
    category: "Mod Commands",
    question: "In what specific situations should you use the /report command instead of /warn? Give at least two examples of when escalation is necessary.",
    keywords: ["major", "repeated", "infractions", "staff review", "escalation", "necessary"],
    points: 10
  },
  {
    id: 10,
    category: "Roster Categories",
    question: "What are the quality requirements for Void VFX submissions and what should you tell a user who submits 1080p work?",
    keywords: ["1440p", "higher", "quality", "void vfx", "requirements", "1080p"],
    points: 10
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

    // Calculate score based on keyword matching
    let totalScore = 0;
    const questionResults = [];
    
    answers.forEach((answer, index) => {
      if (index < quizQuestions.length && answer) {
        const question = quizQuestions[index];
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

    const maxTotalScore = quizQuestions.reduce((sum, q) => sum + q.points, 0);
    const passed = totalScore >= (maxTotalScore * 0.7); // 70% to pass
    
    // Store attempt
    const attempt = {
      id: uuidv4(),
      userId,
      quizId,
      score: totalScore,
      totalQuestions: quizQuestions.length,
      maxTotalScore: maxTotalScore,
      passed,
      answers: answers,
      questionResults: questionResults,
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
        categoryBreakdown[result.category] = { total: 0, correct: 0, score: 0, maxScore: 0 };
      }
      categoryBreakdown[result.category].total++;
      categoryBreakdown[result.category].score += result.score;
      categoryBreakdown[result.category].maxScore += result.maxScore;
      if (result.isCorrect) {
        categoryBreakdown[result.category].correct++;
      }
    });
    
    res.json({
      success: true,
      results: {
        score: totalScore,
        total: maxTotalScore,
        percentage: Math.round((totalScore / maxTotalScore) * 100),
        passed,
        passingScore: Math.round(maxTotalScore * 0.7),
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
