const express = require('express');
const router = express.Router();
const QuizService = require('../services/quizService');
const DiscordService = require('../services/discordService');

function createQuizRoutes(quizService, discordService) {
  // Generate a new quiz
  router.post('/generate', async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if user can retake quiz
      const canRetake = await quizService.canRetakeQuiz(req.session.user.id);
      
      if (!canRetake.canRetake) {
        return res.status(429).json({
          error: 'Quiz cooldown active',
          nextAttemptAllowed: canRetake.nextAttemptAllowed
        });
      }

      const quiz = await quizService.generateQuiz();
      
      res.json({
        success: true,
        quiz: quiz,
        sessionId: generateQuizSessionId()
      });
    } catch (error) {
      console.error('Error generating quiz:', error);
      res.status(500).json({ error: 'Failed to generate quiz' });
    }
  });

  // Submit quiz answers
  router.post('/submit', async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { answers, sessionId, quizStartTime } = req.body;

      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: 'Invalid answers format' });
      }

      if (!sessionId || !quizStartTime) {
        return res.status(400).json({ error: 'Missing session information' });
      }

      // Validate quiz session (basic validation)
      const isValidSession = await quizService.validateQuizAnswers(sessionId, answers);
      if (!isValidSession) {
        return res.status(400).json({ error: 'Invalid quiz session' });
      }

      // Submit quiz and get results
      const results = await quizService.submitQuiz(
        req.session.user.id,
        answers,
        quizStartTime
      );

      // If passed, assign Discord roles
      if (results.passed) {
        try {
          const roleAssignment = await discordService.assignModeratorRoles(req.session.user.discord_id);
          
          // Notify senior staff
          await discordService.notifySeniorStaff(req.session.user, results.score);
          
          results.roleAssignment = roleAssignment;
        } catch (roleError) {
          console.error('Error assigning roles:', roleError);
          results.roleAssignment = {
            success: false,
            error: 'Failed to assign Discord roles. Please contact staff.'
          };
        }
      } else {
        // Send failure message
        try {
          await discordService.sendFailureMessage(
            req.session.user.discord_id,
            results.score,
            results.totalQuestions
          );
        } catch (messageError) {
          console.error('Error sending failure message:', messageError);
        }
      }

      res.json({
        success: true,
        results: results
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      res.status(500).json({ error: 'Failed to submit quiz' });
    }
  });

  // Get quiz history for current user
  router.get('/history', async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const history = await quizService.getQuizHistory(req.session.user.id);
      
      res.json({
        success: true,
        history: history
      });
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      res.status(500).json({ error: 'Failed to fetch quiz history' });
    }
  });

  // Get latest quiz attempt
  router.get('/latest', async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const latestAttempt = await quizService.getLatestAttempt(req.session.user.id);
      
      res.json({
        success: true,
        latestAttempt: latestAttempt
      });
    } catch (error) {
      console.error('Error fetching latest attempt:', error);
      res.status(500).json({ error: 'Failed to fetch latest attempt' });
    }
  });

  // Check if user can retake quiz
  router.get('/can-retake', async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const canRetake = await quizService.canRetakeQuiz(req.session.user.id);
      
      res.json({
        success: true,
        canRetake: canRetake
      });
    } catch (error) {
      console.error('Error checking retake eligibility:', error);
      res.status(500).json({ error: 'Failed to check retake eligibility' });
    }
  });

  // Get quiz statistics (admin only)
  router.get('/statistics', async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if user has admin privileges (you'd implement this check)
      const isAdmin = await checkAdminPrivileges(req.session.user.discord_id);
      
      if (!isAdmin) {
        return res.status(403).json({ error: 'Insufficient privileges' });
      }

      const statistics = await quizService.getQuizStatistics();
      
      res.json({
        success: true,
        statistics: statistics
      });
    } catch (error) {
      console.error('Error fetching quiz statistics:', error);
      res.status(500).json({ error: 'Failed to fetch quiz statistics' });
    }
  });

  // Get questions by category (admin only)
  router.get('/questions/:category', async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const isAdmin = await checkAdminPrivileges(req.session.user.discord_id);
      
      if (!isAdmin) {
        return res.status(403).json({ error: 'Insufficient privileges' });
      }

      const { category } = req.params;
      const questions = await quizService.getQuestionsByCategory(category);
      
      res.json({
        success: true,
        questions: questions
      });
    } catch (error) {
      console.error('Error fetching questions by category:', error);
      res.status(500).json({ error: 'Failed to fetch questions' });
    }
  });

  // Add new question (admin only)
  router.post('/questions', async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const isAdmin = await checkAdminPrivileges(req.session.user.discord_id);
      
      if (!isAdmin) {
        return res.status(403).json({ error: 'Insufficient privileges' });
      }

      const { category, question, options, correctAnswer, explanation, difficulty } = req.body;

      if (!category || !question || !options || !Array.isArray(options) || correctAnswer === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (correctAnswer < 0 || correctAnswer >= options.length) {
        return res.status(400).json({ error: 'Invalid correct answer index' });
      }

      const result = await quizService.addQuestion(
        category,
        question,
        options,
        correctAnswer,
        explanation,
        difficulty
      );
      
      res.json({
        success: true,
        questionId: result.questionId
      });
    } catch (error) {
      console.error('Error adding question:', error);
      res.status(500).json({ error: 'Failed to add question' });
    }
  });

  // Update question (admin only)
  router.put('/questions/:questionId', async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const isAdmin = await checkAdminPrivileges(req.session.user.discord_id);
      
      if (!isAdmin) {
        return res.status(403).json({ error: 'Insufficient privileges' });
      }

      const { questionId } = req.params;
      const updates = req.body;

      const result = await quizService.updateQuestion(questionId, updates);
      
      res.json({
        success: true,
        result: result
      });
    } catch (error) {
      console.error('Error updating question:', error);
      res.status(500).json({ error: 'Failed to update question' });
    }
  });

  // Delete question (admin only)
  router.delete('/questions/:questionId', async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const isAdmin = await checkAdminPrivileges(req.session.user.discord_id);
      
      if (!isAdmin) {
        return res.status(403).json({ error: 'Insufficient privileges' });
      }

      const { questionId } = req.params;

      const result = await quizService.deleteQuestion(questionId);
      
      res.json({
        success: true,
        result: result
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      res.status(500).json({ error: 'Failed to delete question' });
    }
  });

  return router;
}

// Helper functions
function generateQuizSessionId() {
  return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function checkAdminPrivileges(discordId) {
  // This would check if the user has admin roles in Discord
  // For now, return false as a placeholder
  // In a real implementation, you'd check against Discord roles
  return false;
}

module.exports = createQuizRoutes;
