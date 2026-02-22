import { useState } from 'react';
import {
  Folder,
  FolderPlus,
  FileText,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  X,
  FilePlus,
} from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { cn } from '@/utils/cn';
import type { Folder as FolderType, Note } from '@/types';

interface FolderTreeItemProps {
  folder: FolderType;
  level: number;
  allFolders: FolderType[];
  allNotes: Note[];
  selectedFolderId: string | null;
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onUpdateFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onCreateSubfolder: (parentId: string) => void;
  onCreateNote: (folderId: string) => void;
  onDeleteNote: (id: string) => void;
  onRenameNote: (id: string, name: string) => void;
  workspaceColor: string;
}

function FolderTreeItem({
  folder,
  level,
  allFolders,
  allNotes,
  selectedFolderId,
  selectedNoteId,
  onSelectNote,
  onUpdateFolder,
  onDeleteFolder,
  onCreateSubfolder,
  onCreateNote,
  onDeleteNote,
  onRenameNote,
  workspaceColor,
}: FolderTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const children = allFolders.filter(f => f.parentId === folder.id);
  const folderNotes = allNotes.filter(n => n.folderId === folder.id);
  const hasChildren = children.length > 0 || folderNotes.length > 0;

  const handleSave = () => {
    if (editName.trim()) {
      onUpdateFolder(folder.id, editName.trim());
    } else {
      setEditName(folder.name);
    }
    setIsEditing(false);
  };

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1 rounded-md py-1 pr-1 text-sm transition-colors',
          'text-gray-400 hover:bg-gray-800/50 hover:text-white'
        )}
        style={{ paddingLeft: `${level * 12 + 4}px` }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn('p-0.5 rounded hover:bg-gray-700', !hasChildren && 'invisible')}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
        
        <Folder className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
        
        {isEditing ? (
          <div className="flex flex-1 items-center gap-1">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') {
                  setEditName(folder.name);
                  setIsEditing(false);
                }
              }}
              className="flex-1 min-w-0 rounded border border-gray-600 bg-gray-800 px-1 py-0.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              autoFocus
            />
            <button onClick={handleSave} className="rounded p-0.5 hover:bg-gray-700 text-green-400">
              <Check className="h-3 w-3" />
            </button>
            <button
              onClick={() => {
                setEditName(folder.name);
                setIsEditing(false);
              }}
              className="rounded p-0.5 hover:bg-gray-700 text-red-400"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <>
            <span className="flex-1 truncate text-xs">{folder.name}</span>
            
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="rounded p-0.5 opacity-0 hover:bg-gray-700 group-hover:opacity-100"
              >
                <MoreVertical className="h-3 w-3" />
              </button>
              
              {menuOpen && (
                <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-gray-700 bg-gray-800 py-1 shadow-lg">
                  <button
                    onClick={() => {
                      onCreateNote(folder.id);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700"
                  >
                    <FilePlus className="h-3 w-3" />
                    New Note
                  </button>
                  <button
                    onClick={() => {
                      onCreateSubfolder(folder.id);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700"
                  >
                    <FolderPlus className="h-3 w-3" />
                    New Subfolder
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700"
                  >
                    <Pencil className="h-3 w-3" />
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      onDeleteFolder(folder.id);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-gray-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {isExpanded && (
        <div>
          {/* Child folders */}
          {children.map(child => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              level={level + 1}
              allFolders={allFolders}
              allNotes={allNotes}
              selectedFolderId={selectedFolderId}
              selectedNoteId={selectedNoteId}
              onSelectNote={onSelectNote}
              onUpdateFolder={onUpdateFolder}
              onDeleteFolder={onDeleteFolder}
              onCreateSubfolder={onCreateSubfolder}
              onCreateNote={onCreateNote}
              onDeleteNote={onDeleteNote}
              onRenameNote={onRenameNote}
              workspaceColor={workspaceColor}
            />
          ))}
          
          {/* Notes in this folder */}
          {folderNotes.map(note => (
            <NoteItem
              key={note.id}
              note={note}
              level={level + 1}
              isSelected={selectedNoteId === note.id}
              onSelect={() => onSelectNote(note.id)}
              onDelete={() => onDeleteNote(note.id)}
              onRename={(name) => onRenameNote(note.id, name)}
              color={workspaceColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteItem({
  note,
  level,
  isSelected,
  onSelect,
  onDelete,
  onRename,
  color,
}: {
  note: Note;
  level: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
  color: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(note.title);

  const handleSave = () => {
    if (editName.trim()) {
      onRename(editName.trim());
    } else {
      setEditName(note.title);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-1 rounded-md py-1 pr-1 text-sm transition-colors cursor-pointer',
        isSelected ? 'bg-indigo-600/30 text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
      )}
      style={{ paddingLeft: `${level * 12 + 24}px` }}
      onClick={!isEditing ? onSelect : undefined}
    >
      <FileText className="h-3.5 w-3.5 flex-shrink-0" style={{ color }} />
      
      {isEditing ? (
        <div className="flex flex-1 items-center gap-1">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') {
                setEditName(note.title);
                setIsEditing(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 min-w-0 rounded border border-gray-600 bg-gray-800 px-1 py-0.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            autoFocus
          />
          <button onClick={(e) => { e.stopPropagation(); handleSave(); }} className="rounded p-0.5 hover:bg-gray-700 text-green-400">
            <Check className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setEditName(note.title); setIsEditing(false); }}
            className="rounded p-0.5 hover:bg-gray-700 text-red-400"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <>
          <span className="flex-1 truncate text-xs">{note.title}</span>
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="rounded p-0.5 opacity-0 hover:bg-gray-700 group-hover:opacity-100"
            >
              <MoreVertical className="h-3 w-3" />
            </button>
            
            {menuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-28 rounded-lg border border-gray-700 bg-gray-800 py-1 shadow-lg">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700"
                >
                  <Pencil className="h-3 w-3" />
                  Rename
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-gray-700"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function FolderPanel() {
  const {
    ui,
    workspaces,
    notes,
    getWorkspaceFolders,
    setSelectedNote,
    createFolder,
    updateFolder,
    deleteFolder,
    createNote,
    updateNote,
    deleteNote,
    setEditingNote,
  } = useStore();

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [parentIdForNew, setParentIdForNew] = useState<string | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [folderIdForNote, setFolderIdForNote] = useState<string | null>(null);

  const selectedWorkspace = workspaces.find(w => w.id === ui.selectedWorkspaceId);
  const folders = ui.selectedWorkspaceId ? getWorkspaceFolders(ui.selectedWorkspaceId) : [];
  const rootFolders = folders.filter(f => f.parentId === null);
  
  // Notes at root level (no folder)
  const workspaceNotes = ui.selectedWorkspaceId 
    ? notes.filter(n => n.workspaceId === ui.selectedWorkspaceId)
    : [];
  const rootNotes = workspaceNotes.filter(n => n.folderId === null);

  const handleCreateFolder = () => {
    if (!newFolderName.trim() || !ui.selectedWorkspaceId) return;
    
    createFolder(ui.selectedWorkspaceId, newFolderName.trim(), parentIdForNew);
    
    setNewFolderName('');
    setIsCreatingFolder(false);
    setParentIdForNew(null);
  };

  const startCreateSubfolder = (parentId: string) => {
    setParentIdForNew(parentId);
    setIsCreatingFolder(true);
  };

  const handleDeleteFolder = (id: string) => {
    if (confirm('Delete this folder and all its contents?')) {
      deleteFolder(id);
    }
  };

  const startCreateNote = (folderId: string | null) => {
    setFolderIdForNote(folderId);
    setIsCreatingNote(true);
  };

  const handleCreateNote = () => {
    if (!newNoteTitle.trim() || !ui.selectedWorkspaceId) return;

    const noteId = createNote(ui.selectedWorkspaceId, folderIdForNote, newNoteTitle.trim());
    
    setNewNoteTitle('');
    setIsCreatingNote(false);
    setFolderIdForNote(null);
    
    // Select the note and start editing
    setSelectedNote(noteId);
    setEditingNote(noteId);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm('Delete this note?')) {
      deleteNote(id);
    }
  };

  const handleRenameNote = (id: string, name: string) => {
    updateNote(id, { title: name });
  };

  const handleSelectNote = (id: string) => {
    setSelectedNote(id);
  };

  if (!selectedWorkspace) {
    return (
      <div className="flex h-full w-56 flex-col items-center justify-center border-r border-gray-700 bg-gray-900/50 p-4 text-center">
        <Folder className="mb-2 h-6 w-6 text-gray-600" />
        <p className="text-xs text-gray-500">Select a workspace</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-56 flex-col border-r border-gray-700 bg-gray-900/50">
      {/* Header */}
      <div className="border-b border-gray-700 px-2 py-2">
        <h2 className="text-sm font-medium text-white truncate">{selectedWorkspace.name}</h2>
        <div className="mt-1 flex gap-1">
          <button
            onClick={() => {
              setParentIdForNew(null);
              setIsCreatingFolder(true);
            }}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-gray-400 hover:bg-gray-800 hover:text-white"
            title="New Folder"
          >
            <FolderPlus className="h-3 w-3" />
            <span>Folder</span>
          </button>
          <button
            onClick={() => startCreateNote(null)}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-gray-400 hover:bg-gray-800 hover:text-white"
            title="New Note"
          >
            <FilePlus className="h-3 w-3" />
            <span>Note</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-1">
        {/* Inline create folder at root */}
        {isCreatingFolder && parentIdForNew === null && (
          <div className="mb-1 flex items-center gap-1 rounded-md border border-gray-700 bg-gray-800 px-1 py-1">
            <Folder className="h-3.5 w-3.5 text-amber-500" />
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') {
                  setIsCreatingFolder(false);
                  setNewFolderName('');
                }
              }}
              placeholder="Folder name..."
              className="flex-1 min-w-0 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
              autoFocus
            />
            <button onClick={handleCreateFolder} className="rounded p-0.5 hover:bg-gray-700 text-green-400">
              <Check className="h-3 w-3" />
            </button>
            <button
              onClick={() => {
                setIsCreatingFolder(false);
                setNewFolderName('');
              }}
              className="rounded p-0.5 hover:bg-gray-700 text-red-400"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Inline create note at root */}
        {isCreatingNote && folderIdForNote === null && (
          <div className="mb-1 flex items-center gap-1 rounded-md border border-gray-700 bg-gray-800 px-1 py-1">
            <FileText className="h-3.5 w-3.5" style={{ color: selectedWorkspace.color }} />
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateNote();
                if (e.key === 'Escape') {
                  setIsCreatingNote(false);
                  setNewNoteTitle('');
                }
              }}
              placeholder="Note title..."
              className="flex-1 min-w-0 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
              autoFocus
            />
            <button onClick={handleCreateNote} className="rounded p-0.5 hover:bg-gray-700 text-green-400">
              <Check className="h-3 w-3" />
            </button>
            <button
              onClick={() => {
                setIsCreatingNote(false);
                setNewNoteTitle('');
              }}
              className="rounded p-0.5 hover:bg-gray-700 text-red-400"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Root folders */}
        {rootFolders.map(folder => (
          <FolderTreeItem
            key={folder.id}
            folder={folder}
            level={0}
            allFolders={folders}
            allNotes={workspaceNotes}
            selectedFolderId={ui.selectedFolderId}
            selectedNoteId={ui.selectedNoteId}
            onSelectNote={handleSelectNote}
            onUpdateFolder={updateFolder}
            onDeleteFolder={handleDeleteFolder}
            onCreateSubfolder={startCreateSubfolder}
            onCreateNote={startCreateNote}
            onDeleteNote={handleDeleteNote}
            onRenameNote={handleRenameNote}
            workspaceColor={selectedWorkspace.color}
          />
        ))}
        
        {/* Root level notes */}
        {rootNotes.map(note => (
          <NoteItem
            key={note.id}
            note={note}
            level={0}
            isSelected={ui.selectedNoteId === note.id}
            onSelect={() => handleSelectNote(note.id)}
            onDelete={() => handleDeleteNote(note.id)}
            onRename={(name) => handleRenameNote(note.id, name)}
            color={selectedWorkspace.color}
          />
        ))}

        {/* Inline create folder in subfolder */}
        {isCreatingFolder && parentIdForNew !== null && (
          <div className="ml-6 flex items-center gap-1 rounded-md border border-gray-700 bg-gray-800 px-1 py-1">
            <Folder className="h-3.5 w-3.5 text-amber-500" />
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') {
                  setIsCreatingFolder(false);
                  setNewFolderName('');
                  setParentIdForNew(null);
                }
              }}
              placeholder="Subfolder name..."
              className="flex-1 min-w-0 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
              autoFocus
            />
            <button onClick={handleCreateFolder} className="rounded p-0.5 hover:bg-gray-700 text-green-400">
              <Check className="h-3 w-3" />
            </button>
            <button
              onClick={() => {
                setIsCreatingFolder(false);
                setNewFolderName('');
                setParentIdForNew(null);
              }}
              className="rounded p-0.5 hover:bg-gray-700 text-red-400"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Inline create note in folder */}
        {isCreatingNote && folderIdForNote !== null && (
          <div className="ml-6 flex items-center gap-1 rounded-md border border-gray-700 bg-gray-800 px-1 py-1">
            <FileText className="h-3.5 w-3.5" style={{ color: selectedWorkspace.color }} />
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateNote();
                if (e.key === 'Escape') {
                  setIsCreatingNote(false);
                  setNewNoteTitle('');
                  setFolderIdForNote(null);
                }
              }}
              placeholder="Note title..."
              className="flex-1 min-w-0 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
              autoFocus
            />
            <button onClick={handleCreateNote} className="rounded p-0.5 hover:bg-gray-700 text-green-400">
              <Check className="h-3 w-3" />
            </button>
            <button
              onClick={() => {
                setIsCreatingNote(false);
                setNewNoteTitle('');
                setFolderIdForNote(null);
              }}
              className="rounded p-0.5 hover:bg-gray-700 text-red-400"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Empty state */}
        {rootFolders.length === 0 && rootNotes.length === 0 && !isCreatingFolder && !isCreatingNote && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Folder className="mb-2 h-6 w-6 text-gray-600" />
            <p className="text-xs text-gray-500">No items yet</p>
            <p className="text-xs text-gray-600 mt-1">Create a folder or note</p>
          </div>
        )}
      </div>
    </div>
  );
}
