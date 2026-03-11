const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('./config');

class Database {
  constructor() {
    this.db = null;
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      const dbPath = path.resolve(__dirname, config.DATABASE_PATH);
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        discord_id TEXT UNIQUE NOT NULL,
        discord_username TEXT NOT NULL,
        discord_discriminator TEXT NOT NULL,
        discord_avatar TEXT,
        access_token TEXT,
        refresh_token TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Quiz attempts table
      `CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        passed BOOLEAN NOT NULL,
        attempt_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        quiz_data TEXT, -- JSON data for the quiz attempt
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,
      
      // Role assignments table
      `CREATE TABLE IF NOT EXISTS role_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        role_id TEXT NOT NULL,
        role_name TEXT NOT NULL,
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        assignment_source TEXT NOT NULL, -- 'quiz_pass' or 'manual'
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,
      
      // Quiz questions table
      `CREATE TABLE IF NOT EXISTS quiz_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        question TEXT NOT NULL,
        options TEXT NOT NULL, -- JSON array of options
        correct_answer INTEGER NOT NULL, -- Index of correct answer
        explanation TEXT,
        difficulty TEXT DEFAULT 'medium',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Failed attempts tracking
      `CREATE TABLE IF NOT EXISTS failed_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        attempt_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        next_attempt_allowed DATETIME,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`
    ];

    for (const table of tables) {
      await this.run(table);
    }
    
    // Insert default quiz questions
    await this.insertDefaultQuestions();
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // User operations
  async createUser(discordUser) {
    const sql = `
      INSERT INTO users (discord_id, discord_username, discord_discriminator, discord_avatar, access_token, refresh_token)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      discordUser.id,
      discordUser.username,
      discordUser.discriminator,
      discordUser.avatar,
      discordUser.accessToken,
      discordUser.refreshToken
    ];
    return this.run(sql, params);
  }

  async getUserByDiscordId(discordId) {
    const sql = 'SELECT * FROM users WHERE discord_id = ?';
    return this.get(sql, [discordId]);
  }

  async updateUserLastLogin(discordId) {
    const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE discord_id = ?';
    return this.run(sql, [discordId]);
  }

  // Quiz operations
  async recordQuizAttempt(userId, score, totalQuestions, passed, quizData) {
    const sql = `
      INSERT INTO quiz_attempts (user_id, score, total_questions, passed, quiz_data)
      VALUES (?, ?, ?, ?, ?)
    `;
    return this.run(sql, [userId, score, totalQuestions, passed, JSON.stringify(quizData)]);
  }

  async getUserQuizAttempts(userId) {
    const sql = `
      SELECT * FROM quiz_attempts 
      WHERE user_id = ? 
      ORDER BY attempt_date DESC
    `;
    return this.all(sql, [userId]);
  }

  async getLatestQuizAttempt(userId) {
    const sql = `
      SELECT * FROM quiz_attempts 
      WHERE user_id = ? 
      ORDER BY attempt_date DESC 
      LIMIT 1
    `;
    return this.get(sql, [userId]);
  }

  // Role assignment operations
  async recordRoleAssignment(userId, roleId, roleName, source) {
    const sql = `
      INSERT INTO role_assignments (user_id, role_id, role_name, assignment_source)
      VALUES (?, ?, ?, ?)
    `;
    return this.run(sql, [userId, roleId, roleName, source]);
  }

  async getUserRoleAssignments(userId) {
    const sql = 'SELECT * FROM role_assignments WHERE user_id = ?';
    return this.all(sql, [userId]);
  }

  // Failed attempts operations
  async recordFailedAttempt(userId, cooldownPeriod) {
    const nextAllowed = new Date(Date.now() + cooldownPeriod);
    const sql = `
      INSERT INTO failed_attempts (user_id, next_attempt_allowed)
      VALUES (?, ?)
    `;
    return this.run(sql, [userId, nextAllowed.toISOString()]);
  }

  async getNextAttemptAllowed(userId) {
    const sql = `
      SELECT next_attempt_allowed FROM failed_attempts 
      WHERE user_id = ? 
      ORDER BY attempt_date DESC 
      LIMIT 1
    `;
    return this.get(sql, [userId]);
  }

  // Quiz questions operations
  async insertQuestion(category, question, options, correctAnswer, explanation, difficulty = 'medium') {
    const sql = `
      INSERT INTO quiz_questions (category, question, options, correct_answer, explanation, difficulty)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    return this.run(sql, [category, question, JSON.stringify(options), correctAnswer, explanation, difficulty]);
  }

  async getRandomQuestions(count = 29) {
    const sql = `
      SELECT * FROM quiz_questions 
      ORDER BY RANDOM() 
      LIMIT ?
    `;
    return this.all(sql, [count]);
  }

  async getQuestionsByCategory(category) {
    const sql = 'SELECT * FROM quiz_questions WHERE category = ?';
    return this.all(sql, [category]);
  }

  async insertDefaultQuestions() {
    // Check if questions already exist
    const existingQuestions = await this.get('SELECT COUNT(*) as count FROM quiz_questions');
    if (existingQuestions.count > 0) {
      return; // Questions already exist
    }

    const questions = [
      // Ticket Types (5 questions)
      {
        category: 'Ticket Types',
        question: 'What is the primary purpose of a General Ticket?',
        options: [
          'User applications for joining Void Esports',
          'Community support inquiries and reporting issues',
          'Staff internal communications',
          'Tournament registrations'
        ],
        correctAnswer: 1,
        explanation: 'General Tickets are created by community members for support inquiries, moderator assistance, or reporting issues.'
      },
      {
        category: 'Ticket Types',
        question: 'How should you handle a Roster Ticket?',
        options: [
          'Direct them to the tournament team',
          'Include age verification and direct to appropriate resources',
          'Immediately assign roles without verification',
          'Escalate to senior staff only'
        ],
        correctAnswer: 1,
        explanation: 'Roster Tickets require age verification and direction to appropriate resources for the application workflow.'
      },
      {
        category: 'Ticket Types',
        question: 'What should all ticket responses begin with?',
        options: [
          'Informal greetings like "Yo" or "Bro"',
          'Professional greeting and age inquiry',
          'Immediate role assignment',
          'A warning about rules'
        ],
        correctAnswer: 1,
        explanation: 'All ticket responses should begin with professional greeting and age inquiry.'
      },
      {
        category: 'Ticket Types',
        question: 'What is the protocol for complex General Ticket matters?',
        options: [
          'Handle them yourself without assistance',
          'Follow escalation procedures for complex matters',
          'Close the ticket immediately',
          'Ask the user to create a new ticket'
        ],
        correctAnswer: 1,
        explanation: 'For complex matters in General Tickets, follow escalation procedures.'
      },
      {
        category: 'Ticket Types',
        question: 'What must be maintained for all ticket interactions?',
        options: [
          'Casual conversation style',
          'Detailed records of all interactions',
          'Minimal documentation',
          'Only record failed attempts'
        ],
        correctAnswer: 1,
        explanation: 'Maintain detailed records of all interactions for proper tracking and accountability.'
      },

      // Roster Categories (8 questions)
      {
        category: 'Roster Categories',
        question: 'What Power Ranking is required for Pro Roster?',
        options: ['10,000+', '15,000+', '25,000+', '50,000+'],
        correctAnswer: 2,
        explanation: 'Pro Roster requires 25,000+ Power Ranking.'
      },
      {
        category: 'Roster Categories',
        question: 'What earnings threshold is required for Pro Roster?',
        options: ['$500+', 'No earnings required', '$1,000+', '$5,000+'],
        correctAnswer: 2,
        explanation: 'Pro Roster requires $1,000+ in Official Fortnite Earnings.'
      },
      {
        category: 'Roster Categories',
        question: 'What PR range is required for Semi-Pro status?',
        options: ['500-10,000', '5,000-15,000', '10,000-25,000', '25,000-50,000'],
        correctAnswer: 2,
        explanation: 'Semi-Pro requires 10,000-25,000 PR.'
      },
      {
        category: 'Roster Categories',
        question: 'What is required for Creative Roster applicants?',
        options: [
          'High tournament earnings',
          'Smooth/Fast mechanics and uniqueness',
          'Large social media following',
          'Coaching experience'
        ],
        correctAnswer: 1,
        explanation: 'Creative Roster requires Smooth/Fast mechanics and uniqueness.'
      },
      {
        category: 'Roster Categories',
        question: 'What follower count is required for Streamers?',
        options: ['100+', '500+', '1,000+', '10,000+'],
        correctAnswer: 2,
        explanation: 'Streamers need 1,000+ Followers/Subscribers.'
      },
      {
        category: 'Roster Categories',
        question: 'How often must Streamers stream?',
        options: ['Once a week', 'At least 2x per week', 'At least 4x per week', 'Daily'],
        correctAnswer: 2,
        explanation: 'Streamers must stream at least 4x per week.'
      },
      {
        category: 'Roster Categories',
        question: 'What is required for Content Creator role?',
        options: [
          '1k followers on Twitch/YouTube and 10k on TikTok',
          '500 followers on all platforms',
          'No specific requirements',
          'Only YouTube channel required'
        ],
        correctAnswer: 0,
        explanation: 'Content Creator needs 1k followers on Twitch/YouTube and 10k on TikTok.'
      },
      {
        category: 'Roster Categories',
        question: 'What quality standard is required for GFX/VFX?',
        options: ['720p or higher', '1080p or higher', '1440p or Higher', '4K only'],
        correctAnswer: 2,
        explanation: 'GFX/VFX requires High-Quality Work (1440p or Higher).'
      },

      // Moderator Commands (4 questions)
      {
        category: 'Moderator Commands',
        question: 'Where should /warn commands be used exclusively?',
        options: [
          'In direct messages to users',
          'In #staff-commands channel',
          'In public channels',
          'In #general channel'
        ],
        correctAnswer: 1,
        explanation: '/warn commands must be used exclusively in the #staff-commands channel.'
      },
      {
        category: 'Moderator Commands',
        question: 'When should you use /report instead of /warn?',
        options: [
          'For all infractions',
          'Only for minor rule violations',
          'For major or repeated infractions',
          'Never use /report'
        ],
        correctAnswer: 2,
        explanation: 'For major or repeated infractions, utilize the /report command.'
      },
      {
        category: 'Moderator Commands',
        question: 'What is required before taking extended LOA?',
        options: [
          'No notification needed',
          'Prior notification to senior staff',
          'Just post in general chat',
          'Send email to management'
        ],
        correctAnswer: 1,
        explanation: 'Prior notification to senior staff is mandatory for extended absences.'
      },
      {
        category: 'Moderator Commands',
        question: 'What information is NOT required in the LOA format?',
        options: [
          'User and Role',
          'Start and End Time',
          'Reason',
          'Favorite game'
        ],
        correctAnswer: 3,
        explanation: 'LOA format requires User, Role, Start/End Time, and Reason, but not favorite game.'
      },

      // Performance Metrics (3 questions)
      {
        category: 'Performance Metrics',
        question: 'What is the minimum weekly ticket requirement?',
        options: ['5 tickets', '10 tickets', '20 tickets', '50 tickets'],
        correctAnswer: 1,
        explanation: 'Moderators must process at least 10 tickets weekly.'
      },
      {
        category: 'Performance Metrics',
        question: 'How many messages are required weekly?',
        options: ['100', '200', '400', '1000'],
        correctAnswer: 2,
        explanation: 'Active community engagement requires 400 messages weekly.'
      },
      {
        category: 'Performance Metrics',
        question: 'What commands must be used for documented actions?',
        options: [
          'Only /warn',
          'Only /report',
          '/login and /logout commands',
          'No commands needed'
        ],
        correctAnswer: 2,
        explanation: 'Must use /login and /logout commands for documented moderator actions.'
      },

      // Guidelines (6 questions)
      {
        category: 'Guidelines',
        question: 'What type of greetings should be avoided?',
        options: [
          'Professional greetings',
          'Friendly greetings',
          'Informal responses like "Yo", "Hi", "Bro"',
          'Polite inquiries'
        ],
        correctAnswer: 2,
        explanation: 'Informal responses like "Yo", "Hi", "Bro" should be avoided.'
      },
      {
        category: 'Guidelines',
        question: 'What is a professional greeting example?',
        options: [
          '"Yo what\'s up?"',
          '"Hello, how may I help you?"',
          '"Hey bro"',
          '"Sup?"'
        ],
        correctAnswer: 1,
        explanation: '"Hello, how may I help you?" is a professional greeting example.'
      },
      {
        category: 'Guidelines',
        question: 'What should you ask about role applications?',
        options: [
          'Their age only',
          'What role they are applying for',
          'Their favorite game',
          'Their social media only'
        ],
        correctAnswer: 1,
        explanation: 'Ask what role they are applying for: "What role are you applying for today?"'
      },
      {
        category: 'Guidelines',
        question: 'How should you ask for age verification?',
        options: [
          '"How old are you kid?"',
          '"Age now!"',
          '"May I ask how old you are?"',
          '"Tell me your age immediately"'
        ],
        correctAnswer: 2,
        explanation: '"May I ask how old you are?" is the professional way to ask for age verification.'
      },
      {
        category: 'Guidelines',
        question: 'What is the alternative professional greeting?',
        options: [
          '"Yo what can I do?"',
          '"Hello, what can I assist you with today?"',
          '"Hey need help?"',
          '"Sup bro?"'
        ],
        correctAnswer: 1,
        explanation: '"Hello, what can I assist you with today?" is another professional greeting option.'
      },
      {
        category: 'Guidelines',
        question: 'What should be maintained throughout interactions?',
        options: [
          'Casual attitude',
          'Professionalism',
          'Strict formality',
          'Minimal engagement'
        ],
        correctAnswer: 1,
        explanation: 'Professionalism must be maintained throughout the entire interaction.'
      },

      // Role Instructions (3 questions)
      {
        category: 'Role Instructions',
        question: 'What should Creative Academy applicants provide?',
        options: [
          'Tournament earnings',
          'Two-three clips for review',
          'Social media accounts',
          'Coaching experience'
        ],
        correctAnswer: 1,
        explanation: 'Creative Academy applicants should send two-three clips for review.'
      },
      {
        category: 'Role Instructions',
        question: 'What do Academy Roster applicants need to provide?',
        options: [
          'Portfolio only',
          'Tracker with default dance image',
          'Streaming setup',
          'GFX portfolio'
        ],
        correctAnswer: 1,
        explanation: 'Academy Roster applicants need to link their tracker with an image of the default dance in lobby.'
      },
      {
        category: 'Role Instructions',
        question: 'What should blacklist entries include?',
        options: [
          'User, User ID, and Reason (Underage)',
          'Only username',
          'Only reason',
          'User and favorite game'
        ],
        correctAnswer: 0,
        explanation: 'Blacklist guidelines require User, User ID, and Reason (Underage).'
      }
    ];

    for (const q of questions) {
      await this.insertQuestion(
        q.category,
        q.question,
        q.options,
        q.correctAnswer,
        q.explanation
      );
    }

    console.log(`Inserted ${questions.length} default quiz questions`);
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = Database;
