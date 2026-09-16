import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Note from '@/models/Note';
import Deck from '@/models/Deck';
import Flashcard from '@/models/Flashcard';
import { verifyToken } from '@/lib/auth';

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  const verified = await verifyToken(token);
  return verified ? verified.userId : null;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'subject' | 'deck' | 'note' | 'concept';
  val: number;
  color: string;
  group: string;
  meta?: {
    entityId?: string;
    folder?: string;
    tags?: string[];
    cardCount?: number;
    description?: string;
    contentSnippet?: string;
  };
}

export interface GraphLink {
  source: string;
  target: string;
  type: 'contains' | 'tagged' | 'relates_to' | 'practices';
  value?: number;
}

// Color palette for knowledge domains
const PALETTES = {
  subject: '#6366f1', // Indigo
  deck: '#8b5cf6',    // Violet
  note: '#38bdf8',    // Sky
  concept: '#f59e0b', // Amber
};

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    await connectToDatabase();

    const [notes, decks, flashcards] = await Promise.all([
      Note.find({ userId }).lean(),
      Deck.find({ userId }).lean(),
      Flashcard.find({ userId }).lean(),
    ]);

    const nodesMap = new Map<string, GraphNode>();
    const links: GraphLink[] = [];

    // Helper to add node safely
    const addNode = (node: GraphNode) => {
      if (!nodesMap.has(node.id)) {
        nodesMap.set(node.id, node);
      }
    };

    // 1. Seed Core Foundational Concept Tree (as envisioned by user)
    // JavaScript -> Closures / Promises -> Scope / Async -> Variables / Await
    const foundationalConcepts: { id: string; label: string; group: string; val: number }[] = [
      { id: 'concept-js', label: 'JavaScript', group: 'JavaScript', val: 18 },
      { id: 'concept-closures', label: 'Closures', group: 'JavaScript', val: 13 },
      { id: 'concept-promises', label: 'Promises', group: 'JavaScript', val: 13 },
      { id: 'concept-scope', label: 'Lexical Scope', group: 'JavaScript', val: 10 },
      { id: 'concept-async', label: 'Async Programming', group: 'JavaScript', val: 10 },
      { id: 'concept-variables', label: 'Variables & Hoisting', group: 'JavaScript', val: 8 },
      { id: 'concept-await', label: 'Async / Await', group: 'JavaScript', val: 8 },
      { id: 'concept-eventloop', label: 'Event Loop', group: 'JavaScript', val: 9 },
      { id: 'concept-sm2', label: 'Spaced Repetition (SM-2)', group: 'Cognitive Science', val: 14 },
      { id: 'concept-activerecall', label: 'Active Recall', group: 'Cognitive Science', val: 11 },
    ];

    foundationalConcepts.forEach((c) => {
      addNode({
        id: c.id,
        label: c.label,
        type: 'concept',
        val: c.val,
        color: PALETTES.concept,
        group: c.group,
        meta: {
          description: `Core academic topic in ${c.group}`,
        },
      });
    });

    // Foundational relationships
    links.push(
      { source: 'concept-js', target: 'concept-closures', type: 'relates_to' },
      { source: 'concept-js', target: 'concept-promises', type: 'relates_to' },
      { source: 'concept-closures', target: 'concept-scope', type: 'relates_to' },
      { source: 'concept-promises', target: 'concept-async', type: 'relates_to' },
      { source: 'concept-scope', target: 'concept-variables', type: 'relates_to' },
      { source: 'concept-async', target: 'concept-await', type: 'relates_to' },
      { source: 'concept-async', target: 'concept-eventloop', type: 'relates_to' },
      { source: 'concept-sm2', target: 'concept-activerecall', type: 'relates_to' }
    );

    // 2. Add Folders as Subject Hub Nodes
    const folders = new Set<string>();
    notes.forEach((n: { folder?: string }) => {
      if (n.folder) folders.add(n.folder);
    });

    folders.forEach((folder) => {
      const folderId = `subject-${folder.toLowerCase().replace(/\s+/g, '-')}`;
      addNode({
        id: folderId,
        label: `${folder} Vault`,
        type: 'subject',
        val: 16,
        color: PALETTES.subject,
        group: folder,
        meta: {
          folder,
          description: `Knowledge cluster containing notes in ${folder}`,
        },
      });
    });

    // 3. Add Decks & link to subjects or concepts
    const cardCountByDeck = new Map<string, number>();
    flashcards.forEach((card: { deckId: { toString: () => string } }) => {
      const dId = card.deckId.toString();
      cardCountByDeck.set(dId, (cardCountByDeck.get(dId) || 0) + 1);
    });

    decks.forEach((deck: { _id: { toString: () => string }; name: string; description?: string }) => {
      const deckId = `deck-${deck._id.toString()}`;
      const count = cardCountByDeck.get(deck._id.toString()) || 0;

      addNode({
        id: deckId,
        label: deck.name,
        type: 'deck',
        val: 14,
        color: PALETTES.deck,
        group: deck.name,
        meta: {
          entityId: deck._id.toString(),
          cardCount: count,
          description: deck.description || `Spaced repetition flashcard deck with ${count} cards.`,
        },
      });

      // Link deck to Active Recall concept
      links.push({
        source: 'concept-activerecall',
        target: deckId,
        type: 'practices',
      });

      // If deck name matches or relates to JavaScript, link it
      if (deck.name.toLowerCase().includes('computer') || deck.name.toLowerCase().includes('javascript')) {
        links.push({
          source: deckId,
          target: 'concept-js',
          type: 'relates_to',
        });
      }
    });

    // 4. Add User Notes
    notes.forEach((note: { _id: { toString: () => string }; title: string; folder: string; tags?: string[]; content?: string }) => {
      const noteId = `note-${note._id.toString()}`;
      const folderId = `subject-${note.folder.toLowerCase().replace(/\s+/g, '-')}`;

      addNode({
        id: noteId,
        label: note.title || 'Untitled Note',
        type: 'note',
        val: 10,
        color: PALETTES.note,
        group: note.folder,
        meta: {
          entityId: note._id.toString(),
          folder: note.folder,
          tags: note.tags || [],
          contentSnippet: (note.content || '').slice(0, 140),
        },
      });

      // Link Note to its folder subject
      if (nodesMap.has(folderId)) {
        links.push({
          source: folderId,
          target: noteId,
          type: 'contains',
        });
      }

      // Link Note to tags / concepts
      (note.tags || []).forEach((tag: string) => {
        const cleanTag = tag.trim().toLowerCase();
        const tagNodeId = `tag-${cleanTag.replace(/[^a-z0-9]/g, '-')}`;

        addNode({
          id: tagNodeId,
          label: `#${cleanTag}`,
          type: 'concept',
          val: 8,
          color: PALETTES.concept,
          group: 'Tags',
          meta: {
            description: `Tag taxonomy #${cleanTag}`,
          },
        });

        links.push({
          source: noteId,
          target: tagNodeId,
          type: 'tagged',
        });
      });

      // Semantic link: If note mentions closure, promise, javascript, etc.
      const lowerTitle = (note.title || '').toLowerCase();
      const lowerContent = (note.content || '').toLowerCase();

      if (lowerTitle.includes('closure') || lowerContent.includes('closure')) {
        links.push({ source: noteId, target: 'concept-closures', type: 'relates_to' });
      }
      if (lowerTitle.includes('promise') || lowerContent.includes('promise')) {
        links.push({ source: noteId, target: 'concept-promises', type: 'relates_to' });
      }
      if (lowerTitle.includes('javascript') || lowerContent.includes('javascript')) {
        links.push({ source: noteId, target: 'concept-js', type: 'relates_to' });
      }
    });

    const nodes = Array.from(nodesMap.values());

    return NextResponse.json({
      success: true,
      graph: {
        nodes,
        links,
        stats: {
          totalNodes: nodes.length,
          totalLinks: links.length,
          subjectsCount: nodes.filter((n) => n.type === 'subject').length,
          decksCount: nodes.filter((n) => n.type === 'deck').length,
          notesCount: nodes.filter((n) => n.type === 'note').length,
          conceptsCount: nodes.filter((n) => n.type === 'concept').length,
        },
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('GET /api/graph error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate graph.' }, { status: 500 });
  }
}
