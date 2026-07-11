import mongoose, { Schema } from 'mongoose';

const FlashcardSchema = new Schema({
  deckId: { type: Schema.Types.ObjectId, ref: 'Deck', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  front: { type: String, required: true },
  back: { type: String, required: true },
  easeFactor: { type: Number, default: 2.5 },
  interval: { type: Number, default: 0 }, // in days
  repetitions: { type: Number, default: 0 },
  nextReview: { type: Date, default: Date.now },
});

export default mongoose.models.Flashcard || mongoose.model('Flashcard', FlashcardSchema);
