const express = require('express');
const router = express.Router();

// Get admin statistics
router.get('/stats', (req, res) => {
  try {
    // In production, calculate from database
    const stats = {
      totalUsers: 1234,
      activeUsers: 892,
      totalQuizAttempts: 1567,
      passedQuizzes: 1123,
      failedQuizzes: 444,
      passRate: 71.6,
      averageScore: 7.8,
      certificationsIssued: 892,
      recentActivity: {
        newUsers: 12,
        quizAttempts: 45,
        certifications: 23
      }
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

// Get trainee list
router.get('/trainees', (req, res) => {
  try {
    // In production, fetch from database with quiz attempts
    const trainees = [
      {
        id: '1',
        email: 'user1@example.com',
        full_name: 'John Doe',
        role: 'certified_moderator',
        quiz_attempts: [
          {
            score: 8,
            total_questions: 10,
            passed: true,
            created_at: '2024-01-15T10:30:00Z'
          }
        ],
        certifications: [
          {
            id: 'cert-1',
            created_at: '2024-01-15T10:35:00Z'
          }
        ],
        created_at: '2024-01-10T08:00:00Z'
      },
      {
        id: '2',
        email: 'user2@example.com',
        full_name: 'Jane Smith',
        role: 'trainee',
        quiz_attempts: [
          {
            score: 5,
            total_questions: 10,
            passed: false,
            created_at: '2024-01-14T14:20:00Z'
          }
        ],
        certifications: [],
        created_at: '2024-01-12T09:15:00Z'
      }
    ];
    
    res.json({
      success: true,
      trainees
    });
  } catch (error) {
    console.error('Error fetching trainees:', error);
    res.status(500).json({ error: 'Failed to fetch trainees' });
  }
});

// Get quiz analytics
router.get('/quiz-analytics', (req, res) => {
  try {
    // In production, calculate from quiz attempts
    const analytics = {
      categoryPerformance: {
        'Ticket Types': { correct: 45, total: 50, percentage: 90 },
        'Roster Categories': { correct: 38, total: 50, percentage: 76 },
        'Mod Commands': { correct: 42, total: 50, percentage: 84 },
        'Performance Metrics': { correct: 40, total: 50, percentage: 80 },
        'Guidelines': { correct: 35, total: 50, percentage: 70 }
      },
      questionDifficulty: {
        easy: { correct: 85, total: 100, percentage: 85 },
        medium: { correct: 120, total: 150, percentage: 80 },
        hard: { correct: 45, total: 75, percentage: 60 }
      },
      timeToComplete: {
        average: 480, // seconds
        fastest: 180,
        slowest: 590
      },
      retryRate: 23.5, // percentage
      improvementRate: 67.8 // percentage of users who improve on retry
    };
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching quiz analytics:', error);
    res.status(500).json({ error: 'Failed to fetch quiz analytics' });
  }
});

// Get certification analytics
router.get('/certification-analytics', (req, res) => {
  try {
    // In production, calculate from certifications
    const analytics = {
      totalCertified: 892,
      certificationRate: 71.6,
      averageTimeToCertify: 3.2, // days
      certificationsByMonth: {
        '2024-01': 156,
        '2024-02': 189,
        '2024-03': 234,
        '2024-04': 198,
        '2024-05': 267
      },
      roleDistribution: {
        'Trial Mod': 892,
        'Staff Access': 892,
        'Ticket Support': 892
      },
      retentionRate: 94.2 // percentage of certified users still active
    };
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching certification analytics:', error);
    res.status(500).json({ error: 'Failed to fetch certification analytics' });
  }
});

// Export data
router.get('/export/:type', (req, res) => {
  try {
    const { type } = req.params;
    
    let data = [];
    let filename = '';
    
    switch (type) {
      case 'users':
        data = [
          {
            email: 'user1@example.com',
            full_name: 'John Doe',
            role: 'certified_moderator',
            quiz_score: '8/10',
            certified: 'Yes',
            certified_date: '2024-01-15'
          }
        ];
        filename = 'users_export.csv';
        break;
        
      case 'quiz_attempts':
        data = [
          {
            user_email: 'user1@example.com',
            score: 8,
            total_questions: 10,
            passed: 'Yes',
            attempt_date: '2024-01-15T10:30:00Z'
          }
        ];
        filename = 'quiz_attempts_export.csv';
        break;
        
      case 'certifications':
        data = [
          {
            user_email: 'user1@example.com',
            certificate_id: 'VM-ABC123',
            quiz_score: 8,
            issue_date: '2024-01-15T10:35:00Z'
          }
        ];
        filename = 'certifications_export.csv';
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }
    
    // In production, generate actual CSV file
    res.json({
      success: true,
      data,
      filename,
      message: 'Export functionality coming soon'
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

module.exports = router;
