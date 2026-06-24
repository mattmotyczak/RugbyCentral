export interface User {
  id: string;
  username: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  author: string;
  authorId?: string;
  title: string;
  content: string;
  type: "general" | "analysis";
  category: "news" | "tactics" | "transfers" | "general";
  votes: number;
  votedUserIds?: string[];
  comments: Comment[];
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  type: "international" | "match_result" | "upcoming";
  category: string;
  imageUrl?: string;
  date: string;
  
  // Match-specific fields
  teamA?: string;
  teamB?: string;
  scoreA?: number;
  scoreB?: number;
  kickOff?: string;
  venue?: string;
}

export interface RugbyPlayer {
  id: string;
  name: string;
  position: string;
  rating: number;
  club: string;
  country: string;
  isCustom: boolean;
  userId?: string;
}

export interface OnFieldPlayer {
  id: string;
  name: string;
  position: string;
  roleName: string; // The specific position role (e.g. "Fly-half", "Prop 1")
  x: number; // percentage coordinate on pitch 0-100
  y: number; // percentage coordinate on pitch 0-100
}

export interface TacticBoard {
  id: string;
  name: string;
  formation: "15-union" | "7-sevens" | "custom";
  playersOnField: OnFieldPlayer[];
  userId: string;
  username: string;
  notes?: string;
  createdAt: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
}
