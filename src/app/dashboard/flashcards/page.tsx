'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Plus, Trash2, ArrowLeft, HelpCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
import ReviewSession from '@/components/review/ReviewSession';
import Modal from '@/components/ui/Modal';

interface Deck {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
}

interface Flashcard {
  _id: string;
  deckId: string;
  front: string;
  back: string;
  nextReview: string;
  repetitions: number;
  interval?: number;
  easeFactor?: number;
}

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCards, setIsLoadingCards] = useState(false);

  // Practice session state
  const [viewMode, setViewMode] = useState<'decks' | 'practice' | 'manage'>('decks');
  const [practiceCards, setPracticeCards] = useState<Flashcard[]>([]);

  // Modal / Form States
  const [deckModalOpen, setDeckModalOpen] = useState(false);
  const [deckName, setDeckName] = useState('');
  const [deckDesc, setDeckDesc] = useState('');

  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');

  // Fetch Flashcards for selected deck
  const fetchFlashcards = useCallback(async (deckId: string) => {
    setIsLoadingCards(true);
    try {
      const res = await fetch(`/api/decks/${deckId}/flashcards`);
      if (res.ok) {
        const data = await res.json();
        const cards = data.flashcards || [];
        setFlashcards(cards);

        // Initialize practice cards directly inside fetch call
        const now = new Date();
        const due = cards.filter((card: Flashcard) => new Date(card.nextReview) <= now);
        setPracticeCards(due.length > 0 ? due : cards);
      }
    } catch {
      toast.error('Failed to load flashcards.');
    } finally {
      setIsLoadingCards(false);
    }
  }, []);

  const handleSelectDeck = useCallback((deck: Deck, view: 'practice' | 'manage') => {
    setActiveDeck(deck);
    setViewMode(view);
    fetchFlashcards(deck._id);
  }, [fetchFlashcards]);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const res = await fetch('/api/decks');
        if (res.ok) {
          const data = await res.json();
          const loadedDecks = data.decks || [];
          setDecks(loadedDecks);

          if (typeof window !== 'undefined' && loadedDecks.length > 0) {
            const params = new URLSearchParams(window.location.search);
            if (params.get('action') === 'practice') {
              handleSelectDeck(loadedDecks[0], 'practice');
            }
          }
        }
      } catch {
        toast.error('Failed to load decks.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDecks();
  }, [handleSelectDeck]);

  // Dynamically update document title to reflect active deck name
  useEffect(() => {
    if (activeDeck) {
      document.title = `${activeDeck.name} | StudyVault`;
    } else {
      document.title = 'Flashcard Decks | StudyVault';
    }
  }, [activeDeck]);

  // Create Deck
  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckName) {
      toast.error('Deck name is required.');
      return;
    }

    try {
      const res = await fetch('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: deckName, description: deckDesc }),
      });

      if (res.ok) {
        const data = await res.json();
        setDecks((prev) => [data.deck, ...prev]);
        setDeckModalOpen(false);
        setDeckName('');
        setDeckDesc('');
        toast.success('Deck created.');
      }
    } catch {
      toast.error('Failed to create deck.');
    }
  };

  // Delete Deck
  const handleDeleteDeck = async (deckId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this deck? All flashcards in it will be lost.')) return;

    try {
      const res = await fetch(`/api/decks/${deckId}`, { method: 'DELETE' });
      if (res.ok) {
        setDecks((prev) => prev.filter((d) => d._id !== deckId));
        toast.success('Deck deleted.');
      }
    } catch {
      toast.error('Failed to delete deck.');
    }
  };

  // Create Flashcard
  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDeck) return;
    if (!cardFront || !cardBack) {
      toast.error('Front and back text are required.');
      return;
    }

    try {
      const res = await fetch(`/api/decks/${activeDeck._id}/flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ front: cardFront, back: cardBack }),
      });

      if (res.ok) {
        const data = await res.json();
        setFlashcards((prev) => [...prev, data.flashcard]);
        setCardModalOpen(false);
        setCardFront('');
        setCardBack('');
        toast.success('Flashcard added.');
      }
    } catch {
      toast.error('Failed to add card.');
    }
  };

  // Delete Flashcard
  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;

    try {
      const res = await fetch(`/api/flashcards/${cardId}`, { method: 'DELETE' });
      if (res.ok) {
        setFlashcards((prev) => prev.filter((c) => c._id !== cardId));
        toast.success('Flashcard deleted.');
      }
    } catch {
      toast.error('Failed to delete card.');
    }
  };

  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {/* 1. DECKS INDEX VIEW */}
        {viewMode === 'decks' && (
          <motion.div
            key="decks-index"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Active Recall Decks</h1>
                <p className="text-sm text-muted-foreground mt-1">Review flashcards with optimized spaced repetition schedules.</p>
              </div>
            <button
              onClick={() => setDeckModalOpen(true)}
              className="flex items-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg cursor-pointer transition-all hover:scale-[1.01]"
            >
              <Plus className="h-4.5 w-4.5" /> New Deck
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" /> Loading study decks...
            </div>
          ) : decks.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl max-w-md mx-auto">
              <Layers className="h-12 w-12 text-border mx-auto mb-4" />
              <h3 className="font-bold text-foreground">No Decks Found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto mb-5">
                Create a flashcard deck to store questions, terms, and study formulas.
              </p>
              <button
                onClick={() => setDeckModalOpen(true)}
                className="bg-card border border-border text-xs px-4 py-2 rounded-lg font-semibold text-foreground hover:bg-muted"
              >
                Create Your First Deck
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck) => (
                <div
                  key={deck._id}
                  className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-border transition-all relative group"
                >
                  <div>
                    <h3 className="text-md font-bold text-foreground group-hover:text-indigo-400 transition-colors">
                      {deck.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 min-h-8">
                      {deck.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border mt-6 pt-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSelectDeck(deck, 'practice')}
                        className="text-xs bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400 dark:text-indigo-300 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
                      >
                        Study
                      </button>
                      <button
                        onClick={() => handleSelectDeck(deck, 'manage')}
                        className="text-xs bg-card border border-border hover:bg-muted text-muted-foreground px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer"
                      >
                        Cards
                      </button>
                    </div>

                    <button
                      onClick={(e) => handleDeleteDeck(deck._id, e)}
                      className="p-1.5 rounded-lg bg-muted/60 border border-transparent hover:border-red-500/20 hover:text-red-400 transition-all cursor-pointer"
                      title="Delete Deck"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          </motion.div>
        )}

      {/* 2. FLASHCARD PRACTICE WORKSPACE (POWERED BY MOTION & SM-2) */}
      {viewMode === 'practice' && activeDeck && (
        <motion.div
          key="practice-view"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {isLoadingCards ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : (
            <ReviewSession
              deck={activeDeck}
              initialCards={practiceCards.length > 0 ? practiceCards : flashcards}
              onExit={() => {
                setViewMode('decks');
                fetchFlashcards(activeDeck._id);
              }}
            />
          )}
        </motion.div>
      )}

      {/* 3. CARD MANAGER VIEW */}
      {viewMode === 'manage' && activeDeck && (
        <motion.div
          key="manage-view"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('decks')}
                className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h2 className="text-xl font-bold">{activeDeck.name}</h2>
                <p className="text-xs text-muted-foreground">Card Database &bull; {flashcards.length} cards</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('practice')}
                className="bg-muted border border-border text-foreground hover:bg-card font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Practice Deck
              </button>
              <button
                onClick={() => setCardModalOpen(true)}
                className="bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Add Card
              </button>
            </div>
          </div>

          {isLoadingCards ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : flashcards.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-2xl max-w-md mx-auto">
              <HelpCircle className="h-12 w-12 text-border mx-auto mb-4" />
              <h3 className="font-bold text-foreground">No Cards Added</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto mb-5">
                Add flashcards containing questions on the front and answers on the back.
              </p>
              <button
                onClick={() => setCardModalOpen(true)}
                className="bg-card border border-border text-xs px-4 py-2 rounded-lg font-semibold text-foreground hover:bg-muted"
              >
                Add First Card
              </button>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/60 text-muted-foreground font-bold border-b border-border">
                      <th className="p-4 w-[40%]">Front / Prompt</th>
                      <th className="p-4 w-[40%]">Back / Answer</th>
                      <th className="p-4 w-[15%]">Next Review</th>
                      <th className="p-4 w-[5%] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {flashcards.map((card) => (
                      <tr key={card._id} className="hover:bg-muted/10">
                        <td className="p-4 font-medium text-foreground break-all">{card.front}</td>
                        <td className="p-4 text-muted-foreground break-all">{card.back}</td>
                        <td className="p-4 text-muted-foreground whitespace-nowrap">
                          {new Date(card.nextReview).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteCard(card._id)}
                            className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete Card"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>

      {/* --- MODAL: CREATE DECK --- */}
      <Modal
        isOpen={deckModalOpen}
        onClose={() => setDeckModalOpen(false)}
        title="Create New Deck"
        description="Group flashcards by topic or study curriculum."
      >
        <form onSubmit={handleCreateDeck} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Deck Name</label>
            <input
              type="text"
              placeholder="e.g. Physics Formulas, Spanish Vocabulary"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              className="w-full px-4 py-2.5 bg-card border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none text-sm text-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</label>
            <textarea
              placeholder="Summary of this deck..."
              value={deckDesc}
              onChange={(e) => setDeckDesc(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-card border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none text-sm text-foreground resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeckModalOpen(false)}
              className="px-4 py-2 bg-card border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-lg cursor-pointer"
            >
              Create Deck
            </button>
          </div>
        </form>
      </Modal>

      {/* --- MODAL: ADD CARD --- */}
      <Modal
        isOpen={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        title="Add Flashcard"
        description="Craft an active recall question and answer."
      >
        <form onSubmit={handleCreateCard} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Front / Question</label>
            <textarea
              placeholder="Type the front prompt or question..."
              value={cardFront}
              onChange={(e) => setCardFront(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-card border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none text-sm text-foreground resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Back / Answer</label>
            <textarea
              placeholder="Type the answer or details..."
              value={cardBack}
              onChange={(e) => setCardBack(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-card border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none text-sm text-foreground resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCardModalOpen(false)}
              className="px-4 py-2 bg-card border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-lg cursor-pointer"
            >
              Add Card
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
