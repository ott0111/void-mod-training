// User and Authentication Types
export interface User {
  id: string;
  discordUserId: string;
  discordUsername: string;
  email?: string;
  isVerified: boolean;
  isCertified: boolean;
  certificationDate?: Date;
  role?: 'trainee' | 'trial_mod' | 'moderator' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Discord Verification Types
export interface DiscordVerificationRequest {
  discordUserId: string;
  discordUsername: string;
}

export interface DiscordVerificationResponse {
  success: boolean;
  isMember: boolean;
  message: string;
  user?: User;
}

// Quiz Types
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: 'ticket_handling' | 'moderation' | 'commands' | 'roster' | 'policy';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizAttempt {
  id: string;
  userId: string;
  questions: QuizQuestion[];
  answers: number[];
  score: number;
  passed: boolean;
  startedAt: Date;
  completedAt?: Date;
  timeSpent?: number; // in seconds
}

export interface QuizResult {
  attemptId: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number;
  completedAt: Date;
}

// Training Content Types
export interface TrainingModule {
  id: string;
  title: string;
  content: string;
  order: number;
  category: string;
  estimatedReadTime: number; // in minutes
}

export interface TrainingProgress {
  userId: string;
  moduleId: string;
  completed: boolean;
  completedAt?: Date;
  timeSpent: number; // in seconds
}

// LOA (Leave of Absence) Types
export interface LOA {
  id: string;
  user: string;
  role: string;
  startTime: Date;
  endTime: Date;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  submittedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Discord Bot Configuration
export interface DiscordRoleConfig {
  trial_mod: string;
  staff_access: string;
  ticket_support: string;
  moderator: string;
  admin: string;
}

export interface DiscordBotConfig {
  token: string;
  clientId: string;
  guildId: string;
  roles: DiscordRoleConfig;
}

// Supabase Configuration
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Ticket Types (from training content)
export type TicketType = 
  | 'Player Report'
  | 'Staff Report'
  | 'Bug Report'
  | 'Appeal'
  | 'Question'
  | 'General Support'
  | 'Tournament Issue'
  | 'Cheating Report';

// Roster Categories
export type RosterCategory = 
  | 'Main Roster'
  | 'Sub Roster'
  | 'Trial Roster'
  | 'Reserve Roster'
  | 'Alumni';

// Moderation Commands
export interface ModCommand {
  name: string;
  description: string;
  usage: string;
  permissions: string[];
  examples: string[];
}

// Performance Metrics
export interface PerformanceMetrics {
  userId: string;
  week: string;
  ticketsHandled: number;
  averageResponseTime: number; // in minutes
  customerSatisfaction: number; // 1-5 rating
  escalationRate: number; // percentage
  accuracyScore: number; // percentage
}
