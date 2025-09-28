'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function RoleBasedNavigation() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return null;
  }

  const renderEntrepreneurLinks = () => (
    <>
      <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
        Home
      </Link>
      <Link href="/storyboard" className="text-gray-600 hover:text-blue-600 transition-colors">
        Storyboard
      </Link>
      <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
        About
      </Link>
    </>
  );

  const renderMentorLinks = () => (
    <Link href="/mentor" className="text-gray-600 hover:text-blue-600 transition-colors">
      Mentor Dashboard
    </Link>
  );

  const renderStakeholderLinks = () => (
    <Link href="/stakeholder" className="text-gray-600 hover:text-blue-600 transition-colors">
      Stakeholder Dashboard
    </Link>
  );

  return (
    <div className="flex space-x-6">
      {user.role === 'entrepreneurs' && renderEntrepreneurLinks()}
      {user.role === 'mentors' && renderMentorLinks()}
      {user.role === 'stakeholders' && renderStakeholderLinks()}
    </div>
  );
}
