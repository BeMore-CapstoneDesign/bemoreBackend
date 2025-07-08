import { Message, Session } from './repositories.interface';
import { CreateUserDto, LoginUserDto } from '../dto/user.dto';

// Service Layer Interfaces
export interface IEmotionAnalysisService {
  analyzeEmotion(data: EmotionAnalysisInput): Promise<EmotionAnalysisResult>;
  generateCBTFeedback(vad: VadResult): string;
}

export interface IChatService {
  chatWithAI(data: ChatInput): Promise<ChatResponse>;
  getChatHistory(userId: string, limit?: number): Promise<Message[]>;
}

export interface IUserService {
  createUser(data: CreateUserDto): Promise<UserResponse>;
  authenticateUser(data: LoginUserDto): Promise<AuthResponse>;
  findUserById(id: string): Promise<UserResponse>;
}

export interface IHistoryService {
  saveSession(userId: string, analysisResult: EmotionAnalysisResult): Promise<Session>;
  getUserHistory(userId: string): Promise<Session[]>;
  getSessionById(sessionId: string, userId: string): Promise<Session | null>;
  generatePDF(sessionId: string, userId: string): Promise<{ pdfUrl: string }>;
}

// Input/Output DTOs
export interface EmotionAnalysisInput {
  image?: string;
  audio?: string;
  text?: string;
}

export interface ChatInput {
  message: string;
  history?: ChatMessageDto[];
  userId: string;
}

export interface ChatResponse {
  message: string;
  timestamp: Date;
}

export interface UserResponse {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
}

export interface AuthResponse {
  access_token: string;
  user: UserResponse;
}

// Domain Types
export interface VadResult {
  valence: number;
  arousal: number;
  dominance: number;
  confidence: number;
}

export interface EmotionAnalysisResult {
  vad: VadResult;
  summary: string;
  cbtFeedback: string;
  timestamp: Date;
}

export interface ChatMessageDto {
  content: string;
  role: 'user' | 'assistant';
} 