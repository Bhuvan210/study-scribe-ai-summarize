
import { User } from "@/types";

// Simulated authentication service
class AuthService {
  // Store the current user in local storage for persistence
  private static USER_KEY = "study_scribe_user";
  
  async login(email: string, password: string): Promise<User> {
    // This is a mock implementation for demo purposes
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // In a real app, this would validate credentials against a backend
        if (email && password.length >= 8) {
          const user = { id: crypto.randomUUID(), email };
          localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error("Invalid email or password"));
        }
      }, 1000);
    });
  }
  
  async register(email: string, password: string): Promise<User> {
    // This is a mock implementation for demo purposes
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // In a real app, this would register the user with a backend
        if (email && password.length >= 8) {
          const user = { id: crypto.randomUUID(), email };
          localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error("Invalid email or password"));
        }
      }, 1000);
    });
  }
  
  async logout(): Promise<void> {
    // Remove the user from local storage
    localStorage.removeItem(AuthService.USER_KEY);
    return Promise.resolve();
  }
  
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(AuthService.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
  
  async resetPassword(email: string): Promise<void> {
    // In a real app, this would trigger a password reset email
    return Promise.resolve();
  }
}

export const authService = new AuthService();
