const config = require('../config');

class QuizService {
  constructor(database) {
    this.db = database;
  }

  async generateQuiz() {
    try {
      const questions = await this.db.getRandomQuestions(config.QUIZ_TOTAL_QUESTIONS);
      
      if (questions.length < config.QUIZ_TOTAL_QUESTIONS) {
        throw new Error(`Not enough questions available. Found ${questions.length}, required ${config.QUIZ_TOTAL_QUESTIONS}`);
      }

      // Shuffle questions and randomize answer options
      const quizQuestions = questions.map(q => {
        const options = JSON.parse(q.options);
        const shuffledOptions = this.shuffleArray([...options]);
        const newCorrectIndex = shuffledOptions.indexOf(options[q.correct_answer]);
        
        return {
          id: q.id,
          category: q.category,
          question: q.question,
          options: shuffledOptions,
          correctAnswer: newCorrectIndex,
          explanation: q.explanation,
          difficulty: q.difficulty
        };
      });

      return {
        questions: quizQuestions,
        totalQuestions: quizQuestions.length,
        passingScore: config.QUIZ_PASSING_SCORE,
        timeLimit: 30 * 60, // 30 minutes in seconds
        categories: [...new Set(quizQuestions.map(q => q.category))]
      };
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error;
    }
  }

  async submitQuiz(userId, answers, quizStartTime) {
    try {
      // Get the quiz questions to validate answers
      const questions = await this.db.getRandomQuestions(config.QUIZ_TOTAL_QUESTIONS);
      
      // Calculate score
      let correctAnswers = 0;
      const results = [];
      
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const userAnswer = answers[i];
        const options = JSON.parse(question.options);
        
        // Find the correct answer in the original options
        const isCorrect = userAnswer === question.correct_answer;
        
        if (isCorrect) {
          correctAnswers++;
        }
        
        results.push({
          questionId: question.id,
          question: question.question,
          userAnswer: userAnswer,
          correctAnswer: question.correct_answer,
          isCorrect: isCorrect,
          explanation: question.explanation,
          category: question.category
        });
      }

      const score = correctAnswers;
      const totalQuestions = questions.length;
      const passed = score >= config.QUIZ_PASSING_SCORE;
      
      // Record the quiz attempt
      await this.db.recordQuizAttempt(userId, score, totalQuestions, passed, {
        answers: answers,
        results: results,
        quizStartTime: quizStartTime,
        completionTime: new Date().toISOString(),
        timeTaken: Date.now() - new Date(quizStartTime).getTime()
      });

      // Handle failed attempts
      if (!passed) {
        await this.db.recordFailedAttempt(userId, config.QUIZ_RETRY_COOLDOWN);
      }

      return {
        score: score,
        totalQuestions: totalQuestions,
        passed: passed,
        passingScore: config.QUIZ_PASSING_SCORE,
        results: results,
        categoryBreakdown: this.calculateCategoryBreakdown(results),
        timeTaken: Date.now() - new Date(quizStartTime).getTime(),
        nextAttemptAllowed: passed ? null : new Date(Date.now() + config.QUIZ_RETRY_COOLDOWN)
      };
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  }

  async getQuizHistory(userId) {
    try {
      const attempts = await this.db.getUserQuizAttempts(userId);
      
      return attempts.map(attempt => ({
        id: attempt.id,
        score: attempt.score,
        totalQuestions: attempt.total_questions,
        passed: attempt.passed,
        attemptDate: attempt.attempt_date,
        quizData: JSON.parse(attempt.quiz_data || '{}')
      }));
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      throw error;
    }
  }

  async getLatestAttempt(userId) {
    try {
      const attempt = await this.db.getLatestQuizAttempt(userId);
      
      if (!attempt) {
        return null;
      }

      return {
        id: attempt.id,
        score: attempt.score,
        totalQuestions: attempt.total_questions,
        passed: attempt.passed,
        attemptDate: attempt.attempt_date,
        quizData: JSON.parse(attempt.quiz_data || '{}')
      };
    } catch (error) {
      console.error('Error fetching latest attempt:', error);
      throw error;
    }
  }

  async canRetakeQuiz(userId) {
    try {
      const nextAttemptAllowed = await this.db.getNextAttemptAllowed(userId);
      
      if (!nextAttemptAllowed) {
        return {
          canRetake: true,
          nextAttemptAllowed: null
        };
      }

      const now = new Date();
      const nextAllowed = new Date(nextAttemptAllowed.next_attempt_allowed);
      
      return {
        canRetake: now >= nextAllowed,
        nextAttemptAllowed: nextAllowed
      };
    } catch (error) {
      console.error('Error checking retake eligibility:', error);
      return {
        canRetake: false,
        nextAttemptAllowed: null
      };
    }
  }

  async getQuizStatistics() {
    try {
      const attempts = await this.db.all(`
        SELECT 
          COUNT(*) as total_attempts,
          AVG(score) as average_score,
          SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) as passed_count,
          COUNT(*) as total_count
        FROM quiz_attempts
      `);

      const categoryStats = await this.db.all(`
        SELECT 
          q.category,
          COUNT(*) as question_count,
          AVG(CASE WHEN qa.user_answer = q.correct_answer THEN 1 ELSE 0 END) * 100 as success_rate
        FROM quiz_questions q
        LEFT JOIN (
          SELECT json_extract(quiz_data, '$.results') as results
          FROM quiz_attempts
        ) qa ON true
        GROUP BY q.category
        ORDER BY success_rate DESC
      `);

      return {
        totalAttempts: attempts[0]?.total_attempts || 0,
        averageScore: Math.round(attempts[0]?.average_score || 0),
        passRate: attempts[0]?.total_count > 0 
          ? Math.round((attempts[0]?.passed_count / attempts[0]?.total_count) * 100)
          : 0,
        categoryPerformance: categoryStats
      };
    } catch (error) {
      console.error('Error fetching quiz statistics:', error);
      throw error;
    }
  }

  calculateCategoryBreakdown(results) {
    const breakdown = {};
    
    results.forEach(result => {
      if (!breakdown[result.category]) {
        breakdown[result.category] = {
          total: 0,
          correct: 0,
          percentage: 0
        };
      }
      
      breakdown[result.category].total++;
      if (result.isCorrect) {
        breakdown[result.category].correct++;
      }
    });

    // Calculate percentages
    Object.keys(breakdown).forEach(category => {
      const stats = breakdown[category];
      stats.percentage = Math.round((stats.correct / stats.total) * 100);
    });

    return breakdown;
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async validateQuizAnswers(quizId, answers) {
    try {
      // This would validate that the quiz session is still valid
      // and the user hasn't exceeded time limits, etc.
      return true;
    } catch (error) {
      console.error('Error validating quiz answers:', error);
      return false;
    }
  }

  async getQuestionsByCategory(category) {
    try {
      const questions = await this.db.getQuestionsByCategory(category);
      
      return questions.map(q => ({
        id: q.id,
        category: q.category,
        question: q.question,
        options: JSON.parse(q.options),
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty
      }));
    } catch (error) {
      console.error('Error fetching questions by category:', error);
      throw error;
    }
  }

  async addQuestion(category, question, options, correctAnswer, explanation, difficulty = 'medium') {
    try {
      const result = await this.db.insertQuestion(
        category,
        question,
        options,
        correctAnswer,
        explanation,
        difficulty
      );
      
      return {
        success: true,
        questionId: result.id
      };
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  }

  async updateQuestion(questionId, updates) {
    try {
      // Implementation for updating existing questions
      const fields = [];
      const values = [];
      
      if (updates.category) {
        fields.push('category = ?');
        values.push(updates.category);
      }
      if (updates.question) {
        fields.push('question = ?');
        values.push(updates.question);
      }
      if (updates.options) {
        fields.push('options = ?');
        values.push(JSON.stringify(updates.options));
      }
      if (updates.correctAnswer !== undefined) {
        fields.push('correct_answer = ?');
        values.push(updates.correctAnswer);
      }
      if (updates.explanation) {
        fields.push('explanation = ?');
        values.push(updates.explanation);
      }
      if (updates.difficulty) {
        fields.push('difficulty = ?');
        values.push(updates.difficulty);
      }
      
      if (fields.length === 0) {
        throw new Error('No valid fields to update');
      }
      
      values.push(questionId);
      
      await this.db.run(
        `UPDATE quiz_questions SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  }

  async deleteQuestion(questionId) {
    try {
      await this.db.run('DELETE FROM quiz_questions WHERE id = ?', [questionId]);
      return { success: true };
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }
}

module.exports = QuizService;
