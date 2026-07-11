import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Flashcard Decks',
  description: 'Create custom review decks and study using the SM-2 spaced repetition algorithm.',
};

export default function FlashcardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
