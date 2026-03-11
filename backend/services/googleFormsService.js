const { google } = require('googleapis');
const config = require('../config');

class GoogleFormsService {
  constructor() {
    this.auth = null;
    this.forms = null;
    this.sheets = null;
    this.isConfigured = false;
  }

  async initialize() {
    try {
      // Check if credentials file exists
      const fs = require('fs');
      const path = require('path');
      
      const credentialsPath = path.resolve(__dirname, '../' + config.GOOGLE_CREDENTIALS_PATH);
      
      if (!fs.existsSync(credentialsPath)) {
        console.warn('Google credentials file not found. Google Forms integration will be disabled.');
        return false;
      }

      // Initialize Google Auth
      const auth = new google.auth.GoogleAuth({
        keyFile: credentialsPath,
        scopes: [
          'https://www.googleapis.com/auth/forms.body.readonly',
          'https://www.googleapis.com/auth/forms.responses.readonly',
          'https://www.googleapis.com/auth/spreadsheets.readonly'
        ]
      });

      this.auth = await auth.getClient();
      this.forms = google.forms({ version: 'v1', auth: this.auth });
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      
      this.isConfigured = true;
      console.log('Google Forms service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Forms service:', error);
      this.isConfigured = false;
      return false;
    }
  }

  async getFormResponses() {
    if (!this.isConfigured) {
      throw new Error('Google Forms service is not configured');
    }

    try {
      const formId = config.GOOGLE_FORM_ID;
      
      // Get form responses
      const response = await this.forms.forms.responses.list({
        formId: formId,
        pageSize: 100 // Adjust as needed
      });

      const responses = response.data.responses || [];
      return this.processFormResponses(responses);
    } catch (error) {
      console.error('Error fetching form responses:', error);
      throw error;
    }
  }

  async getSheetResponses() {
    if (!this.isConfigured || !config.GOOGLE_SHEET_ID) {
      throw new Error('Google Sheets service is not configured');
    }

    try {
      const sheetId = config.GOOGLE_SHEET_ID;
      
      // Get sheet data
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'A:Z' // Adjust range as needed
      });

      const rows = response.data.values || [];
      return this.processSheetResponses(rows);
    } catch (error) {
      console.error('Error fetching sheet responses:', error);
      throw error;
    }
  }

  processFormResponses(responses) {
    const processedResponses = [];
    
    responses.forEach((response, index) => {
      try {
        const answers = response.answers || {};
        const respondent = response.respondentEmail || `Respondent_${index + 1}`;
        
        // Process each answer
        const processedAnswers = {};
        let score = 0;
        let totalQuestions = 0;
        
        Object.keys(answers).forEach(questionId => {
          const answer = answers[questionId];
          const question = this.extractQuestionInfo(answer);
          
          if (question) {
            processedAnswers[questionId] = {
              question: question.text,
              answer: answer.textAnswers?.answers?.[0]?.value || 'No answer',
              isCorrect: this.evaluateAnswer(answer),
              score: this.getQuestionScore(answer)
            };
            
            if (processedAnswers[questionId].isCorrect) {
              score += processedAnswers[questionId].score;
            }
            totalQuestions++;
          }
        });

        processedResponses.push({
          respondent: respondent,
          responseId: response.responseId,
          timestamp: response.createdTime,
          score: score,
          totalQuestions: totalQuestions,
          passed: score >= config.QUIZ_PASSING_SCORE,
          answers: processedAnswers,
          completed: response.completed
        });
      } catch (error) {
        console.error(`Error processing response ${index}:`, error);
      }
    });

    return processedResponses;
  }

  processSheetResponses(rows) {
    if (rows.length < 2) {
      return []; // No data or only headers
    }

    const headers = rows[0];
    const processedResponses = [];
    
    // Skip header row and process data rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const response = this.mapRowToResponse(headers, row);
      
      if (response) {
        processedResponses.push(response);
      }
    }

    return processedResponses;
  }

  mapRowToResponse(headers, row) {
    try {
      // Find key columns
      const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'));
      const timestampIndex = headers.findIndex(h => h.toLowerCase().includes('timestamp'));
      const scoreIndex = headers.findIndex(h => h.toLowerCase().includes('score'));
      
      if (emailIndex === -1 || scoreIndex === -1) {
        return null; // Missing required columns
      }

      const email = row[emailIndex] || `Respondent_${Date.now()}`;
      const timestamp = row[timestampIndex] || new Date().toISOString();
      const score = parseInt(row[scoreIndex]) || 0;
      
      // Count total questions (exclude metadata columns)
      const questionColumns = headers.filter((h, index) => 
        index !== emailIndex && 
        index !== timestampIndex && 
        index !== scoreIndex &&
        !h.toLowerCase().includes('name') &&
        !h.toLowerCase().includes('discord')
      );

      return {
        respondent: email,
        timestamp: timestamp,
        score: score,
        totalQuestions: questionColumns.length,
        passed: score >= config.QUIZ_PASSING_SCORE,
        answers: {}, // Could be expanded to include individual answers
        completed: true
      };
    } catch (error) {
      console.error('Error mapping row to response:', error);
      return null;
    }
  }

  extractQuestionInfo(answer) {
    // This would need to be customized based on your form structure
    // For now, return a basic structure
    return {
      text: 'Question', // Would need to be extracted from form metadata
      score: 1 // Default score per question
    };
  }

  evaluateAnswer(answer) {
    // This would need to be customized based on your correct answers
    // For now, return a placeholder
    return Math.random() > 0.5; // Random for demonstration
  }

  getQuestionScore(answer) {
    // This would need to be customized based on your scoring system
    return 1; // Default score per question
  }

  async getLatestResponses(since = null) {
    try {
      const responses = await this.getFormResponses();
      
      if (since) {
        const sinceDate = new Date(since);
        return responses.filter(response => 
          new Date(response.timestamp) > sinceDate
        );
      }
      
      return responses;
    } catch (error) {
      console.error('Error getting latest responses:', error);
      return [];
    }
  }

  async checkUserQuizStatus(email) {
    try {
      const responses = await this.getFormResponses();
      
      // Find responses from this user
      const userResponses = responses.filter(response => 
        response.respondent === email
      );

      if (userResponses.length === 0) {
        return {
          hasTakenQuiz: false,
          latestAttempt: null
        };
      }

      // Get the most recent attempt
      const latestAttempt = userResponses.reduce((latest, current) => 
        new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
      );

      return {
        hasTakenQuiz: true,
        latestAttempt: latestAttempt,
        totalAttempts: userResponses.length
      };
    } catch (error) {
      console.error('Error checking user quiz status:', error);
      return {
        hasTakenQuiz: false,
        latestAttempt: null
      };
    }
  }

  async getQuizStatistics() {
    try {
      const responses = await this.getFormResponses();
      
      const totalAttempts = responses.length;
      const passedAttempts = responses.filter(r => r.passed).length;
      const averageScore = responses.reduce((sum, r) => sum + r.score, 0) / totalAttempts || 0;
      
      return {
        totalAttempts,
        passedAttempts,
        failedAttempts: totalAttempts - passedAttempts,
        passRate: totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0,
        averageScore: Math.round(averageScore * 100) / 100
      };
    } catch (error) {
      console.error('Error getting quiz statistics:', error);
      return {
        totalAttempts: 0,
        passedAttempts: 0,
        failedAttempts: 0,
        passRate: 0,
        averageScore: 0
      };
    }
  }

  async syncResponsesToDatabase(database) {
    try {
      const responses = await this.getFormResponses();
      let syncedCount = 0;
      
      for (const response of responses) {
        try {
          // Check if this response already exists
          const existingUser = await database.getUserByDiscordId(response.respondent);
          
          if (!existingUser) {
            // Create user record (simplified - you'd need proper Discord user info)
            await database.run(
              'INSERT OR IGNORE INTO users (discord_id, discord_username) VALUES (?, ?)',
              [response.respondent, response.respondent.split('@')[0]]
            );
          }
          
          // Record the quiz attempt
          const user = await database.getUserByDiscordId(response.respondent);
          if (user) {
            await database.recordQuizAttempt(
              user.id,
              response.score,
              response.totalQuestions,
              response.passed,
              response.answers
            );
            syncedCount++;
          }
        } catch (error) {
          console.error(`Error syncing response ${response.responseId}:`, error);
        }
      }
      
      console.log(`Synced ${syncedCount} responses to database`);
      return syncedCount;
    } catch (error) {
      console.error('Error syncing responses to database:', error);
      throw error;
    }
  }

  isAvailable() {
    return this.isConfigured;
  }

  async testConnection() {
    if (!this.isConfigured) {
      return { success: false, error: 'Service not configured' };
    }

    try {
      // Try to access the form
      await this.forms.forms.get({ formId: config.GOOGLE_FORM_ID });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = GoogleFormsService;
