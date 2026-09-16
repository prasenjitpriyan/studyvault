'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';

interface Task {
  _id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form / Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');

  useEffect(() => {
    async function loadTasks() {
      try {
        const res = await fetch('/api/tasks');
        if (res.ok) {
          const data = await res.json();
          setTasks(data.tasks || []);
        }
      } catch {
        toast.error('Failed to load tasks.');
      } finally {
        setIsLoading(false);
      }
    }
    loadTasks();
  }, []);

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) {
      toast.error('Task title is required.');
      return;
    }

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          priority: taskPriority,
          dueDate: taskDueDate || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => [data.task, ...prev]);
        setModalOpen(false);
        setTaskTitle('');
        setTaskPriority('medium');
        setTaskDueDate('');
        toast.success('Task created.');
      }
    } catch {
      toast.error('Failed to create task.');
    }
  };

  // Update Task Status
  const handleUpdateStatus = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? data.task : t))
        );
      }
    } catch {
      toast.error('Failed to update task.');
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        toast.success('Task deleted.');
      }
    } catch {
      toast.error('Failed to delete task.');
    }
  };

  // Filter tasks into columns
  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  // Overdue status check
  const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateStr) < today;
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Task Board</h1>
          <p className="text-sm text-muted-foreground mt-1">Organize and prioritize your study goals on a Kanban timeline.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg cursor-pointer transition-all hover:scale-[1.01]"
        >
          <Plus className="h-4.5 w-4.5" /> Add Task
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
        </div>
      ) : (
        /* Kanban Columns Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* TO DO COLUMN */}
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center bg-card border border-border p-3 rounded-xl">
              <span className="text-xs font-bold text-foreground uppercase tracking-widest">To Do</span>
              <span className="bg-muted text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                {todoTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 min-h-60 bg-muted/10 p-2.5 rounded-2xl border border-border border-dashed">
              <AnimatePresence mode="popLayout" initial={false}>
                {todoTasks.length === 0 ? (
                  <motion.div
                    key="empty-todo"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8 text-xs text-muted-foreground"
                  >
                    No tasks in queue.
                  </motion.div>
                ) : (
                  todoTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      isOverdue={isOverdue(task.dueDate)}
                      onMoveRight={() => handleUpdateStatus(task._id, 'in_progress')}
                      onDelete={() => handleDeleteTask(task._id)}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* IN PROGRESS COLUMN */}
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center bg-card border border-border p-3 rounded-xl">
              <span className="text-xs font-bold text-foreground uppercase tracking-widest">In Progress</span>
              <span className="bg-muted text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                {inProgressTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 min-h-60 bg-muted/10 p-2.5 rounded-2xl border border-border border-dashed">
              <AnimatePresence mode="popLayout" initial={false}>
                {inProgressTasks.length === 0 ? (
                  <motion.div
                    key="empty-progress"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8 text-xs text-muted-foreground"
                  >
                    No tasks active.
                  </motion.div>
                ) : (
                  inProgressTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      isOverdue={isOverdue(task.dueDate)}
                      onMoveLeft={() => handleUpdateStatus(task._id, 'todo')}
                      onMoveRight={() => handleUpdateStatus(task._id, 'done')}
                      onDelete={() => handleDeleteTask(task._id)}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* COMPLETED COLUMN */}
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center bg-card border border-border p-3 rounded-xl">
              <span className="text-xs font-bold text-foreground uppercase tracking-widest">Completed</span>
              <span className="bg-muted text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                {doneTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 min-h-60 bg-muted/10 p-2.5 rounded-2xl border border-border border-dashed">
              <AnimatePresence mode="popLayout" initial={false}>
                {doneTasks.length === 0 ? (
                  <motion.div
                    key="empty-done"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8 text-xs text-muted-foreground"
                  >
                    No completed tasks yet.
                  </motion.div>
                ) : (
                  doneTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      isOverdue={false}
                      onMoveLeft={() => handleUpdateStatus(task._id, 'in_progress')}
                      onDelete={() => handleDeleteTask(task._id)}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      )}

      {/* --- MODAL: CREATE TASK --- */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Task"
        description="Organize your upcoming study goals and revision milestones."
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Task Title</label>
            <input
              id="task-title"
              type="text"
              placeholder="e.g. Read Physics Chapter 3, Draft essay outline"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-muted border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none text-sm text-foreground"
              required
            />
          </div>

          <div>
            <label htmlFor="task-priority" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Priority</label>
            <select
              id="task-priority"
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-4 py-2.5 bg-muted border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none text-sm text-foreground"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <div>
            <label htmlFor="task-due-date" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Due Date (Optional)</label>
            <input
              id="task-due-date"
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-muted border border-border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none text-sm text-foreground"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-card border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-lg cursor-pointer"
            >
              Create Task
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

// Inner Component: Individual Task Card
interface TaskCardProps {
  task: Task;
  isOverdue: boolean;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onDelete: () => void;
}

function TaskCard({ task, isOverdue, onMoveLeft, onMoveRight, onDelete }: TaskCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      layout={!shouldReduceMotion}
      layoutId={`task-${task._id}`}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 8 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, transition: { duration: 0.14 } }}
      transition={{
        type: 'spring',
        stiffness: 380,
        damping: 30,
        mass: 0.9,
      }}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      className="glass-panel p-4 rounded-xl flex flex-col justify-between space-y-4 hover:border-border/80 transition-colors select-none shadow-sm"
    >
      <div>
        <div className="flex justify-between items-start gap-2">
          <h4 className={`text-xs font-semibold text-foreground wrap-break-word leading-relaxed ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </h4>
          <button
            onClick={onDelete}
            className="text-muted-foreground hover:text-red-400 transition-all p-1 hover:bg-muted rounded-lg cursor-pointer"
            title="Delete Task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Due date notice */}
        {task.dueDate && (
          <div className="flex items-center gap-1.5 mt-2">
            <Calendar className={`h-3 w-3 ${isOverdue ? 'text-red-400 animate-pulse' : 'text-muted-foreground'}`} />
            <span className={`text-[10px] ${isOverdue ? 'text-red-400 font-bold' : 'text-muted-foreground'}`}>
              {new Date(task.dueDate).toLocaleDateString()}
              {isOverdue && ' (Overdue)'}
            </span>
          </div>
        )}
      </div>

      {/* Footer controls & priority badge */}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <span
          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
            task.priority === 'high'
              ? 'bg-red-500/10 border border-red-500/20 text-red-400 shadow-md shadow-red-500/5'
              : task.priority === 'medium'
              ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
              : 'bg-muted border border-border text-muted-foreground'
          }`}
        >
          {task.priority}
        </span>

        {/* Navigation arrows to move between columns */}
        <div className="flex gap-1">
          {onMoveLeft && (
            <button
              onClick={onMoveLeft}
              className="p-1 rounded bg-card border border-border hover:border-border hover:text-foreground text-muted-foreground transition-all cursor-pointer"
              title="Move Left"
            >
              <ArrowLeft className="h-3 w-3" />
            </button>
          )}
          {onMoveRight && (
            <button
              onClick={onMoveRight}
              className="p-1 rounded bg-card border border-border hover:border-border hover:text-foreground text-muted-foreground transition-all cursor-pointer"
              title="Move Right"
            >
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
