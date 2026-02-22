import { useState } from 'react';
import {
  FileText,
  MessageSquare,
  Link as LinkIcon,
  Terminal,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { cn } from '@/utils/cn';
import type { WorkspaceType } from '@/types';

const iconMap: Record<string, React.ElementType> = {
  FileText,
  MessageSquare,
  Link: LinkIcon,
  Terminal,
};

const typeOptions: { value: WorkspaceType; label: string; icon: string; color: string }[] = [
  { value: 'folder', label: 'Notes', icon: 'FileText', color: '#6b7280' },
  { value: 'card', label: 'Cards', icon: 'MessageSquare', color: '#3b82f6' },
  { value: 'link', label: 'Links', icon: 'Link', color: '#10b981' },
  { value: 'command', label: 'Commands', icon: 'Terminal', color: '#f59e0b' },
];

export function Sidebar() {
  const {
    workspaces,
    ui,
    setSelectedWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
  } = useStore();
  
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<WorkspaceType>('folder');
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    createWorkspace(newName.trim(), newType);
    setNewName('');
    setNewType('folder');
    setShowCreate(false);
  };

  const handleUpdate = () => {
    if (!editingId || !editName.trim()) return;
    updateWorkspace(editingId, { name: editName.trim() });
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (id: string) => {
    if (workspaces.length <= 1) {
      alert('Cannot delete the last workspace');
      return;
    }
    if (confirm('Delete this workspace and all its contents?')) {
      deleteWorkspace(id);
    }
    setMenuOpen(null);
  };

  const startEdit = (ws: typeof workspaces[0]) => {
    setEditingId(ws.id);
    setEditName(ws.name);
    setMenuOpen(null);
  };

  return (
    <aside className={cn(
      'flex h-full w-48 flex-col border-r border-gray-700 bg-gray-900',
      ui.sidebarCollapsed && 'hidden lg:flex'
    )}>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {workspaces.map((workspace) => {
            const Icon = iconMap[workspace.icon] || FileText;
            const isSelected = ui.selectedWorkspaceId === workspace.id;
            
            return (
              <div key={workspace.id} className="relative">
                {editingId === workspace.id ? (
                  <div className="flex items-center gap-1 rounded-lg bg-gray-800 px-2 py-1.5">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdate();
                        if (e.key === 'Escape') {
                          setEditingId(null);
                          setEditName('');
                        }
                      }}
                      className="flex-1 min-w-0 bg-transparent text-sm text-white focus:outline-none"
                      autoFocus
                    />
                    <button onClick={handleUpdate} className="rounded p-0.5 text-green-400 hover:bg-gray-700">
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setEditName(''); }}
                      className="rounded p-0.5 text-red-400 hover:bg-gray-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedWorkspace(workspace.id)}
                    className={cn(
                      'group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors',
                      isSelected
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" style={{ color: workspace.color }} />
                    <span className="flex-1 truncate">{workspace.name}</span>
                    <span
                      className="rounded px-1 py-0.5 text-xs capitalize"
                      style={{ backgroundColor: workspace.color + '20', color: workspace.color }}
                    >
                      {workspace.type === 'folder' ? 'notes' : workspace.type}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === workspace.id ? null : workspace.id);
                      }}
                      className="rounded p-0.5 opacity-0 hover:bg-gray-700 group-hover:opacity-100"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>
                  </button>
                )}
                
                {/* Context Menu */}
                {menuOpen === workspace.id && (
                  <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded-lg border border-gray-700 bg-gray-800 py-1 shadow-lg">
                    <button
                      onClick={() => startEdit(workspace)}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700"
                    >
                      <Pencil className="h-3 w-3" />
                      Rename
                    </button>
                    <button
                      onClick={() => handleDelete(workspace.id)}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-gray-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="border-t border-gray-700 p-2">
        {showCreate ? (
          <div className="space-y-2 rounded-lg border border-gray-700 bg-gray-800/50 p-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') {
                  setShowCreate(false);
                  setNewName('');
                }
              }}
              placeholder="Name..."
              className="w-full bg-gray-700 rounded px-2 py-1 text-sm text-white placeholder-gray-500 focus:outline-none"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-1">
              {typeOptions.map((option) => {
                const TypeIcon = iconMap[option.icon];
                return (
                  <button
                    key={option.value}
                    onClick={() => setNewType(option.value)}
                    className={cn(
                      'flex items-center gap-1 rounded px-1.5 py-1 text-xs transition-colors',
                      newType === option.value
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-500 hover:bg-gray-700/50'
                    )}
                  >
                    <TypeIcon className="h-3 w-3" style={{ color: option.color }} />
                    <span className="truncate">{option.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end gap-1">
              <button
                onClick={() => { setShowCreate(false); setNewName(''); }}
                className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="rounded bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700"
              >
                Create
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Workspace
          </button>
        )}
      </div>
    </aside>
  );
}
