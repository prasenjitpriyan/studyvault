import mongoose, { Schema } from 'mongoose';

const NoteSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  folder: { type: String, default: 'General' },
  tags: { type: [String], default: [] },
  isFavorite: { type: Boolean, default: false },
}, { timestamps: true });

// Force schema recompilation under Next.js dev server hot-reloading
if (mongoose.models.Note) {
  delete mongoose.models.Note;
}

export default mongoose.model('Note', NoteSchema);
