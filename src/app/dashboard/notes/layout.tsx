import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Notes Vault',
  description: 'Create, organize, and edit markdown notes with live previews and autosave.',
};

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
