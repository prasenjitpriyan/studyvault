import mongoose, { Schema } from 'mongoose';

const TaskSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'done'],
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  dueDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
