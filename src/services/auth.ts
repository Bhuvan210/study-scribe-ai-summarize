
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
          const user = { 
            id: crypto.randomUUID(), 
            email,
            isVerified: true,
            name: email.split("@")[0],
            createdAt: new Date().toISOString()
          };
          localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error("Invalid email or password"));
        }
      }, 1000);
    });
  }
  
  async googleAuth(): Promise<User> {
    // This is a mock implementation for Google Auth with verification
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, this would integrate with the Google OAuth API
        // And verification would happen through Google's authentication process
        const randomEmail = `user${Math.floor(Math.random() * 10000)}@gmail.com`;
        const randomName = `User ${Math.floor(Math.random() * 10000)}`;
        
        const user = { 
          id: crypto.randomUUID(), 
          email: randomEmail,
          isVerified: true, // Google accounts are considered verified
          name: randomName,
          profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(randomName)}&background=random`,
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
        resolve(user);
      }, 1000);
    });
  }
  
  async register(email: string, password: string): Promise<User> {
    // This is a mock implementation for demo purposes
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // In a real app, this would register the user with a backend
        if (email && password.length >= 8) {
          const user = { 
            id: crypto.randomUUID(), 
            email,
            isVerified: false, // Regular registration needs verification
            name: email.split("@")[0],
            createdAt: new Date().toISOString()
          };
          localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error("Invalid email or password"));
        }
      }, 1000);
    });
  }
  
  async verifyEmail(verificationCode: string): Promise<boolean> {
    // In a real app, this would validate the verification code against a backend
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = this.getCurrentUser();
        if (user && !user.isVerified) {
          user.isVerified = true;
          localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
          resolve(true);
        } else {
          resolve(false);
        }
      }, 500);
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

  async updateProfile(userData: Partial<User>): Promise<User> {
    return new Promise((resolve, reject) => {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        reject(new Error("No user logged in"));
        return;
      }

      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem(AuthService.USER_KEY, JSON.stringify(updatedUser));
      resolve(updatedUser);
    });
  }
}

export const authService = new AuthService();
