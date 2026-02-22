import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  FileText,
  MessageSquare,
  Link as LinkIcon,
  Terminal,
  X,
} from 'lucide-react';
import Fuse from 'fuse.js';
import { useStore } from '@/stores/useStore';
import { cn } from '@/utils/cn';
import type { WorkspaceType, Note } from '@/types';

const typeIcons: Record<WorkspaceType, React.ElementType> = {
  folder: FileText,
  card: MessageSquare,
  link: LinkIcon,
  command: Terminal,
};

export function SearchModal() {
  const {
    ui,
    notes,
    workspaces,
    folders,
    toggleSearch,
    setSelectedWorkspace,
    setSelectedNote,
  } = useStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fuse = useMemo(
    () =>
      new Fuse(notes, {
        keys: ['title', 'description'],
        threshold: 0.3,
        includeScore: true,
      }),
    [notes]
  );

  const results = useMemo(() => {
    if (!query.trim()) return notes.slice(0, 10);
    return fuse.search(query).slice(0, 10).map((r) => r.item);
  }, [query, fuse, notes]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!ui.showSearch) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [ui.showSearch, results, selectedIndex]);

  const handleSelect = (note: Note) => {
    setSelectedWorkspace(note.workspaceId);
    setSelectedNote(note.id);
    toggleSearch();
    setQuery('');
  };

  const getNotePath = (note: Note) => {
    const workspace = workspaces.find((w) => w.id === note.workspaceId);
    const folder = folders.find((f) => f.id === note.folderId);
    return [workspace?.name, folder?.name].filter(Boolean).join(' › ');
  };

  if (!ui.showSearch) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-24 backdrop-blur-sm"
      onClick={toggleSearch}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-gray-700 px-4 py-3">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-400">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              {query ? 'No results found' : 'Start typing to search'}
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((note, index) => {
                const workspace = workspaces.find((w) => w.id === note.workspaceId);
                const Icon = workspace ? typeIcons[workspace.type] : FileText;

                return (
                  <button
                    key={note.id}
                    onClick={() => handleSelect(note)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors',
                      index === selectedIndex
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    )}
                  >
                    <Icon
                      className="mt-0.5 h-4 w-4 flex-shrink-0"
                      style={{
                        color: index === selectedIndex ? 'white' : workspace?.color || '#6b7280',
                      }}
                    />
                    <div className="flex-1 overflow-hidden">
                      <div className="font-medium">{note.title}</div>
                      <div
                        className={cn(
                          'text-sm truncate',
                          index === selectedIndex ? 'text-indigo-200' : 'text-gray-500'
                        )}
                      >
                        {note.description || 'No description'}
                      </div>
                      <div
                        className={cn(
                          'mt-1 text-xs',
                          index === selectedIndex ? 'text-indigo-300' : 'text-gray-600'
                        )}
                      >
                        {getNotePath(note)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-700 px-4 py-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>{notes.length} notes total</span>
        </div>
      </div>
    </div>
  );
}
