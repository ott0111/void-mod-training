import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Quiz service
export const quizService = {
  // Generate quiz questions
  generateQuiz: async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error;
    }
  },

  // Submit quiz answers
  submitQuiz: async (userId, answers, quizId) => {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: userId,
          quiz_id: quizId,
          answers: answers,
          score: answers.filter((answer, index) => answer === correctAnswers[index]).length,
          passed: answers.filter((answer, index) => answer === correctAnswers[index]).length >= 7,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  },

  // Get user quiz history
  getQuizHistory: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      throw error;
    }
  },

  // Check if user can retake quiz
  canRetakeQuiz: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('created_at, passed')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { canRetake: true, nextAttemptAllowed: null };
      }

      const lastAttempt = data[0];
      
      if (lastAttempt.passed) {
        return { canRetake: false, nextAttemptAllowed: null, reason: 'Already passed' };
      }

      const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours
      const nextAttemptAllowed = new Date(lastAttempt.created_at.getTime() + cooldownPeriod);
      const now = new Date();

      return {
        canRetake: now >= nextAttemptAllowed,
        nextAttemptAllowed: nextAttemptAllowed,
        reason: now < nextAttemptAllowed ? 'Cooldown period active' : null
      };
    } catch (error) {
      console.error('Error checking retake eligibility:', error);
      throw error;
    }
  }
};

// User service
export const userService = {
  // Get user profile
  getProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userId, updates) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Get user certifications
  getCertifications: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching certifications:', error);
      throw error;
    }
  }
};

// Admin service
export const adminService = {
  // Get all users
  getAllUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          quiz_attempts(
            score,
            passed,
            created_at
          ),
          certifications(
            id,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  // Get quiz statistics
  getQuizStats: async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('score, passed, created_at');

      if (error) throw error;

      const totalAttempts = data.length;
      const passedAttempts = data.filter(attempt => attempt.passed).length;
      const averageScore = data.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts;

      return {
        totalAttempts,
        passedAttempts,
        failedAttempts: totalAttempts - passedAttempts,
        passRate: totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0,
        averageScore: averageScore || 0
      };
    } catch (error) {
      console.error('Error fetching quiz stats:', error);
      throw error;
    }
  }
};

export default supabase;
