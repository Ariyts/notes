import { useState, useRef, useEffect } from 'react';
import { Plus, RefreshCw, Search, Settings, Menu, MoreVertical, Pencil, Trash2, Check, X } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { WorkspaceType } from '@/types';

export function Header() {
  const {
    workspaces,
    ui,
    sync,
    setSelectedWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    toggleSync,
    toggleSettings,
    toggleSearch,
    toggleSidebar,
  } = useStore();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceType, setNewWorkspaceType] = useState<WorkspaceType>('folder');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      createWorkspace(newWorkspaceName.trim(), newWorkspaceType);
      setNewWorkspaceName('');
      setNewWorkspaceType('folder');
      setIsCreating(false);
    }
  };

  const handleStartEdit = (ws: typeof workspaces[0]) => {
    setEditingId(ws.id);
    setEditName(ws.name);
    setMenuOpenId(null);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      updateWorkspace(editingId, { name: editName.trim() });
    }
    setEditingId(null);
    setEditName('');
  };

  const handleDeleteWorkspace = (id: string) => {
    if (workspaces.length <= 1) {
      alert('Cannot delete the last workspace');
      return;
    }
    if (confirm('Delete this workspace and all its contents?')) {
      deleteWorkspace(id);
    }
    setMenuOpenId(null);
  };

  return (
    <header className="flex h-12 items-center justify-between border-b border-gray-700 bg-gray-900 px-4">
      {/* Left: Menu + Workspaces */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-1" ref={menuRef}>
          {workspaces.map((workspace) => (
            <div key={workspace.id} className="relative">
              {editingId === workspace.id ? (
                <div className="flex items-center gap-1 rounded-lg bg-gray-800 px-2 py-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') {
                        setEditingId(null);
                        setEditName('');
                      }
                    }}
                    className="w-20 bg-transparent text-sm text-white focus:outline-none"
                    autoFocus
                  />
                  <button onClick={handleSaveEdit} className="rounded p-0.5 text-green-400 hover:bg-gray-700">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => { setEditingId(null); setEditName(''); }} className="rounded p-0.5 text-red-400 hover:bg-gray-700">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="group flex items-center">
                  <button
                    onClick={() => setSelectedWorkspace(workspace.id)}
                    className={cn(
                      'rounded-l-lg px-2.5 py-1 text-sm font-medium transition-colors',
                      ui.selectedWorkspaceId === workspace.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    )}
                  >
                    {workspace.name}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === workspace.id ? null : workspace.id);
                    }}
                    className={cn(
                      'rounded-r-lg px-1 py-1 transition-colors',
                      ui.selectedWorkspaceId === workspace.id
                        ? 'bg-indigo-600 text-white/70 hover:text-white'
                        : 'text-gray-500 hover:bg-gray-800 hover:text-white opacity-0 group-hover:opacity-100'
                    )}
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {menuOpenId === workspace.id && (
                <div className="absolute left-0 top-full z-50 mt-1 w-32 rounded-lg border border-gray-700 bg-gray-800 py-1 shadow-xl">
                  <button
                    onClick={() => handleStartEdit(workspace)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700"
                  >
                    <Pencil className="h-3 w-3" />
                    Rename
                  </button>
                  <button
                    onClick={() => handleDeleteWorkspace(workspace.id)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-gray-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {isCreating ? (
            <div className="flex items-center gap-1 rounded-lg bg-gray-800 px-2 py-1">
              <input
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateWorkspace();
                  if (e.key === 'Escape') {
                    setIsCreating(false);
                    setNewWorkspaceName('');
                  }
                }}
                placeholder="Name..."
                className="w-20 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
                autoFocus
              />
              <button onClick={handleCreateWorkspace} className="rounded p-0.5 text-green-400 hover:bg-gray-700">
                <Check className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => { setIsCreating(false); setNewWorkspaceName(''); }} className="rounded p-0.5 text-red-400 hover:bg-gray-700">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={() => setIsCreating(true)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white">
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="sm" onClick={toggleSearch}>
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden rounded bg-gray-700 px-1 py-0.5 text-xs text-gray-400 sm:inline">⌘K</kbd>
        </Button>
        
        <Button
          variant={sync.pendingChanges > 0 ? 'primary' : 'ghost'}
          size="sm"
          onClick={toggleSync}
        >
          <RefreshCw className={cn('h-4 w-4', sync.status === 'syncing' && 'animate-spin')} />
          <span className="hidden sm:inline">Sync</span>
          {sync.pendingChanges > 0 && (
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs">{sync.pendingChanges}</span>
          )}
        </Button>
        
        <Button variant="ghost" size="sm" onClick={toggleSettings}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
