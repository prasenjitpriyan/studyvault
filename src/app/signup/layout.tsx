import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Join StudyVault to organize your knowledge, review flashcards, and track tasks today.',
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
