import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Kanban Planner',
  description: 'Track your study tasks and homework assignments on a simple Kanban board.',
};

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
