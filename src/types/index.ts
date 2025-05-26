export type UserRole = 'recruiter' | 'candidate';
export type UserStatus = 'active' | 'inactive' | 'pending';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
}

export interface Candidate extends User {
  videos: Video[];
  answers: Answer[];
}

export interface Video {
  id: string;
  candidateId: string;
  url: string;
  title: string;
  duration: number;
  createdAt: Date;
}

export interface Question {
  id: string;
  text: string;
  order: number;
}

export interface Answer {
  id: string;
  candidateId: string;
  questionId: string;
  questionText: string;
  text: string;
  createdAt: Date;
}