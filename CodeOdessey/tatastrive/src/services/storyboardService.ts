import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { StoryboardData, StoryboardSection } from '@/types/storyboard';

export const storyboardService = {
  // Create a new storyboard
  async createStoryboard(userId: string, storyboardData: StoryboardData): Promise<void> {
    try {
      const storyboardRef = doc(db, 'storyboards', storyboardData.id);
      
      // Convert Date objects to Firestore Timestamps
      const firestoreData = {
        ...storyboardData,
        userId,
        createdAt: storyboardData.createdAt instanceof Date ? Timestamp.fromDate(storyboardData.createdAt) : storyboardData.createdAt,
        updatedAt: serverTimestamp(),
        sections: storyboardData.sections.map(section => ({
          ...section,
          // Ensure dates are properly handled
          createdAt: section.createdAt ? (section.createdAt instanceof Date ? Timestamp.fromDate(section.createdAt) : section.createdAt) : null,
          updatedAt: section.updatedAt ? (section.updatedAt instanceof Date ? Timestamp.fromDate(section.updatedAt) : section.updatedAt) : null,
        }))
      };
      
      await setDoc(storyboardRef, firestoreData);
      console.log('Storyboard created in Firestore:', storyboardData.id);
    } catch (error) {
      console.error('Error creating storyboard:', error);
      throw new Error('Failed to create storyboard');
    }
  },

  // Get a specific storyboard by ID
  async getStoryboard(storyboardId: string): Promise<StoryboardData | null> {
    try {
      const storyboardRef = doc(db, 'storyboards', storyboardId);
      const storyboardSnap = await getDoc(storyboardRef);
      
      if (storyboardSnap.exists()) {
        const data = storyboardSnap.data();
        const storyboard: StoryboardData = {
          id: data.id,
          title: data.title,
          sections: data.sections.map((section: any) => ({
            ...section,
            // Convert Firestore Timestamps back to Date objects
            createdAt: section.createdAt?.toDate() || new Date(),
            updatedAt: section.updatedAt?.toDate() || new Date(),
          })),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          completionPercentage: data.completionPercentage || 0,
        };
        console.log('Storyboard retrieved from Firestore:', storyboardId);
        return storyboard;
      }
      console.log('Storyboard not found in Firestore');
      return null;
    } catch (error) {
      console.error('Error getting storyboard:', error);
      throw new Error('Failed to get storyboard');
    }
  },

  // Get all storyboards for a user
  async getUserStoryboards(userId: string): Promise<StoryboardData[]> {
    try {
      const storyboardsRef = collection(db, 'storyboards');
      const q = query(
        storyboardsRef, 
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const storyboards: StoryboardData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const storyboard: StoryboardData = {
          id: data.id,
          title: data.title,
          sections: data.sections.map((section: any) => ({
            ...section,
            // Convert Firestore Timestamps back to Date objects
            createdAt: section.createdAt?.toDate() || new Date(),
            updatedAt: section.updatedAt?.toDate() || new Date(),
          })),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          completionPercentage: data.completionPercentage || 0,
        };
        storyboards.push(storyboard);
      });
      
      // Sort by updatedAt in JavaScript instead of Firestore
      storyboards.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      
      console.log('User storyboards retrieved from Firestore:', storyboards.length);
      return storyboards;
    } catch (error) {
      console.error('Error getting user storyboards:', error);
      throw new Error('Failed to get user storyboards');
    }
  },

  // Update an existing storyboard
  async updateStoryboard(storyboardId: string, storyboardData: StoryboardData): Promise<void> {
    try {
      const storyboardRef = doc(db, 'storyboards', storyboardId);
      
      // Convert Date objects to Firestore Timestamps
      const firestoreData = {
        ...storyboardData,
        updatedAt: serverTimestamp(),
        sections: storyboardData.sections.map(section => ({
          ...section,
          // Ensure dates are properly handled
          createdAt: section.createdAt ? (section.createdAt instanceof Date ? Timestamp.fromDate(section.createdAt) : section.createdAt) : null,
          updatedAt: section.updatedAt ? (section.updatedAt instanceof Date ? Timestamp.fromDate(section.updatedAt) : section.updatedAt) : null,
        }))
      };
      
      await updateDoc(storyboardRef, firestoreData);
      console.log('Storyboard updated in Firestore:', storyboardId);
    } catch (error) {
      console.error('Error updating storyboard:', error);
      throw new Error('Failed to update storyboard');
    }
  },

  // Save or update storyboard (creates if doesn't exist, updates if exists)
  async saveStoryboard(userId: string, storyboardData: StoryboardData): Promise<void> {
    try {
      const storyboardRef = doc(db, 'storyboards', storyboardData.id);
      const storyboardSnap = await getDoc(storyboardRef);
      
      if (storyboardSnap.exists()) {
        // Update existing storyboard
        await this.updateStoryboard(storyboardData.id, storyboardData);
      } else {
        // Create new storyboard
        await this.createStoryboard(userId, storyboardData);
      }
    } catch (error) {
      console.error('Error saving storyboard:', error);
      throw new Error('Failed to save storyboard');
    }
  },

  // Delete a storyboard
  async deleteStoryboard(storyboardId: string): Promise<void> {
    try {
      const storyboardRef = doc(db, 'storyboards', storyboardId);
      await deleteDoc(storyboardRef);
      console.log('Storyboard deleted from Firestore:', storyboardId);
    } catch (error) {
      console.error('Error deleting storyboard:', error);
      throw new Error('Failed to delete storyboard');
    }
  },

  // Update a specific section in a storyboard
  async updateStoryboardSection(storyboardId: string, sectionId: string, sectionData: StoryboardSection): Promise<void> {
    try {
      const storyboardRef = doc(db, 'storyboards', storyboardId);
      const storyboardSnap = await getDoc(storyboardRef);
      
      if (storyboardSnap.exists()) {
        const data = storyboardSnap.data();
        const sections = data.sections.map((section: any) => 
          section.id === sectionId 
            ? {
                ...sectionData,
                // Ensure dates are properly handled
                createdAt: sectionData.createdAt ? (sectionData.createdAt instanceof Date ? Timestamp.fromDate(sectionData.createdAt) : sectionData.createdAt) : null,
                updatedAt: sectionData.updatedAt ? (sectionData.updatedAt instanceof Date ? Timestamp.fromDate(sectionData.updatedAt) : sectionData.updatedAt) : null,
              }
            : section
        );
        
        await updateDoc(storyboardRef, {
          sections,
          updatedAt: serverTimestamp(),
        });
        console.log('Storyboard section updated in Firestore:', sectionId);
      } else {
        throw new Error('Storyboard not found');
      }
    } catch (error) {
      console.error('Error updating storyboard section:', error);
      throw new Error('Failed to update storyboard section');
    }
  },
};
