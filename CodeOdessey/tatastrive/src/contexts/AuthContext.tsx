'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { userService } from '@/services/userService';
import { User, UserRole } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  showUserDataMissingPopup: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  completeUserProfile: (role: UserRole) => Promise<void>;
  closeUserDataMissingPopup: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUserDataMissingPopup, setShowUserDataMissingPopup] = useState(false);
  const router = useRouter();

  // Function to navigate to role-specific page
  const navigateToRolePage = (role: UserRole) => {
    console.log('Navigating to role-specific page for:', role);
    switch (role) {
      case 'entrepreneurs':
        router.push('/');
        break;
      case 'mentors':
        router.push('/mentor');
        break;
      case 'stakeholders':
        router.push('/analytics');
        break;
      default:
        router.push('/');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Check if user exists in Firestore
          let userData = await userService.getUser(firebaseUser.uid);
          
          if (!userData) {
            // User doesn't exist in Firestore, show popup to complete profile
            console.log('User not found in Firestore, showing profile completion popup');
            setShowUserDataMissingPopup(true);
            setUser(null); // Don't set user until profile is complete
          } else {
            // User exists in Firestore, update last login and set user
            await userService.updateLastLogin(firebaseUser.uid);
            userData.lastLogin = new Date();
            setUser(userData);
            setShowUserDataMissingPopup(false);
            
            // Navigate to role-specific page
            navigateToRolePage(userData.role);
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
          // On error, show popup to complete profile
          setShowUserDataMissingPopup(true);
          setUser(null);
        }
      } else {
        setUser(null);
        setShowUserDataMissingPopup(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signUp = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await userCredential.user.updateProfile({ displayName: name });
      
      // Create user in Firestore
      const userData: User = {
        id: userCredential.user.uid,
        name,
        email,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
      };
      
      await userService.createUser(userCredential.user.uid, userData);
      
      // Navigate to role-specific page
      navigateToRolePage(role);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account');
    }
  };


  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const completeUserProfile = async (role: UserRole) => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('No authenticated user found');
      }

      // Create user profile in Firestore
      const userData: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
      };

      await userService.createUser(firebaseUser.uid, userData);
      setUser(userData);
      setShowUserDataMissingPopup(false);
      console.log('User profile completed and created in Firestore');
      
      // Navigate to role-specific page
      navigateToRolePage(role);
    } catch (error: any) {
      console.error('Error completing user profile:', error);
      throw new Error(error.message || 'Failed to complete profile');
    }
  };

  const closeUserDataMissingPopup = () => {
    setShowUserDataMissingPopup(false);
    // Sign out the user if they close the popup without completing profile
    signOut(auth);
  };

  const value = {
    user,
    loading,
    showUserDataMissingPopup,
    signIn,
    signUp,
    signOut: handleSignOut,
    completeUserProfile,
    closeUserDataMissingPopup,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
