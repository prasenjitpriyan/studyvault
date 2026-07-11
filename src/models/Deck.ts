import mongoose, { Schema } from 'mongoose';

const DeckSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Deck || mongoose.model('Deck', DeckSchema);
