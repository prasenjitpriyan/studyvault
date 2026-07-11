import mongoose, { Schema } from 'mongoose';

const NoteSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  folder: { type: String, default: 'General' },
  tags: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);
