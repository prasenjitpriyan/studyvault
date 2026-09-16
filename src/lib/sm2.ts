/**
 * SuperMemo SM-2 Spaced Repetition Algorithm Engine
 * 
 * Completely decoupled from presentation, animation, and UI logic.
 * Supports 4-tier ratings: 'again' | 'hard' | 'good' | 'easy'.
 */

export type SM2Rating = 'again' | 'hard' | 'good' | 'easy';

export interface SM2CardState {
  easeFactor?: number;
  interval?: number;     // in days
  repetitions?: number;
  nextReview?: Date | string;
}

export interface SM2CalculationResult {
  easeFactor: number;
  interval: number;      // in days
  repetitions: number;
  nextReview: Date;
  intervalPreview: string;
}

const DEFAULT_EASE_FACTOR = 2.5;
const MINIMUM_EASE_FACTOR = 1.3;

/**
 * Format a day count into an intuitive student-friendly interval preview label.
 * (e.g. "<1m", "6m", "1d", "10d", "21d", "1.5mo", "1y")
 */
export function formatInterval(days: number, rating?: SM2Rating): string {
  if (rating === 'again' || days === 0) {
    return '<1m';
  }

  // Intraday short intervals for initial reviews
  if (days < 1) {
    const minutes = Math.round(days * 24 * 60);
    return `${Math.max(1, minutes)}m`;
  }

  if (days === 1) {
    return '1d';
  }

  if (days < 30) {
    return `${Math.round(days)}d`;
  }

  if (days < 365) {
    const months = (days / 30).toFixed(1).replace(/\.0$/, '');
    return `${months}mo`;
  }

  const years = (days / 365).toFixed(1).replace(/\.0$/, '');
  return `${years}y`;
}

/**
 * Core SM-2 calculation function.
 * Given a card's current SM-2 state and a rating, computes the new state.
 */
export function calculateSM2(
  currentState: SM2CardState,
  rating: SM2Rating,
  now = new Date()
): SM2CalculationResult {
  const currentEase = currentState.easeFactor ?? DEFAULT_EASE_FACTOR;
  const currentInterval = currentState.interval ?? 0;
  const currentReps = currentState.repetitions ?? 0;

  let newEase = currentEase;
  let newInterval = 0;
  let newReps = currentReps;
  let preview = '';

  switch (rating) {
    case 'again': {
      // Complete blackout / failed recall
      newReps = 0;
      newInterval = 0; // Immediate intraday re-queue
      newEase = Math.max(MINIMUM_EASE_FACTOR, currentEase - 0.2);
      preview = '<1m';
      break;
    }

    case 'hard': {
      // Recalled with significant effort / hesitation (q = 3)
      if (currentReps === 0) {
        newInterval = 0.0042; // ~6 minutes intraday
        preview = '6m';
      } else if (currentReps === 1) {
        newInterval = 2; // 2 days
        preview = '2d';
      } else {
        newInterval = Math.max(1, Math.round(currentInterval * 1.2));
        preview = formatInterval(newInterval);
      }
      newReps = currentReps + 1;
      // Drop ease factor slightly for hard cards
      newEase = Math.max(MINIMUM_EASE_FACTOR, currentEase - 0.15);
      break;
    }

    case 'good': {
      // Correct recall with expected hesitation (q = 4)
      if (currentReps === 0) {
        newInterval = 1; // 1 day
      } else if (currentReps === 1) {
        newInterval = 6; // 6 days
      } else {
        newInterval = Math.max(1, Math.round(currentInterval * currentEase));
      }
      newReps = currentReps + 1;
      // Formula: EF' = EF + (0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02)) = EF + 0 = unchanged
      newEase = currentEase;
      preview = formatInterval(newInterval);
      break;
    }

    case 'easy': {
      // Effortless, instant recall (q = 5)
      if (currentReps === 0) {
        newInterval = 4; // 4 days
      } else if (currentReps === 1) {
        newInterval = 10; // 10 days
      } else {
        newInterval = Math.max(1, Math.round(currentInterval * currentEase * 1.3));
      }
      newReps = currentReps + 1;
      // Increase ease factor for easy cards
      newEase = currentEase + 0.15;
      preview = formatInterval(newInterval);
      break;
    }
  }

  // Calculate next review timestamp
  const nextReview = new Date(now.getTime());
  if (newInterval < 1) {
    // Intraday minutes (e.g., 6m or <1m)
    const minutes = Math.max(1, Math.round(newInterval * 24 * 60));
    nextReview.setMinutes(nextReview.getMinutes() + minutes);
  } else {
    // Full days
    nextReview.setDate(nextReview.getDate() + newInterval);
  }

  return {
    easeFactor: Number(newEase.toFixed(2)),
    interval: newInterval,
    repetitions: newReps,
    nextReview,
    intervalPreview: preview,
  };
}

/**
 * Generates dynamic interval preview badges for all 4 ratings
 * before the user chooses a response.
 */
export function getIntervalPreviews(
  currentState: SM2CardState,
  now = new Date()
): Record<SM2Rating, string> {
  return {
    again: calculateSM2(currentState, 'again', now).intervalPreview,
    hard: calculateSM2(currentState, 'hard', now).intervalPreview,
    good: calculateSM2(currentState, 'good', now).intervalPreview,
    easy: calculateSM2(currentState, 'easy', now).intervalPreview,
  };
}
