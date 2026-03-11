import express from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { getRandomQuestions, calculateScore } from '../quiz/questions';
import { QuizQuestion, QuizAttempt, QuizResult } from '../../../shared/types';

const router = express.Router();

// In-memory storage for quiz attempts (in production, use database)
const quizAttempts: Map<string, QuizAttempt> = new Map();

// Validation schemas
const startQuizSchema = Joi.object({
  userId: Joi.string().required(),
  discordUserId: Joi.string().required(),
});

const submitAnswerSchema = Joi.object({
  attemptId: Joi.string().required(),
  questionIndex: Joi.number().integer().min(0).required(),
  answer: Joi.number().integer().min(0).required(),
});

const completeQuizSchema = Joi.object({
  attemptId: Joi.string().required(),
  answers: Joi.array().items(Joi.number().integer().min(0)).required(),
});

/**
 * POST /api/quiz/start
 * Start a new quiz attempt
 */
router.post('/start', async (req, res) => {
  try {
    const { error, value } = startQuizSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { userId, discordUserId } = value;
    
    // Get random questions for the quiz
    const questions = getRandomQuestions(10);
    
    // Create new quiz attempt
    const attempt: QuizAttempt = {
      id: uuidv4(),
      userId,
      questions,
      answers: new Array(questions.length).fill(-1), // -1 indicates not answered
      score: 0,
      passed: false,
      startedAt: new Date(),
    };

    // Store the attempt
    quizAttempts.set(attempt.id, attempt);

    res.json({
      success: true,
      data: {
        attemptId: attempt.id,
        questions: questions.map((q, index) => ({
          id: q.id,
          questionNumber: index + 1,
          question: q.question,
          options: q.options,
          category: q.category,
          difficulty: q.difficulty,
        })),
        totalQuestions: questions.length,
        timeLimit: 0, // No time limit as specified
      },
    });
  } catch (error) {
    console.error('Error starting quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/quiz/answer
 * Submit an answer for a specific question
 */
router.post('/answer', async (req, res) => {
  try {
    const { error, value } = submitAnswerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { attemptId, questionIndex, answer } = value;
    
    // Get the quiz attempt
    const attempt = quizAttempts.get(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: 'Quiz attempt not found',
      });
    }

    // Check if quiz is already completed
    if (attempt.completedAt) {
      return res.status(400).json({
        success: false,
        error: 'Quiz is already completed',
      });
    }

    // Validate question index
    if (questionIndex < 0 || questionIndex >= attempt.questions.length) {
      return res.status(400).json({
        success: false,
        error: 'Invalid question index',
      });
    }

    // Validate answer
    if (answer < 0 || answer >= attempt.questions[questionIndex].options.length) {
      return res.status(400).json({
        success: false,
        error: 'Invalid answer',
      });
    }

    // Update the answer
    attempt.answers[questionIndex] = answer;
    
    // Calculate current progress
    const answeredQuestions = attempt.answers.filter(a => a !== -1).length;
    const progress = (answeredQuestions / attempt.questions.length) * 100;

    res.json({
      success: true,
      data: {
        questionIndex,
        answer,
        progress,
        answeredQuestions,
        totalQuestions: attempt.questions.length,
      },
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/quiz/complete
 * Complete the quiz and get results
 */
router.post('/complete', async (req, res) => {
  try {
    const { error, value } = completeQuizSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { attemptId, answers } = value;
    
    // Get the quiz attempt
    const attempt = quizAttempts.get(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: 'Quiz attempt not found',
      });
    }

    // Check if quiz is already completed
    if (attempt.completedAt) {
      return res.status(400).json({
        success: false,
        error: 'Quiz is already completed',
      });
    }

    // Validate answers
    if (answers.length !== attempt.questions.length) {
      return res.status(400).json({
        success: false,
        error: 'Invalid number of answers',
      });
    }

    // Update answers
    attempt.answers = answers;
    
    // Calculate score
    const scoreResult = calculateScore(attempt.questions, answers);
    
    // Update attempt with results
    attempt.score = scoreResult.score;
    attempt.passed = scoreResult.passed;
    attempt.completedAt = new Date();
    attempt.timeSpent = Math.floor((attempt.completedAt.getTime() - attempt.startedAt.getTime()) / 1000);

    // Create result object
    const result: QuizResult = {
      attemptId: attempt.id,
      score: scoreResult.score,
      totalQuestions: scoreResult.total,
      passed: scoreResult.passed,
      correctAnswers: scoreResult.correctAnswers,
      incorrectAnswers: scoreResult.incorrectAnswers,
      timeSpent: attempt.timeSpent,
      completedAt: attempt.completedAt,
    };

    // Update the stored attempt
    quizAttempts.set(attemptId, attempt);

    res.json({
      success: true,
      data: {
        result,
        // Include question details with correct answers for review
        review: attempt.questions.map((question, index) => ({
          questionNumber: index + 1,
          question: question.question,
          userAnswer: answers[index],
          correctAnswer: question.correctAnswer,
          isCorrect: answers[index] === question.correctAnswer,
          explanation: getExplanationForQuestion(question.id),
        })),
      },
    });
  } catch (error) {
    console.error('Error completing quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/quiz/attempt/:attemptId
 * Get quiz attempt details
 */
router.get('/attempt/:attemptId', async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = quizAttempts.get(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: 'Quiz attempt not found',
      });
    }

    res.json({
      success: true,
      data: {
        attemptId: attempt.id,
        userId: attempt.userId,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        score: attempt.score,
        passed: attempt.passed,
        timeSpent: attempt.timeSpent,
        totalQuestions: attempt.questions.length,
        answeredQuestions: attempt.answers.filter(a => a !== -1).length,
        isCompleted: !!attempt.completedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching quiz attempt:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/quiz/attempts/:userId
 * Get all quiz attempts for a user
 */
router.get('/attempts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userAttempts = Array.from(quizAttempts.values())
      .filter(attempt => attempt.userId === userId)
      .map(attempt => ({
        attemptId: attempt.id,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        score: attempt.score,
        passed: attempt.passed,
        timeSpent: attempt.timeSpent,
        totalQuestions: attempt.questions.length,
      }))
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

    res.json({
      success: true,
      data: {
        attempts: userAttempts,
        totalAttempts: userAttempts.length,
        passedAttempts: userAttempts.filter(a => a.passed).length,
      },
    });
  } catch (error) {
    console.error('Error fetching user attempts:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Helper function to provide explanations for quiz questions
function getExplanationForQuestion(questionId: string): string {
  const explanations: Record<string, string> = {
    '1': 'Always investigate claims before taking action. Evidence gathering is crucial for fair moderation.',
    '2': 'The !history command allows you to view a user\'s previous infractions and moderation history.',
    '3': 'Main Roster requires completion of tryouts and staff approval to ensure quality and commitment.',
    '4': 'Monitor potentially toxic behavior before taking action. Not all negative behavior requires immediate intervention.',
    '5': 'Typically 2-3 warnings should be given before a temporary ban, depending on the severity of the offense.',
    '6': 'LOA submissions must include User, Role, Start Time, End Time, and Reason for proper record keeping.',
    '7': 'Report exploitable bugs to developers immediately to prevent widespread abuse.',
    '8': 'Spamming, while annoying, doesn\'t typically warrant an immediate ban. Use warnings and mutes first.',
    '9': 'Evidence and circumstances should be the primary consideration when reviewing appeals, not external factors.',
    '10': 'Always provide a summary of actions taken and the outcome when closing tickets for transparency.',
  };

  return explanations[questionId] || 'Review the training materials for more information on this topic.';
}

export default router;
