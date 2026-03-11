const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory storage for demo (in production, use database)
const users = new Map();
const certifications = new Map();

// Get user profile
router.get('/profile/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const user = users.get(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    let user = users.get(userId);
    if (!user) {
      // Create new user
      user = {
        id: userId,
        created_at: new Date().toISOString(),
        ...updates
      };
    } else {
      // Update existing user
      user = {
        ...user,
        ...updates,
        updated_at: new Date().toISOString()
      };
    }
    
    users.set(userId, user);
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Get user certifications
router.get('/certifications/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userCertifications = Array.from(certifications.values())
      .filter(cert => cert.user_id === userId);
    
    res.json({
      success: true,
      certifications: userCertifications
    });
  } catch (error) {
    console.error('Error fetching certifications:', error);
    res.status(500).json({ error: 'Failed to fetch certifications' });
  }
});

// Create certification
router.post('/certifications', (req, res) => {
  try {
    const { userId, quizScore, quizId } = req.body;
    
    if (!userId || !quizScore) {
      return res.status(400).json({ error: 'User ID and quiz score required' });
    }
    
    const certification = {
      id: uuidv4(),
      user_id: userId,
      quiz_id: quizId,
      score: quizScore,
      created_at: new Date().toISOString(),
      status: 'active',
      certificate_id: `VM-${Date.now().toString(36).toUpperCase()}`
    };
    
    certifications.set(certification.id, certification);
    
    res.json({
      success: true,
      certification
    });
  } catch (error) {
    console.error('Error creating certification:', error);
    res.status(500).json({ error: 'Failed to create certification' });
  }
});

// Get all users (admin only)
router.get('/all', (req, res) => {
  try {
    // In production, add admin authentication check
    const allUsers = Array.from(users.values());
    
    res.json({
      success: true,
      users: allUsers
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
