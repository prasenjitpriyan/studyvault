'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Folder, Search, Plus, Trash2, Edit3, Eye, FileText, Tag, Loader2, Star, Volume2, VolumeX, Printer, Sparkles, Brain, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Note {
  _id: string;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  updatedAt: string;
  isFavorite?: boolean;
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

  // Extended Study Features State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiDecks, setAiDecks] = useState<{ _id: string; name: string }[]>([]);
  const [selectedAiDeck, setSelectedAiDeck] = useState<string>('');
  const [generatedCards, setGeneratedCards] = useState<{ front: string; back: string }[]>([]);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [isAiFlashcardsMode, setIsAiFlashcardsMode] = useState(false); // toggle drawer panel view
  const [isMounted, setIsMounted] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set isMounted on client load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

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

  // Stop TTS voice speech cancellation when active note changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    const timer = setTimeout(() => {
      setIsSpeaking(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [activeNote]);

  // Load flashcard decks when AI drawer is opened
  useEffect(() => {
    if (aiDrawerOpen) {
      const fetchDecks = async () => {
        try {
          const res = await fetch('/api/decks');
          if (res.ok) {
            const data = await res.json();
            setAiDecks(data.decks || []);
            if (data.decks && data.decks.length > 0) {
              setSelectedAiDeck(data.decks[0]._id);
            }
          }
        } catch {
          console.error('Failed to load decks for AI generation.');
        }
      };
      fetchDecks();
    }
  }, [aiDrawerOpen]);

  // Toggle Favorite Status
  const handleToggleFavorite = async (noteToToggle: Note) => {
    const updatedStatus = !noteToToggle.isFavorite;
    try {
      const res = await fetch(`/api/notes/${noteToToggle._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: updatedStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotes((prevNotes) =>
          prevNotes.map((n) => (n._id === noteToToggle._id ? data.note : n))
        );
        if (activeNote?._id === noteToToggle._id) {
          setActiveNote(data.note);
        }
        toast.success(updatedStatus ? 'Added to favorites.' : 'Removed from favorites.');
      }
    } catch {
      toast.error('Could not toggle favorite.');
    }
  };

  // Text to Speech
  const handleToggleSpeech = () => {
    if (!activeNote || typeof window === 'undefined') return;

    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    } else {
      // Clean up markdown tags for reading
      const plainText = content
        .replace(/#+\s+/g, '')
        .replace(/\*\*|__|\*|_/g, '')
        .replace(/`[^`]+`/g, '')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

      const utterance = new SpeechSynthesisUtterance(plainText || 'This note is empty.');
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis?.speak(utterance);
    }
  };

  // Print Note (PDF Export)
  const handlePrintNote = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Local AI Note Summarization
  const handleAISummarize = () => {
    if (!content.trim()) {
      toast.error('Write some notes first to summarize.');
      return;
    }
    setIsAiLoading(true);
    setIsAiFlashcardsMode(false);
    setAiSummary('');

    // Simulate local model latency
    setTimeout(() => {
      const sentences = content
        .split(/[.!?\n]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 12);

      if (sentences.length === 0) {
        setAiSummary('This note is too brief to generate a study summary. Add more detail!');
        setIsAiLoading(false);
        return;
      }

      const keywords = ['is', 'defines', 'important', 'key', 'remember', 'significant', 'concept', 'formula', 'process', 'result', 'study', 'note'];
      const scored = sentences.map((s) => {
        let score = 0;
        keywords.forEach((kw) => {
          if (s.toLowerCase().includes(kw)) score += 1;
        });
        return { sentence: s, score };
      });

      const topSentences = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((item) => `• ${item.sentence}.`);

      setAiSummary(`Study Summary for "${title || 'Untitled Note'}":\n\n` + topSentences.join('\n'));
      setIsAiLoading(false);
      toast.success('Summary generated successfully.');
    }, 1000);
  };

  // Local AI Flashcard Generation
  const handleAIGenerateCards = () => {
    if (!content.trim()) {
      toast.error('Write some notes first to generate cards.');
      return;
    }
    setIsAiLoading(true);
    setIsAiFlashcardsMode(true);
    setGeneratedCards([]);

    // Simulate local model latency
    setTimeout(() => {
      const cards: { front: string; back: string }[] = [];
      const lines = content.split('\n');

      lines.forEach((line) => {
        if (line.includes(' is ') || line.includes(' refers to ') || line.includes(' defines ')) {
          const separator = line.includes(' is ') ? ' is ' : line.includes(' refers to ') ? ' refers to ' : ' defines ';
          const parts = line.split(separator);
          if (parts.length >= 2 && parts[0].trim().length > 2 && parts[1].trim().length > 5) {
            const frontRaw = parts[0].replace(/[-*#]/g, '').trim();
            const backRaw = parts[1].trim();
            cards.push({
              front: `What is ${frontRaw}?`,
              back: backRaw.charAt(0).toUpperCase() + backRaw.slice(1),
            });
          }
        }

        if (line.toLowerCase().includes('q:') && line.toLowerCase().includes('a:')) {
          const parts = line.split(/a:/i);
          const qPart = parts[0].replace(/q:/i, '').trim();
          const aPart = parts[1].trim();
          if (qPart && aPart) {
            cards.push({ front: qPart, back: aPart });
          }
        }
      });

      // Limit to 4 cards max
      const finalCards = cards.slice(0, 4);

      if (finalCards.length === 0) {
        finalCards.push({
          front: `Core concept of: ${title || 'Untitled Note'}`,
          back: content.slice(0, 120) + (content.length > 120 ? '...' : ''),
        });
      }

      setGeneratedCards(finalCards);
      setIsAiLoading(false);
      toast.success(`Generated ${finalCards.length} flashcard templates.`);
    }, 1000);
  };

  // Save Generated Flashcards
  const handleSaveGeneratedCards = async () => {
    if (!selectedAiDeck) {
      toast.error('Please create or select a study deck first.');
      return;
    }
    if (generatedCards.length === 0) {
      toast.error('No generated cards to save.');
      return;
    }

    setIsGeneratingCards(true);
    let successCount = 0;

    try {
      for (const card of generatedCards) {
        const res = await fetch(`/api/decks/${selectedAiDeck}/flashcards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(card),
        });
        if (res.ok) successCount++;
      }
      toast.success(`Successfully saved ${successCount} cards to selected deck!`);
      setAiDrawerOpen(false);
      setGeneratedCards([]);
    } catch {
      toast.error('Failed to save some cards.');
    } finally {
      setIsGeneratingCards(false);
    }
  };

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
  const folders = ['All', '⭐ Favorites', ...Array.from(new Set(notes.map((n) => n.folder)))];

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesFolder =
      selectedFolder === 'All' ||
      (selectedFolder === '⭐ Favorites' ? note.isFavorite : note.folder === selectedFolder);
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFolder && matchesSearch;
  });

  // Sort notes so favorites come first, then sorted by updatedAt
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search title, content, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-card border border-border focus:border-indigo-500 rounded-xl outline-none text-xs text-foreground"
            />
          </div>
        </div>

        {/* Folders List Row */}
        <div className="px-4 py-2 border-b border-border overflow-x-auto flex gap-1.5 scrollbar-none">
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFolder(f)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap transition-all border ${
                selectedFolder === f
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 dark:text-indigo-300'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Notes Items Directory */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {isLoading ? (
            <div className="text-muted-foreground text-xs py-8 text-center flex flex-col items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-400" /> Loading your notes...
            </div>
          ) : sortedNotes.length === 0 ? (
            <div className="text-muted-foreground text-xs py-8 text-center border border-dashed border-border rounded-xl m-2">
              No notes found.
            </div>
          ) : (
            sortedNotes.map((note) => {
              const isActive = activeNote?._id === note._id;
              return (
                <div
                  key={note._id}
                  onClick={() => selectNote(note)}
                  className={`p-3.5 rounded-xl transition-all cursor-pointer border relative group/item ${
                    isActive
                      ? 'bg-linear-to-r from-indigo-500/10 to-purple-500/5 border-indigo-500/20'
                      : 'bg-muted/10 hover:bg-muted/30 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-xs font-semibold truncate ${isActive ? 'text-indigo-400 dark:text-indigo-300 font-bold' : 'text-foreground'} flex-1`}>
                      {note.title || 'Untitled Note'}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(note);
                      }}
                      className="p-0.5 rounded text-muted-foreground hover:text-amber-500 transition-colors"
                      title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star className={`h-3.5 w-3.5 ${note.isFavorite ? 'fill-amber-500 text-amber-500' : 'opacity-40 group-hover/item:opacity-100'}`} />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate mt-1">
                    {note.content || 'Empty note...'}
                  </p>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[9px] bg-muted border border-border text-muted-foreground px-1.5 py-0.5 rounded font-mono">
                      {note.folder}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
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
            <div className="p-4 border-b border-border/80 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Note Title"
                  className="bg-transparent text-lg font-bold border-none outline-none text-foreground focus:ring-0 w-64 md:w-80"
                />

                {/* Autosave Status Badge */}
                {isSaving ? (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-card px-2.5 py-1 rounded-full border border-border">
                    <Loader2 className="h-3 w-3 animate-spin text-indigo-400" /> Saving
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border">
                    Saved
                  </span>
                )}
              </div>

              {/* View options */}
              <div className="flex items-center gap-3">
                <div className="flex rounded-lg bg-muted border border-border p-0.5">
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
                            ? 'bg-card text-foreground shadow-md'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{btn.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Favorite Star Toggle */}
                <button
                  onClick={() => handleToggleFavorite(activeNote)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    activeNote.isFavorite
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-500'
                      : 'bg-muted border-border text-muted-foreground hover:text-foreground'
                  }`}
                  title={activeNote.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`h-4 w-4 ${activeNote.isFavorite ? 'fill-amber-500' : ''}`} />
                </button>

                {/* Text-To-Speech Voice Reader */}
                <button
                  onClick={handleToggleSpeech}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    isSpeaking
                      ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400 dark:text-indigo-300'
                      : 'bg-muted border-border text-muted-foreground hover:text-foreground'
                  }`}
                  title={isSpeaking ? 'Stop Reading' : 'Read Aloud'}
                >
                  {isSpeaking ? <VolumeX className="h-4 w-4 animate-pulse" /> : <Volume2 className="h-4 w-4" />}
                </button>

                {/* Print/Export to PDF */}
                <button
                  onClick={handlePrintNote}
                  className="p-2 rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  title="Export to PDF / Print"
                >
                  <Printer className="h-4 w-4" />
                </button>

                {/* AI Study Assistant Drawer Toggle */}
                <button
                  onClick={() => setAiDrawerOpen(!aiDrawerOpen)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    aiDrawerOpen
                      ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400 dark:text-indigo-300'
                      : 'bg-linear-to-r from-indigo-500/15 to-purple-500/15 border-indigo-500/20 text-indigo-500 hover:text-indigo-450 dark:hover:text-indigo-350'
                  }`}
                  title="AI Study Assistant"
                >
                  <Sparkles className="h-4 w-4" />
                </button>

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
            <div className="px-6 py-3 border-b border-border/80 bg-muted/10 flex flex-wrap items-center gap-4 text-xs">

              {/* Folder edit */}
              <div className="flex items-center gap-2">
                <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Folder:</span>
                <input
                  type="text"
                  value={folderField}
                  onChange={handleFolderChange}
                  placeholder="General"
                  className="bg-transparent border-b border-transparent hover:border-border focus:border-indigo-500 outline-none text-foreground px-1 py-0.5 transition-all w-24"
                />
              </div>

              {/* Tags list and input */}
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Tags:</span>
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
                    className="bg-transparent outline-none text-foreground w-20 text-[11px]"
                  />
                </div>
              </div>

            </div>

            {/* Hidden Printing Canvas */}
            {isMounted && createPortal(
              <div className="hidden print:block print-area p-8 text-black bg-white">
                <h1 className="text-3xl font-black mb-4 border-b border-zinc-200 pb-2">{title}</h1>
                <div
                  className="prose max-w-none text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
                />
              </div>,
              document.body
            )}

            {/* Editor / Preview Content Canvas */}
            <div className="flex-1 flex min-h-0 relative">

              {/* EDITOR AREA */}
              {(editMode === 'write' || editMode === 'both') && (
                <textarea
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Write your study notes in markdown format (# headers, **bold**, *italics*, - bullet points...)"
                  className="flex-1 h-full p-6 bg-muted/5 text-foreground outline-none border-none resize-none font-mono text-sm leading-relaxed focus:ring-0 focus:outline-none"
                />
              )}

              {/* SPLIT SPLITTER BAR */}
              {editMode === 'both' && <div className="w-px bg-border" />}

              {/* LIVE PREVIEW AREA */}
              {(editMode === 'preview' || editMode === 'both') && (
                <div className="flex-1 h-full p-6 overflow-y-auto bg-muted/5 select-text">
                  <div
                    className="prose dark:prose-invert max-w-none text-sm text-foreground leading-relaxed space-y-2 select-text"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
                  />
                </div>
              )}

              {/* AI Study Assistant Drawer Overlay */}
              {aiDrawerOpen && (
                <div className="w-80 border-l border-border bg-card/95 backdrop-blur-md flex flex-col h-full z-20 absolute right-0 top-0 transition-all animate-in slide-in-from-right duration-300">
                  <div className="p-4 border-b border-border/80 flex items-center justify-between">
                    <h3 className="font-bold text-sm flex items-center gap-1.5 text-indigo-400 dark:text-indigo-300">
                      <Brain className="h-4 w-4 text-purple-400" /> AI Study Assistant
                    </h3>
                    <button
                      onClick={() => setAiDrawerOpen(false)}
                      className="text-muted-foreground hover:text-foreground text-xs font-bold px-2 py-1 rounded bg-muted hover:bg-muted/80 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
                    {/* Action Hub */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleAISummarize}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          !isAiFlashcardsMode
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 dark:text-indigo-300'
                            : 'bg-muted border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Summarize
                      </button>
                      <button
                        onClick={handleAIGenerateCards}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isAiFlashcardsMode
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 dark:text-purple-300'
                            : 'bg-muted border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Generate Cards
                      </button>
                    </div>

                    {/* AI Loading State */}
                    {isAiLoading && (
                      <div className="py-8 text-center flex flex-col items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                        <span>AI model analyzing notes...</span>
                      </div>
                    )}

                    {/* Summary Results View */}
                    {!isAiLoading && !isAiFlashcardsMode && (
                      <div className="space-y-3">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Notes Summary</span>
                        {aiSummary ? (
                          <div className="p-3.5 bg-muted/40 border border-border/80 rounded-xl text-xs text-foreground leading-relaxed whitespace-pre-line">
                            {aiSummary}
                          </div>
                        ) : (
                          <div className="text-center py-6 border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                            Click &quot;Summarize&quot; above to generate a brief summary.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Flashcard Generation View */}
                    {!isAiLoading && isAiFlashcardsMode && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Target Study Deck</label>
                          {aiDecks.length > 0 ? (
                            <select
                              value={selectedAiDeck}
                              onChange={(e) => setSelectedAiDeck(e.target.value)}
                              className="w-full p-2 bg-muted border border-border rounded-xl text-xs outline-none text-foreground cursor-pointer"
                            >
                              {aiDecks.map((d) => (
                                <option key={d._id} value={d._id}>
                                  {d.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                              No flashcard decks found. Please go to Flashcards tab to create a deck first!
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Generated Cards ({generatedCards.length})</span>
                          {generatedCards.length > 0 ? (
                            <div className="space-y-3">
                              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                {generatedCards.map((card, idx) => (
                                  <div key={idx} className="p-3 bg-muted/30 border border-border rounded-xl text-[11px] space-y-1">
                                    <div className="font-semibold text-indigo-400">Front: <span className="text-foreground font-normal">{card.front}</span></div>
                                    <div className="font-semibold text-purple-400">Back: <span className="text-foreground font-normal">{card.back}</span></div>
                                  </div>
                                ))}
                              </div>

                              <button
                                onClick={handleSaveGeneratedCards}
                                disabled={isGeneratingCards || !selectedAiDeck}
                                className="w-full py-2.5 px-4 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                {isGeneratingCards ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-3.5 w-3.5" /> Save Cards to Deck
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="text-center py-6 border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                              Click &quot;Generate Cards&quot; above to parse flashcard Q&As.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
            <BookOpen className="h-12 w-12 text-border mb-4 animate-bounce" />
            <h3 className="text-muted-foreground font-bold mb-1">No Note Selected</h3>
            <p className="text-xs text-muted-foreground mb-6 text-center max-w-xs">
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
