export interface StoryboardSection {
  id: string;
  type: 'problem' | 'solution' | 'customer' | 'revenue' | 'risks' | 'custom';
  title: string;
  content: string;
  isCompleted: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
  isCustom?: boolean; // Flag to identify custom sections
}

export interface StoryboardData {
  id: string;
  title: string;
  sections: StoryboardSection[];
  createdAt: Date;
  updatedAt: Date;
  completionPercentage: number;
}

export const STORYBOARD_SECTIONS = {
  problem: {
    id: 'problem',
    title: 'Problem Statement',
    description: 'What problem does your business solve?',
    icon: '🔍',
    color: 'red',
  },
  solution: {
    id: 'solution',
    title: 'Solution',
    description: 'How does your business solve this problem?',
    icon: '💡',
    color: 'blue',
  },
  customer: {
    id: 'customer',
    title: 'Target Customer',
    description: 'Who are your target customers?',
    icon: '👥',
    color: 'green',
  },
  revenue: {
    id: 'revenue',
    title: 'Revenue Model',
    description: 'How will your business make money?',
    icon: '💰',
    color: 'yellow',
  },
  risks: {
    id: 'risks',
    title: 'Risks & Mitigation',
    description: 'What are the main risks and how will you address them?',
    icon: '⚠️',
    color: 'orange',
  },
} as const;
