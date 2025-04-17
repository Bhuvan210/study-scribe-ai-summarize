
// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  isVerified?: boolean;
  profilePicture?: string;
  createdAt?: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
}

// Authentication types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Summary types
export interface SummaryParams {
  text: string;
  lengthType: "short" | "medium" | "long" | "percentage";
  lengthValue: string | number;
}

export interface Summary {
  id: string;
  originalText: string;
  summaryText: string;
  lengthType: string;
  lengthValue: string | number;
  createdAt: string;
  model?: string; // Add model information
}

export interface SummaryHistory {
  summaries: Summary[];
  isLoading: boolean;
}
