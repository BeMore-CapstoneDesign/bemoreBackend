// Repository Pattern Interfaces
export interface IUserRepository {
  create(data: CreateUserData): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User>;
}

export interface IEmotionAnalysisRepository {
  saveSession(data: SaveSessionData): Promise<Session>;
  findUserSessions(userId: string, limit?: number): Promise<Session[]>;
  findSessionById(sessionId: string, userId: string): Promise<Session | null>;
  updateSession(sessionId: string, data: Partial<Session>): Promise<Session>;
}

export interface IChatRepository {
  saveMessage(data: SaveMessageData): Promise<Message>;
  findUserMessages(userId: string, limit?: number): Promise<Message[]>;
  findMessagesBySession(sessionId: string): Promise<Message[]>;
}

// Data Transfer Objects
export interface CreateUserData {
  email: string;
  passwordHash: string;
  name?: string;
}

export interface SaveSessionData {
  userId: string;
  vad: any;
  summary?: string;
  pdfUrl?: string;
}

export interface SaveMessageData {
  userId: string;
  content: string;
  role: 'user' | 'assistant';
  sessionId?: string;
}

// Domain Entities
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  date: Date;
  vad: any;
  summary?: string;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant';
  sessionId?: string;
  createdAt: Date;
} 