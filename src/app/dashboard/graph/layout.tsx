import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Knowledge Graph',
  description: 'Interactive 2D and 3D spatial visualization of notes, decks, topics, and conceptual relationships.',
};

export default function KnowledgeGraphLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
