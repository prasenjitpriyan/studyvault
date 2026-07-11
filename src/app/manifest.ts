import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StudyVault Workspace',
    short_name: 'StudyVault',
    description: 'Organise notes with markdown editor, master flashcards using active recall & spaced repetition, and track tasks on a sleek Kanban board.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#6366f1',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
