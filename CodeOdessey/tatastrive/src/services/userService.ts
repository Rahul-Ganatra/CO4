import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, UserRole } from '@/types/auth';

export const userService = {
  // Create a new user in Firestore
  async createUser(userId: string, userData: User): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      
      // Clean the user data to remove undefined values
      const cleanUserData = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        ...(userData.photoURL && { photoURL: userData.photoURL }),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };
      
      await setDoc(userRef, cleanUserData);
      console.log('User created in Firestore:', userId);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Get user data from Firestore
  async getUser(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        console.log('User found in Firestore:', userId);
        return userData;
      } else {
        console.log('User not found in Firestore:', userId);
        return null;
      }
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Update user data in Firestore
  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      console.log('User updated in Firestore:', userId);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Update last login timestamp
  async updateLastLogin(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
      });
      console.log('Last login updated for user:', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  },
};
