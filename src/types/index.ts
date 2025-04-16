
// User types
export interface User {
  id: string;
  email: string;
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
  lengthType: "short" | "medium" | "long" | "percentage";
  lengthValue: string | number;
  createdAt: string;
}

export interface SummaryHistory {
  summaries: Summary[];
  isLoading: boolean;
}
