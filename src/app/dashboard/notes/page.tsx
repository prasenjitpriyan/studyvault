'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Folder, Search, Plus, Trash2, Edit3, Eye, FileText, Tag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Note {
  _id: string;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  updatedAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [editMode, setEditMode] = useState<'write' | 'preview' | 'both'>('both');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [folderField, setFolderField] = useState('General');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update form fields when active note changes
  const selectNote = (note: Note) => {
    setActiveNote(note);
    setTitle(note.title);
    setContent(note.content);
    setFolderField(note.folder);
    setTags(note.tags || []);
    setTagInput('');
  };

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch('/api/notes');
        if (res.ok) {
          const data = await res.json();
          setNotes(data.notes || []);
          if (data.notes && data.notes.length > 0 && !activeNote) {
            selectNote(data.notes[0]);
          }
        }
      } catch {
        toast.error('Failed to load notes.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [activeNote]);

  // Dynamically update document title to reflect active note
  useEffect(() => {
    if (activeNote) {
      document.title = `${activeNote.title} | StudyVault`;
    } else {
      document.title = 'Notes Vault | StudyVault';
    }
  }, [activeNote]);

  // Custom debounced autosave trigger
  const triggerAutosave = (updatedFields: Partial<Note>) => {
    if (!activeNote) return;

    // Show temporary saving state
    setIsSaving(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/notes/${activeNote._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFields),
        });

        if (res.ok) {
          const data = await res.json();
          // Update note inside local list
          setNotes((prevNotes) =>
            prevNotes.map((n) => (n._id === activeNote._id ? data.note : n))
          );
        }
      } catch (error) {
        console.error('Autosave failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000); // Wait 1 second after typing stops
  };

  // Field change handlers
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    triggerAutosave({ title: val });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    triggerAutosave({ content: val });
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFolderField(val);
    triggerAutosave({ folder: val });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        const updatedTags = [...tags, newTag];
        setTags(updatedTags);
        setTagInput('');
        triggerAutosave({ tags: updatedTags });
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((t) => t !== tagToRemove);
    setTags(updatedTags);
    triggerAutosave({ tags: updatedTags });
  };

  // Create new note
  const handleCreateNote = async () => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Note',
          content: '',
          folder: selectedFolder !== 'All' ? selectedFolder : 'General',
          tags: [],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotes((prev) => [data.note, ...prev]);
        selectNote(data.note);
        toast.success('New note created.');
      }
    } catch {
      toast.error('Could not create note.');
    }
  };

  // Delete note
  const handleDeleteNote = async () => {
    if (!activeNote) return;

    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const res = await fetch(`/api/notes/${activeNote._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const updatedList = notes.filter((n) => n._id !== activeNote._id);
        setNotes(updatedList);
        setActiveNote(updatedList.length > 0 ? updatedList[0] : null);
        if (updatedList.length > 0) {
          selectNote(updatedList[0]);
        }
        toast.success('Note deleted.');
      }
    } catch {
      toast.error('Could not delete note.');
    }
  };

  // Get unique list of folders
  const folders = ['All', ...Array.from(new Set(notes.map((n) => n.folder)))];

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesFolder = selectedFolder === 'All' || note.folder === selectedFolder;
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFolder && matchesSearch;
  });

  // Custom Markdown Parser
  const parseMarkdown = (md: string) => {
    if (!md) return '<p class="text-zinc-500 italic">No content. Start writing in Markdown...</p>';

    // Escape basic HTML to prevent XSS
    let html = md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Header conversions
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-md font-bold mt-4 mb-2 text-zinc-100">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-extrabold mt-5 mb-2 text-zinc-100 border-b border-zinc-800 pb-1">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black mt-6 mb-3 text-indigo-400">$1</h1>');

    // Inline formatting
    html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
    html = html.replace(/`(.*)`/gim, '<code class="bg-zinc-850 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs">$1</code>');

    // Blockquote
    html = html.replace(/^\>(.*$)/gim, '<blockquote class="border-l-4 border-indigo-500 pl-4 py-1 my-3 bg-indigo-500/5 text-zinc-300 italic">$1</blockquote>');

    // Bullet Lists
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="list-disc list-inside text-zinc-300 ml-4 my-1">$1</li>');

    // Paragraph breaks
    html = html.split('\n').join('<br />');

    return html;
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">

      {/* LEFT SIDEBAR: Notes Directory */}
      <div className="w-80 flex flex-col glass-panel rounded-2xl overflow-hidden h-full">

        {/* Directory Header */}
        <div className="p-4 border-b border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-1.5 text-zinc-200">
              <BookOpen className="h-4.5 w-4.5 text-indigo-400" /> Notes Vault
            </h3>
            <button
              onClick={handleCreateNote}
              className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search title, content, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-xl outline-none text-xs text-zinc-300"
            />
          </div>
        </div>

        {/* Folders List Row */}
        <div className="px-4 py-2 border-b border-zinc-850 overflow-x-auto flex gap-1.5 scrollbar-none">
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFolder(f)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap transition-all border ${
                selectedFolder === f
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Notes Items Directory */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {isLoading ? (
            <div className="text-zinc-500 text-xs py-8 text-center flex flex-col items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-400" /> Loading your notes...
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-zinc-500 text-xs py-8 text-center border border-dashed border-zinc-800 rounded-xl m-2">
              No notes found.
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isActive = activeNote?._id === note._id;
              return (
                <div
                  key={note._id}
                  onClick={() => selectNote(note)}
                  className={`p-3.5 rounded-xl transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-linear-to-r from-indigo-500/10 to-purple-500/5 border-indigo-500/20'
                      : 'bg-zinc-900/30 hover:bg-zinc-900/60 border-transparent'
                  }`}
                >
                  <h4 className={`text-xs font-semibold truncate ${isActive ? 'text-indigo-300 font-bold' : 'text-zinc-300'}`}>
                    {note.title || 'Untitled Note'}
                  </h4>
                  <p className="text-[10px] text-zinc-500 truncate mt-1">
                    {note.content || 'Empty note...'}
                  </p>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">
                      {note.folder}
                    </span>
                    <span className="text-[9px] text-zinc-500">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT WORKSPACE: Note Editor */}
      <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden h-full">
        {activeNote ? (
          <>
            {/* Editor Actions Header */}
            <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Note Title"
                  className="bg-transparent text-lg font-bold border-none outline-none text-zinc-100 focus:ring-0 w-64 md:w-80"
                />

                {/* Autosave Status Badge */}
                {isSaving ? (
                  <span className="flex items-center gap-1 text-[10px] text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-850">
                    <Loader2 className="h-3 w-3 animate-spin text-indigo-400" /> Saving
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-500 bg-zinc-900/50 px-2.5 py-1 rounded-full border border-zinc-850">
                    Saved
                  </span>
                )}
              </div>

              {/* View options */}
              <div className="flex items-center gap-3">
                <div className="flex rounded-lg bg-zinc-900 border border-zinc-800 p-0.5">
                  {[
                    { mode: 'write', label: 'Edit', icon: Edit3 },
                    { mode: 'preview', label: 'Preview', icon: Eye },
                    { mode: 'both', label: 'Split', icon: FileText },
                  ].map((btn) => {
                    const Icon = btn.icon;
                    return (
                      <button
                        key={btn.mode}
                        onClick={() => setEditMode(btn.mode as 'write' | 'preview' | 'both')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
                          editMode === btn.mode
                            ? 'bg-zinc-800 text-zinc-200 shadow-md'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{btn.label}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleDeleteNote}
                  className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                  title="Delete Note"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Note Meta Subheader (Folder & Tags) */}
            <div className="px-6 py-3 border-b border-zinc-850 bg-zinc-900/20 flex flex-wrap items-center gap-4 text-xs">

              {/* Folder edit */}
              <div className="flex items-center gap-2">
                <Folder className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-zinc-400">Folder:</span>
                <input
                  type="text"
                  value={folderField}
                  onChange={handleFolderChange}
                  placeholder="General"
                  className="bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-indigo-500 outline-none text-zinc-200 px-1 py-0.5 transition-all w-24"
                />
              </div>

              {/* Tags list and input */}
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-zinc-400">Tags:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-400 font-extrabold text-[9px] leading-none"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="+ Add tag..."
                    className="bg-transparent outline-none text-zinc-300 w-20 text-[11px]"
                  />
                </div>
              </div>

            </div>

            {/* Editor / Preview Content Canvas */}
            <div className="flex-1 flex min-h-0">

              {/* EDITOR AREA */}
              {(editMode === 'write' || editMode === 'both') && (
                <textarea
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Write your study notes in markdown format (# headers, **bold**, *italics*, - bullet points...)"
                  className="flex-1 h-full p-6 bg-zinc-950/20 text-zinc-200 outline-none border-none resize-none font-mono text-sm leading-relaxed focus:ring-0 focus:outline-none"
                />
              )}

              {/* SPLIT SPLITTER BAR */}
              {editMode === 'both' && <div className="w-px bg-zinc-800" />}

              {/* LIVE PREVIEW AREA */}
              {(editMode === 'preview' || editMode === 'both') && (
                <div className="flex-1 h-full p-6 overflow-y-auto bg-zinc-950/5 select-text">
                  <div
                    className="prose prose-invert max-w-none text-sm text-zinc-300 leading-relaxed space-y-2 select-text"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
                  />
                </div>
              )}

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-8">
            <BookOpen className="h-12 w-12 text-zinc-700 mb-4 animate-bounce" />
            <h3 className="text-zinc-400 font-bold mb-1">No Note Selected</h3>
            <p className="text-xs text-zinc-500 mb-6 text-center max-w-xs">
              Select an existing note from the directory or create a brand new one.
            </p>
            <button
              onClick={handleCreateNote}
              className="bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg transition-all"
            >
              Create New Note
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
