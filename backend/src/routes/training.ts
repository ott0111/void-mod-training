import express from 'express';

const router = express.Router();

/**
 * GET /api/training/modules
 * Get all training modules
 */
router.get('/modules', (req, res) => {
  res.json({
    success: true,
    data: {
      modules: [
        {
          id: 'ticket-types',
          title: 'Ticket Types',
          order: 1,
          estimatedReadTime: 15,
        },
        {
          id: 'roster-categories',
          title: 'Roster Categories & Requirements',
          order: 2,
          estimatedReadTime: 20,
        },
        {
          id: 'mod-responsibilities',
          title: 'Mod Responsibilities & Commands',
          order: 3,
          estimatedReadTime: 25,
        },
        {
          id: 'performance-metrics',
          title: 'Weekly Performance Metrics',
          order: 4,
          estimatedReadTime: 10,
        },
        {
          id: 'ticket-guidelines',
          title: 'Ticket Handling Guidelines',
          order: 5,
          estimatedReadTime: 30,
        },
        {
          id: 'general-guidelines',
          title: 'General Guidelines',
          order: 6,
          estimatedReadTime: 20,
        },
        {
          id: 'role-instructions',
          title: 'Role-Specific Instructions',
          order: 7,
          estimatedReadTime: 25,
        },
        {
          id: 'closing-tickets',
          title: 'Closing the Ticket',
          order: 8,
          estimatedReadTime: 15,
        },
      ],
    },
  });
});

/**
 * GET /api/training/module/:id
 * Get specific training module content
 */
router.get('/module/:id', (req, res) => {
  const { id } = req.params;
  
  // This would normally fetch from database or files
  res.json({
    success: true,
    data: {
      id,
      title: `Training Module: ${id}`,
      content: 'Training content will be implemented here...',
    },
  });
});

/**
 * POST /api/training/progress
 * Update training progress
 */
router.post('/progress', (req, res) => {
  res.json({
    success: true,
    message: 'Training progress updated',
  });
});

export default router;
