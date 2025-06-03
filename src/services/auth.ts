import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Real authentication service using Supabase
class AuthService {
  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("Login failed");
    }

    return this.mapSupabaseUser(data.user);
  }
  
  async googleAuth(): Promise<User> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    // For OAuth, we need to handle the redirect flow
    // The user will be available after the redirect
    throw new Error("Redirecting to Google...");
  }
  
  async register(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("Registration failed");
    }

    return this.mapSupabaseUser(data.user);
  }
  
  async verifyEmail(verificationCode: string): Promise<boolean> {
    // Supabase handles email verification through email links
    // This method can be used for custom verification flows if needed
    return true;
  }
  
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }
  
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        // Check if this is just a missing session (normal for logged-out users)
        if (error.message === 'Auth session missing!') {
          console.info('No active session found - user is not logged in');
          return null;
        }
        // Log other errors as actual errors
        console.error("Error getting current user:", error);
        return null;
      }
      
      return user ? this.mapSupabaseUser(user) : null;
    } catch (error) {
      // Handle unexpected errors
      console.error("Unexpected error getting current user:", error);
      return null;
    }
  }
  
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        name: userData.name,
        bio: userData.bio,
        location: userData.location,
        phone: userData.phone,
        website: userData.website,
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("Profile update failed");
    }

    return this.mapSupabaseUser(data.user);
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ? this.mapSupabaseUser(session.user) : null;
      callback(user);
    });
  }

  private mapSupabaseUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || '',
      isVerified: supabaseUser.email_confirmed_at ? true : false,
      profilePicture: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
      createdAt: supabaseUser.created_at,
      bio: supabaseUser.user_metadata?.bio,
      location: supabaseUser.user_metadata?.location,
      phone: supabaseUser.user_metadata?.phone,
      website: supabaseUser.user_metadata?.website,
    };
  }
}

export const authService = new AuthService();