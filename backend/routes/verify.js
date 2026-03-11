const express = require('express');
const router = express.Router();
const DiscordService = require('../services/discordService');
const QuizService = require('../services/quizService');

function createVerifyRoutes(discordService, quizService, googleFormsService) {
  // Verify user's quiz completion and assign roles
  router.post('/quiz-completion', async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { discordId, email } = req.body;

      // Validate user is in Discord guild
      const isInGuild = await discordService.validateUserInGuild(req.session.user.discord_id);
      if (!isInGuild) {
        return res.status(400).json({ 
          error: 'User must be in the Void Esports Discord server' 
        });
      }

      // Check if user already has roles
      const hasRoles = await discordService.hasRequiredRoles(req.session.user.discord_id);
      if (hasRoles) {
        return res.status(400).json({ 
          error: 'User already has moderator roles' 
        });
      }

      let quizResult = null;

      // Try Google Forms first if available
      if (googleFormsService && googleFormsService.isAvailable()) {
        try {
          const userStatus = await googleFormsService.checkUserQuizStatus(email || req.session.user.email);
          
          if (userStatus.hasTakenQuiz && userStatus.latestAttempt) {
            quizResult = {
              score: userStatus.latestAttempt.score,
              totalQuestions: userStatus.latestAttempt.totalQuestions,
              passed: userStatus.latestAttempt.passed,
              source: 'google-forms'
            };
          }
        } catch (googleError) {
          console.error('Google Forms check failed, falling back to internal quiz:', googleError);
        }
      }

      // If no Google Forms result, check internal quiz
      if (!quizResult) {
        const latestAttempt = await quizService.getLatestAttempt(req.session.user.id);
        
        if (latestAttempt) {
          quizResult = {
            score: latestAttempt.score,
            totalQuestions: latestAttempt.totalQuestions,
            passed: latestAttempt.passed,
            source: 'internal-quiz',
            attemptDate: latestAttempt.attemptDate
          };
        }
      }

      if (!quizResult) {
        return res.status(404).json({ 
          error: 'No quiz completion found. Please complete the quiz first.' 
        });
      }

      // Check if user passed
      if (!quizResult.passed) {
        return res.status(400).json({ 
          error: 'Quiz not passed. You need at least 20/29 correct answers to receive roles.',
          score: quizResult.score,
          totalQuestions: quizResult.totalQuestions,
          requiredScore: 20
        });
      }

      // Assign roles
      const roleAssignment = await discordService.assignModeratorRoles(req.session.user.discord_id);

      // Record the verification
      await recordVerification(req.session.user.id, quizResult, roleAssignment);

      res.json({
        success: true,
        message: 'Moderator roles assigned successfully!',
        quizResult: quizResult,
        roleAssignment: roleAssignment
      });

    } catch (error) {
      console.error('Error in quiz completion verification:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Manual verification by admin
  router.post('/manual', async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if requester has admin privileges
      const isAdmin = await checkAdminPrivileges(req.session.user.discord_id);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Insufficient privileges' });
      }

      const { targetUserId, reason } = req.body;

      if (!targetUserId) {
        return res.status(400).json({ error: 'Target user ID is required' });
      }

      // Validate target user is in guild
      const isInGuild = await discordService.validateUserInGuild(targetUserId);
      if (!isInGuild) {
        return res.status(400).json({ 
          error: 'Target user must be in the Void Esports Discord server' 
        });
      }

      // Assign roles
      const roleAssignment = await discordService.assignModeratorRoles(targetUserId);

      // Record manual verification
      await recordVerification(
        await getUserIdByDiscordId(targetUserId),
        { source: 'manual', reason: reason },
        roleAssignment
      );

      res.json({
        success: true,
        message: 'Manual role assignment completed',
        roleAssignment: roleAssignment
      });

    } catch (error) {
      console.error('Error in manual verification:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Check verification status
  router.get('/status', async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const hasRoles = await discordService.hasRequiredRoles(req.session.user.discord_id);
      const userRoles = await discordService.getUserRoles(req.session.user.discord_id);
      const latestAttempt = await quizService.getLatestAttempt(req.session.user.id);

      let googleFormsStatus = null;
      if (googleFormsService && googleFormsService.isAvailable()) {
        try {
          googleFormsStatus = await googleFormsService.checkUserQuizStatus(req.session.user.email);
        } catch (error) {
          console.error('Google Forms status check failed:', error);
        }
      }

      res.json({
        success: true,
        hasRoles: hasRoles,
        userRoles: userRoles,
        latestAttempt: latestAttempt,
        googleFormsStatus: googleFormsStatus,
        discordId: req.session.user.discord_id,
        username: req.session.user.username
      });

    } catch (error) {
      console.error('Error checking verification status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Revoke roles (admin only)
  router.post('/revoke', async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const isAdmin = await checkAdminPrivileges(req.session.user.discord_id);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Insufficient privileges' });
      }

      const { targetUserId, reason } = req.body;

      if (!targetUserId) {
        return res.status(400).json({ error: 'Target user ID is required' });
      }

      const result = await discordService.revokeModeratorRoles(targetUserId);

      res.json({
        success: true,
        message: 'Roles revoked successfully',
        result: result
      });

    } catch (error) {
      console.error('Error revoking roles:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get user info
  router.get('/user-info/:discordId', async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { discordId } = req.params;
      const isAdmin = await checkAdminPrivileges(req.session.user.discord_id);
      
      // Users can only check their own info unless they're admin
      if (discordId !== req.session.user.discord_id && !isAdmin) {
        return res.status(403).json({ error: 'Insufficient privileges' });
      }

      const userInfo = await discordService.getUserInfo(discordId);
      
      if (!userInfo) {
        return res.status(404).json({ error: 'User not found' });
      }

      const hasRoles = await discordService.hasRequiredRoles(discordId);
      const quizHistory = await quizService.getQuizHistory(
        await getUserIdByDiscordId(discordId)
      );

      res.json({
        success: true,
        userInfo: userInfo,
        hasRoles: hasRoles,
        quizHistory: quizHistory
      });

    } catch (error) {
      console.error('Error fetching user info:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Sync Google Forms responses (admin only)
  router.post('/sync-google-forms', async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const isAdmin = await checkAdminPrivileges(req.session.user.discord_id);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Insufficient privileges' });
      }

      if (!googleFormsService || !googleFormsService.isAvailable()) {
        return res.status(400).json({ 
          error: 'Google Forms integration is not available' 
        });
      }

      const syncedCount = await googleFormsService.syncResponsesToDatabase(database);

      res.json({
        success: true,
        message: `Synced ${syncedCount} responses from Google Forms`,
        syncedCount: syncedCount
      });

    } catch (error) {
      console.error('Error syncing Google Forms:', error);
      res.status(500).json({ error: 'Failed to sync Google Forms' });
    }
  });

  return router;
}

// Helper functions
async function recordVerification(userId, quizResult, roleAssignment) {
  // This would record the verification in the database
  // Implementation depends on your database structure
  console.log(`Recording verification for user ${userId}:`, {
    quizResult: quizResult,
    roleAssignment: roleAssignment
  });
}

async function checkAdminPrivileges(discordId) {
  // This would check if the user has admin roles in Discord
  // For now, return false as a placeholder
  return false;
}

async function getUserIdByDiscordId(discordId) {
  // This would get the internal user ID from Discord ID
  // Implementation depends on your database structure
  return discordId; // Placeholder
}

module.exports = createVerifyRoutes;
