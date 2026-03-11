import { QuizQuestion } from '../../../shared/types';

export const quizQuestions: QuizQuestion[] = [
  {
    id: '1',
    question: 'A user submits a ticket reporting another player for cheating. What is your FIRST action?',
    options: [
      'Immediately ban the reported player',
      'Gather evidence and investigate the claim',
      'Ask the reporter for more details',
      'Close the ticket as insufficient evidence'
    ],
    correctAnswer: 1,
    category: 'ticket_handling',
    difficulty: 'medium'
  },
  {
    id: '2',
    question: 'Which command would you use to view a user\'s previous infractions?',
    options: [
      '!warn user',
      '!history user',
      '!check user',
      '!record user'
    ],
    correctAnswer: 1,
    category: 'commands',
    difficulty: 'easy'
  },
  {
    id: '3',
    question: 'What is the minimum requirement for a player to be on the Main Roster?',
    options: [
      'Must be 16+ years old',
      'Must have 100+ hours playtime',
      'Must complete tryouts and be approved',
      'Must be recommended by current staff'
    ],
    correctAnswer: 2,
    category: 'roster',
    difficulty: 'medium'
  },
  {
    id: '4',
    question: 'A user is being verbally abusive in chat but hasn\'t broken any specific rules yet. What should you do?',
    options: [
      'Issue an immediate warning',
      'Monitor the situation and intervene if it escalates',
      'Mute the user for 1 hour',
      'Ban the user for toxicity'
    ],
    correctAnswer: 1,
    category: 'moderation',
    difficulty: 'hard'
  },
  {
    id: '5',
    question: 'How many warnings should typically be given before issuing a temporary ban?',
    options: [
      '1 warning is sufficient',
      '2-3 warnings depending on severity',
      'Always give exactly 3 warnings',
      'Warnings are not required for bans'
    ],
    correctAnswer: 1,
    category: 'policy',
    difficulty: 'medium'
  },
  {
    id: '6',
    question: 'What information should ALWAYS be included in an LOA (Leave of Absence) submission?',
    options: [
      'User, Role, Start Time, End Time, Reason',
      'Only the user name and dates',
      'User role and reason only',
      'Just the reason for absence'
    ],
    correctAnswer: 0,
    category: 'policy',
    difficulty: 'easy'
  },
  {
    id: '7',
    question: 'A player reports a bug that allows them to duplicate items. What is your priority?',
    options: [
      'Ban the player for exploiting',
      'Report the bug to developers immediately',
      'Tell the player to stop using it',
      'Document it for the next patch'
    ],
    correctAnswer: 1,
    category: 'ticket_handling',
    difficulty: 'hard'
  },
  {
    id: '8',
    question: 'Which of the following is NOT a valid reason to immediately ban a user?',
    options: [
      'Using cheating software',
      'Threatening other players',
      'Spamming chat messages',
      'Distributing inappropriate content'
    ],
    correctAnswer: 2,
    category: 'moderation',
    difficulty: 'medium'
  },
  {
    id: '9',
    question: 'When handling a player appeal, what is the most important factor to consider?',
    options: [
      'The player\'s reputation in the community',
      'Evidence and circumstances of the original infraction',
      'How long ago the ban was issued',
      'The player\'s donation history'
    ],
    correctAnswer: 1,
    category: 'ticket_handling',
    difficulty: 'hard'
  },
  {
    id: '10',
    question: 'What is the correct format for closing a ticket after resolution?',
    options: [
      'Mark as resolved and move to next ticket',
      'Provide summary of actions taken and outcome',
      'Just close it without comment',
      'Ask the user if they need anything else'
    ],
    correctAnswer: 1,
    category: 'ticket_handling',
    difficulty: 'easy'
  }
];

export function getRandomQuestions(count: number = 10): QuizQuestion[] {
  const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, quizQuestions.length));
}

export function calculateScore(questions: QuizQuestion[], answers: number[]): {
  score: number;
  total: number;
  passed: boolean;
  correctAnswers: number;
  incorrectAnswers: number;
} {
  const passingScore = parseInt(process.env.QUIZ_PASSING_SCORE || '7');
  let correct = 0;

  questions.forEach((question, index) => {
    if (answers[index] === question.correctAnswer) {
      correct++;
    }
  });

  const total = questions.length;
  const passed = correct >= passingScore;

  return {
    score: correct,
    total,
    passed,
    correctAnswers: correct,
    incorrectAnswers: total - correct,
  };
}

export function getQuestionsByCategory(category: string): QuizQuestion[] {
  return quizQuestions.filter(q => q.category === category);
}

export function getQuestionsByDifficulty(difficulty: string): QuizQuestion[] {
  return quizQuestions.filter(q => q.difficulty === difficulty);
}
