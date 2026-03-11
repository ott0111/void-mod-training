import express from 'express';
import Joi from 'joi';
import DiscordVerificationService from '../discord/verification';
import { DiscordVerificationRequest } from '../../../shared/types';

const router = express.Router();
const discordService = DiscordVerificationService;

// Validation schema
const verificationSchema = Joi.object({
  discordUserId: Joi.string().required().pattern(/^\d{17,19}$/),
  discordUsername: Joi.string().required().min(2).max(32),
});

/**
 * POST /api/discord/verify
 * Verify Discord server membership
 */
router.post('/verify', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = verificationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const verificationRequest: DiscordVerificationRequest = value;
    
    // Verify user membership
    const result = await discordService.verifyUserMembership(verificationRequest);
    
    res.json(result);
  } catch (error) {
    console.error('Discord verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during Discord verification',
    });
  }
});

/**
 * GET /api/discord/roles/:userId
 * Get user's Discord roles
 */
router.get('/roles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate user ID format
    if (!/^\d{17,19}$/.test(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Discord User ID format',
      });
    }

    const roles = await discordService.getUserRoles(userId);
    
    res.json({
      success: true,
      data: { roles },
    });
  } catch (error) {
    console.error('Error fetching user roles:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/discord/assign-role
 * Assign a role to a user (admin only)
 */
router.post('/assign-role', async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    
    // Validate input
    if (!userId || !roleId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Role ID are required',
      });
    }

    if (!/^\d{17,19}$/.test(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Discord User ID format',
      });
    }

    const success = await discordService.assignRole(userId, roleId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Role assigned successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to assign role',
      });
    }
  } catch (error) {
    console.error('Error assigning role:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/discord/remove-role
 * Remove a role from a user (admin only)
 */
router.post('/remove-role', async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    
    // Validate input
    if (!userId || !roleId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Role ID are required',
      });
    }

    if (!/^\d{17,19}$/.test(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Discord User ID format',
      });
    }

    const success = await discordService.removeRole(userId, roleId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Role removed successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to remove role',
      });
    }
  } catch (error) {
    console.error('Error removing role:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
