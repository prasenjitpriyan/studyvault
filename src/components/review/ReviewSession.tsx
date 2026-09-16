'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { getIntervalPreviews, SM2Rating } from '@/lib/sm2';
import ReviewProgress from './ReviewProgress';
import ReviewCard, { CardData } from './ReviewCard';
import RatingButtons from './RatingButtons';
import SessionComplete, { SessionSummaryStats } from './SessionComplete';

interface ReviewSessionProps {
  deck: {
    _id: string;
    name: string;
  };
  initialCards: CardData[];
  onExit: () => void;
}

export default function ReviewSession({
  deck,
  initialCards,
  onExit,
}: ReviewSessionProps) {
  // Session queue state (cards can be re-queued on 'again')
  const [queue, setQueue] = useState<CardData[]>(() => [...initialCards]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [lastRatingDirection, setLastRatingDirection] = useState<SM2Rating | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isGrading, setIsGrading] = useState(false);

  // Telemetry & stats tracking
  const [startTime, setStartTime] = useState<number>(() => Date.now());
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [ratingCounts, setRatingCounts] = useState<Record<SM2Rating, number>>({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });
  const [totalReviewedCount, setTotalReviewedCount] = useState(0);

  const currentCard = queue[currentQueueIndex] as CardData | undefined;

  // Calculate dynamic SM-2 interval previews for active card
  const intervalPreviews = useMemo(() => {
    if (!currentCard) {
      return { again: '<1m', hard: '6m', good: '10d', easy: '21d' };
    }
    return getIntervalPreviews({
      easeFactor: currentCard.easeFactor,
      interval: currentCard.interval,
      repetitions: currentCard.repetitions,
      nextReview: currentCard.nextReview,
    });
  }, [currentCard]);

  // Number of cards re-queued for second-chance review
  const relearnCount = useMemo(() => {
    return queue.slice(currentQueueIndex).filter((c) => {
      // Find if this card appears more than once in the remaining queue
      return queue.filter((x) => x._id === c._id).length > 1;
    }).length;
  }, [queue, currentQueueIndex]);

  // Reveal Answer handler
  const handleReveal = useCallback(() => {
    setIsRevealed(true);
  }, []);

  // Rate card handler (Fast, non-blocking optimistic flow)
  const handleRate = useCallback(
    async (rating: SM2Rating) => {
      if (!currentCard || isGrading) return;
      setIsGrading(true);
      setLastRatingDirection(rating);

      // 1. Update session telemetry immediately
      setRatingCounts((prev) => ({
        ...prev,
        [rating]: (prev[rating] || 0) + 1,
      }));
      setTotalReviewedCount((prev) => prev + 1);

      // 2. Persist to API in background (Non-blocking: learner never waits for network)
      fetch(`/api/flashcards/${currentCard._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      }).catch((err) => {
        console.error('Failed to sync card rating to server:', err);
      });

      // 3. Spaced Repetition queue management:
      // If 'again', re-insert the card into the queue (3 cards ahead, or at end)
      if (rating === 'again') {
        setQueue((prevQueue) => {
          const nextQueue = [...prevQueue];
          const insertIndex = Math.min(nextQueue.length, currentQueueIndex + 4);
          nextQueue.splice(insertIndex, 0, currentCard);
          return nextQueue;
        });
      }

      // Fast transition: 150ms delay just to allow directional exit fling to initiate
      setTimeout(() => {
        setIsRevealed(false);
        setLastRatingDirection(null);
        setIsGrading(false);

        if (currentQueueIndex + 1 < queue.length) {
          setCurrentQueueIndex((prev) => prev + 1);
        } else {
          // All cards in session queue completed!
          const finalDuration = Math.max(1, Math.round((Date.now() - startTime) / 1000));
          setDurationSeconds(finalDuration);
          setIsCompleted(true);
        }
      }, 150);
    },
    [currentCard, currentQueueIndex, isGrading, queue.length, startTime]
  );

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if inside text inputs/textareas
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
        return;
      }

      if (isCompleted) {
        if (e.key === 'Enter') {
          e.preventDefault();
          onExit();
        }
        return;
      }

      if (!isRevealed) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleReveal();
        }
      } else {
        if (e.key === '1') {
          e.preventDefault();
          handleRate('again');
        } else if (e.key === '2') {
          e.preventDefault();
          handleRate('hard');
        } else if (e.key === '3') {
          e.preventDefault();
          handleRate('good');
        } else if (e.key === '4') {
          e.preventDefault();
          handleRate('easy');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed, isCompleted, handleReveal, handleRate, onExit]);

  // Restart review session
  const handleRestart = () => {
    setQueue([...initialCards]);
    setCurrentQueueIndex(0);
    setIsRevealed(false);
    setIsCompleted(false);
    setLastRatingDirection(null);
    setStartTime(Date.now());
    setDurationSeconds(0);
    setRatingCounts({ again: 0, hard: 0, good: 0, easy: 0 });
    setTotalReviewedCount(0);
    toast.success('Restarted review session.');
  };

  const summaryStats: SessionSummaryStats = {
    totalReviewed: totalReviewedCount,
    durationSeconds,
    ratingCounts,
  };

  // Completion View
  if (isCompleted) {
    return (
      <div className="py-6 sm:py-10 px-4 flex items-center justify-center">
        <SessionComplete
          deckName={deck.name}
          stats={summaryStats}
          onRestart={handleRestart}
          onExit={onExit}
        />
      </div>
    );
  }

  // Empty queue edge case
  if (!currentCard) {
    return (
      <div className="py-12 text-center text-muted-foreground text-sm">
        No cards available for review in this deck.
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 py-2 sm:py-4 px-2 sm:px-4">
      {/* ── 1. Progress Header ── */}
      <ReviewProgress
        currentIndex={currentQueueIndex}
        totalCards={queue.length}
        relearnCount={relearnCount}
        deckName={deck.name}
        onExit={onExit}
      />

      {/* ── 2. Interactive Tactile Card Canvas ── */}
      <div className="pt-2">
        <AnimatePresence mode="wait">
          <ReviewCard
            key={currentCard._id + '-' + currentQueueIndex}
            card={currentCard}
            isRevealed={isRevealed}
            onReveal={handleReveal}
            onSwipeRate={handleRate}
            lastRatingDirection={lastRatingDirection}
            remainingQueueLength={queue.length - currentQueueIndex}
          />
        </AnimatePresence>
      </div>

      {/* ── 3. Rating Selection Controls (Visible when answer revealed) ── */}
      <div className="min-h-24 pt-1">
        <AnimatePresence>
          {isRevealed && (
            <RatingButtons
              intervalPreviews={intervalPreviews}
              onRate={handleRate}
              disabled={isGrading}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
