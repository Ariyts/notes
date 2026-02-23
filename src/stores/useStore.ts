import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type {
  Workspace,
  Folder,
  Note,
  Card,
  Link,
  Tool,
  NoteContent,
  AppConfig,
  UIState,
  SyncState,
  PendingChange,
  WorkspaceType,
  ViewMode,
  ThemeMode,
  CommandItem,
} from '@/types';

interface AppState {
  // Data
  workspaces: Workspace[];
  folders: Folder[];
  notes: Note[];
  // Items (separated by type for easier management)
  noteContents: NoteContent[];
  cards: Card[];
  links: Link[];
  tools: Tool[];
  
  config: AppConfig;
  ui: UIState;
  sync: SyncState;
  pendingChanges: PendingChange[];
  
  // Workspace Actions
  createWorkspace: (name: string, type: WorkspaceType) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  
  // Folder Actions
  createFolder: (workspaceId: string, name: string, parentId: string | null) => void;
  updateFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  
  // Note Actions
  createNote: (workspaceId: string, folderId: string | null, title: string) => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  
  // NoteContent Actions (for folder type workspace)
  updateNoteContent: (noteId: string, content: string, tags?: string[]) => void;
  
  // Card Actions
  createCard: (noteId: string, workspaceId: string, data: Partial<Card>) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  duplicateCard: (id: string) => void;
  
  // Link Actions
  createLink: (noteId: string, workspaceId: string, data: Partial<Link>) => void;
  updateLink: (id: string, updates: Partial<Link>) => void;
  deleteLink: (id: string) => void;
  
  // Tool Actions
  createTool: (noteId: string, workspaceId: string, data: Partial<Tool>) => void;
  updateTool: (id: string, updates: Partial<Tool>) => void;
  deleteTool: (id: string) => void;
  addCommandToTool: (toolId: string, command: Omit<CommandItem, 'id'>) => void;
  deleteCommandFromTool: (toolId: string, commandId: string) => void;
  
  // UI Actions
  setSelectedWorkspace: (id: string | null) => void;
  setSelectedSection: (type: WorkspaceType) => void;
  setSelectedFolder: (id: string | null) => void;
  setSelectedNote: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  toggleSettings: () => void;
  toggleSync: () => void;
  toggleSearch: () => void;
  toggleExport: () => void;
  toggleImport: () => void;
  setEditingNote: (id: string | null) => void;
  
  // Config Actions
  setThemeMode: (mode: ThemeMode) => void;
  setColor: (key: string, color: string) => void;
  setSyncConfig: (config: Partial<AppConfig['sync']>) => void;
  
  // Sync Actions
  addPendingChange: (change: Omit<PendingChange, 'id' | 'timestamp'>) => void;
  clearPendingChanges: () => void;
  setSyncStatus: (status: SyncState['status']) => void;
  setSyncError: (error: string | null) => void;
  setLastSyncAt: (date: string) => void;
  
  // Helpers
  getWorkspaceFolders: (workspaceId: string) => Folder[];
  getFolderNotes: (folderId: string | null, workspaceId: string) => Note[];
  getNoteCards: (noteId: string) => Card[];
  getNoteLinks: (noteId: string) => Link[];
  getNoteTools: (noteId: string) => Tool[];
  getNoteContent: (noteId: string) => NoteContent | undefined;
  getChildFolders: (parentId: string | null, workspaceId: string) => Folder[];
}

const defaultConfig: AppConfig = {
  theme: {
    mode: 'dark',
    colors: {
      primary: '#6366f1',
      folder: '#6b7280',
      card: '#3b82f6',
      link: '#10b981',
      command: '#f59e0b',
    },
  },
  sync: {
    repository: '',
    branch: 'main',
    basePath: 'data/',
  },
  editor: {
    fontSize: 14,
    lineHeight: 1.6,
    tabSize: 2,
  },
  hotkeys: {
    search: 'mod+k',
    newItem: 'mod+n',
    save: 'mod+s',
    sync: 'mod+shift+s',
  },
};

const defaultUI: UIState = {
  selectedWorkspaceId: null,
  selectedSectionType: 'folder',
  selectedFolderId: null,
  selectedNoteId: null,
  viewMode: 'table',
  sidebarCollapsed: false,
  searchQuery: '',
  showSettings: false,
  showSync: false,
  showSearch: false,
  showExport: false,
  showImport: false,
  editingNoteId: null,
};

const defaultSync: SyncState = {
  status: 'synced',
  pendingChanges: 0,
  lastSyncAt: null,
  error: null,
};

// Create default workspaces
const createDefaultData = () => {
  const now = new Date().toISOString();

  const workspaces: Workspace[] = [
    {
      id: nanoid(),
      name: 'My Workspace',
      type: 'folder',
      icon: 'FileText',
      color: '#6366f1',
      createdAt: now,
      updatedAt: now,
    },
  ];

  return { workspaces };
};

const { workspaces: defaultWorkspaces } = createDefaultData();

export const useStore = create<AppState>()(
  persist(
    immer((set, get) => ({
      // Initial State
      workspaces: defaultWorkspaces,
      folders: [],
      notes: [],
      noteContents: [],
      cards: [],
      links: [],
      tools: [],
      config: defaultConfig,
      ui: { ...defaultUI, selectedWorkspaceId: defaultWorkspaces[0].id },
      sync: defaultSync,
      pendingChanges: [],
      
      // Workspace Actions
      createWorkspace: (name, type) => {
        const id = nanoid();
        const now = new Date().toISOString();
        const colorMap: Record<WorkspaceType, string> = {
          folder: '#6b7280',
          card: '#3b82f6',
          link: '#10b981',
          command: '#f59e0b',
        };
        const iconMap: Record<WorkspaceType, string> = {
          folder: 'FileText',
          card: 'MessageSquare',
          link: 'Link',
          command: 'Terminal',
        };
        
        set((state) => {
          state.workspaces.push({
            id,
            name,
            type,
            icon: iconMap[type],
            color: colorMap[type],
            createdAt: now,
            updatedAt: now,
          });
          state.ui.selectedWorkspaceId = id;
          state.sync.pendingChanges++;
        });
        get().addPendingChange({ action: 'create', type: 'workspace', data: { id, name, type } });
      },
      
      updateWorkspace: (id, updates) => {
        set((state) => {
          const ws = state.workspaces.find(w => w.id === id);
          if (ws) {
            Object.assign(ws, updates, { updatedAt: new Date().toISOString() });
            state.sync.pendingChanges++;
          }
        });
        get().addPendingChange({ action: 'update', type: 'workspace', data: { id, ...updates } });
      },
      
      deleteWorkspace: (id) => {
        set((state) => {
          state.workspaces = state.workspaces.filter(w => w.id !== id);
          state.folders = state.folders.filter(f => f.workspaceId !== id);
          state.notes = state.notes.filter(n => n.workspaceId !== id);
          state.noteContents = state.noteContents.filter(nc => nc.workspaceId !== id);
          state.cards = state.cards.filter(c => c.workspaceId !== id);
          state.links = state.links.filter(l => l.workspaceId !== id);
          state.tools = state.tools.filter(t => t.workspaceId !== id);
          
          if (state.ui.selectedWorkspaceId === id) {
            state.ui.selectedWorkspaceId = state.workspaces[0]?.id ?? null;
            state.ui.selectedFolderId = null;
            state.ui.selectedNoteId = null;
          }
          state.sync.pendingChanges++;
        });
        get().addPendingChange({ action: 'delete', type: 'workspace', data: { id } });
      },
      
      // Folder Actions
      createFolder: (workspaceId, name, parentId) => {
        const id = nanoid();
        const now = new Date().toISOString();
        set((state) => {
          state.folders.push({
            id,
            name,
            parentId,
            workspaceId,
            createdAt: now,
            updatedAt: now,
          });
          state.sync.pendingChanges++;
        });
        get().addPendingChange({ action: 'create', type: 'folder', data: { id, name, parentId, workspaceId } });
      },
      
      updateFolder: (id, name) => {
        set((state) => {
          const folder = state.folders.find(f => f.id === id);
          if (folder) {
            folder.name = name;
            folder.updatedAt = new Date().toISOString();
            state.sync.pendingChanges++;
          }
        });
        get().addPendingChange({ action: 'update', type: 'folder', data: { id, name } });
      },
      
      deleteFolder: (id) => {
        set((state) => {
          const deleteRecursive = (folderId: string) => {
            const children = state.folders.filter(f => f.parentId === folderId);
            children.forEach(child => deleteRecursive(child.id));
            
            // Delete notes in this folder
            const notesInFolder = state.notes.filter(n => n.folderId === folderId);
            notesInFolder.forEach(note => {
              state.noteContents = state.noteContents.filter(nc => nc.noteId !== note.id);
              state.cards = state.cards.filter(c => c.noteId !== note.id);
              state.links = state.links.filter(l => l.noteId !== note.id);
              state.tools = state.tools.filter(t => t.noteId !== note.id);
            });
            state.notes = state.notes.filter(n => n.folderId !== folderId);
            state.folders = state.folders.filter(f => f.id !== folderId);
          };
          deleteRecursive(id);
          
          if (state.ui.selectedFolderId === id) {
            state.ui.selectedFolderId = null;
            state.ui.selectedNoteId = null;
          }
          state.sync.pendingChanges++;
        });
        get().addPendingChange({ action: 'delete', type: 'folder', data: { id } });
      },
      
      // Note Actions
      createNote: (workspaceId, folderId, title) => {
        const id = nanoid();
        const now = new Date().toISOString();
        
        set((state) => {
          state.notes.push({
            id,
            title,
            folderId,
            workspaceId,
            createdAt: now,
            updatedAt: now,
          });
          
          // For notes section, create empty NoteContent
          if (state.ui.selectedSectionType === 'folder') {
            state.noteContents.push({
              id: nanoid(),
              noteId: id,
              workspaceId,
              content: '',
              tags: [],
              createdAt: now,
              updatedAt: now,
            });
          }
          
          state.ui.selectedNoteId = id;
          state.sync.pendingChanges++;
        });
        
        get().addPendingChange({ action: 'create', type: 'note', data: { id, title, folderId, workspaceId } });
        return id;
      },
      
      updateNote: (id, updates) => {
        set((state) => {
          const note = state.notes.find(n => n.id === id);
          if (note) {
            Object.assign(note, updates, { updatedAt: new Date().toISOString() });
            state.sync.pendingChanges++;
          }
        });
        get().addPendingChange({ action: 'update', type: 'note', data: { id, ...updates } });
      },
      
      deleteNote: (id) => {
        set((state) => {
          state.notes = state.notes.filter(n => n.id !== id);
          state.noteContents = state.noteContents.filter(nc => nc.noteId !== id);
          state.cards = state.cards.filter(c => c.noteId !== id);
          state.links = state.links.filter(l => l.noteId !== id);
          state.tools = state.tools.filter(t => t.noteId !== id);
          
          if (state.ui.selectedNoteId === id) {
            state.ui.selectedNoteId = null;
          }
          state.sync.pendingChanges++;
        });
        get().addPendingChange({ action: 'delete', type: 'note', data: { id } });
      },
      
      // NoteContent Actions
      updateNoteContent: (noteId, content, tags) => {
        set((state) => {
          const nc = state.noteContents.find(n => n.noteId === noteId);
          if (nc) {
            nc.content = content;
            if (tags) nc.tags = tags;
            nc.updatedAt = new Date().toISOString();
            state.sync.pendingChanges++;
          }
        });
        get().addPendingChange({ action: 'update', type: 'content', data: { noteId, content, tags } });
      },
      
      // Card Actions
      createCard: (noteId, workspaceId, data) => {
        const id = nanoid();
        const now = new Date().toISOString();
        set((state) => {
          state.cards.push({
            id,
            noteId,
            workspaceId,
            name: data.name || '',
            tag: data.tag || '',
            content: data.content || '',
            createdAt: now,
            updatedAt: now,
          });
          state.sync.pendingChanges++;
        });
        get().addPendingChange({ action: 'create', type: 'content', data: { id, noteId, ...data } });
      },
      
      updateCard: (id, updates) => {
        set((state) => {
          const card = state.cards.find(c => c.id === id);
          if (card) {
            Object.assign(card, updates, { updatedAt: new Date().toISOString() });
            state.sync.pendingChanges++;
          }
        });
        get().addPendingChange({ action: 'update', type: 'content', data: { id, ...updates } });
      },
      
      deleteCard: (id) => {
        set((state) => {
          state.cards = state.cards.filter(c => c.id !== id);
          state.sync.pendingChanges++;
        });
        get().addPendingChange({ action: 'delete', type: 'content', data: { id } });
      },
      
      duplicateCard: (id) => {
        const card = get().cards.find(c => c.id === id);
        if (card) {
          get().createCard(card.noteId, card.workspaceId, {
            name: card.name + ' (copy)',
            tag: card.tag,
            content: card.content,
          });
        }
      },
      
      // Link Actions
      createLink: (noteId, workspaceId, data) => {
        const id = nanoid();
        const now = new Date().toISOString();
        set((state) => {
          state.links.push({
            id,
            noteId,
            workspaceId,
            name: data.name || '',
            url: data.url || '',
            description: data.description || '',
            createdAt: now,
            updatedAt: now,
          });
          state.sync.pendingChanges++;
        });
        get().addPendingChange({ action: 'create', type: 'content', data: { id, noteId, ...data } });
      },
      
      updateLink: (id, updates) => {
        set((state) => {
          const link = state.links.find(l => l.id === id);
          if (link) {
            Object.assign(link, updates, { updatedAt: new Date().toISOString() });
            state.sync.pendingChanges++;
          }
        });
        get().addPendingChange({ action: 'update', type: 'content', data: { id, ...updates } });
      },
      
      deleteLink: (id) => {
        set((state) => {
          state.links = state.links.filter(l => l.id !== id);
          state.sync.pendingChanges++;
        });
        get().addPendingChange({ action: 'delete', type: 'content', data: { id } });
      },
      
      // Tool Actions
      createTool: (noteId, workspaceId, data) => {
        const id = nanoid();
        const now = new Date().toISOString();
        set((state) => {
          state.tools.push({
            id,
            noteId,
            workspaceId,
            toolName: data.toolName || '',
            toolDescription: data.toolDescription || '',
            commands: data.commands || [],
            createdAt: now,
            updatedAt: now,
          });
          state.sync.pendingChanges++;
        });
        get().addPendingChange({ action: 'create', type: 'content', data: { id, noteId, ...data } });
        return id;
      },
      
      updateTool: (id, updates) => {
        set((state) => {
          const tool = state.tools.find(t => t.id === id);
          if (tool) {
            Object.assign(tool, updates, { updatedAt: new Date().toISOString() });
            state.sync.pendingChanges++;
          }
        });
        get().addPendingChange({ action: 'update', type: 'content', data: { id, ...updates } });
      },
      
      deleteTool: (id) => {
        set((state) => {
          state.tools = state.tools.filter(t => t.id !== id);
          state.sync.pendingChanges++;
        });
        get().addPendingChange({ action: 'delete', type: 'content', data: { id } });
      },
      
      addCommandToTool: (toolId, command) => {
        set((state) => {
          const tool = state.tools.find(t => t.id === toolId);
          if (tool) {
            tool.commands.push({ ...command, id: nanoid() });
            tool.updatedAt = new Date().toISOString();
            state.sync.pendingChanges++;
          }
        });
        get().addPendingChange({ action: 'update', type: 'content', data: { toolId, command } });
      },
      
      deleteCommandFromTool: (toolId, commandId) => {
        set((state) => {
          const tool = state.tools.find(t => t.id === toolId);
          if (tool) {
            tool.commands = tool.commands.filter(c => c.id !== commandId);
            tool.updatedAt = new Date().toISOString();
            state.sync.pendingChanges++;
          }
        });
        get().addPendingChange({ action: 'update', type: 'content', data: { toolId, commandId } });
      },
      
      // UI Actions
      setSelectedWorkspace: (id) => set((state) => {
        state.ui.selectedWorkspaceId = id;
        state.ui.selectedSectionType = 'folder';
        state.ui.selectedFolderId = null;
        state.ui.selectedNoteId = null;
      }),

      setSelectedSection: (type) => set((state) => {
        state.ui.selectedSectionType = type;
        state.ui.selectedFolderId = null;
        state.ui.selectedNoteId = null;
      }),
      
      setSelectedFolder: (id) => set((state) => {
        state.ui.selectedFolderId = id;
        state.ui.selectedNoteId = null;
      }),
      
      setSelectedNote: (id) => set((state) => {
        state.ui.selectedNoteId = id;
      }),
      
      setViewMode: (mode) => set((state) => {
        state.ui.viewMode = mode;
      }),
      
      toggleSidebar: () => set((state) => {
        state.ui.sidebarCollapsed = !state.ui.sidebarCollapsed;
      }),
      
      setSearchQuery: (query) => set((state) => {
        state.ui.searchQuery = query;
      }),
      
      toggleSettings: () => set((state) => {
        state.ui.showSettings = !state.ui.showSettings;
      }),
      
      toggleSync: () => set((state) => {
        state.ui.showSync = !state.ui.showSync;
      }),
      
      toggleSearch: () => set((state) => {
        state.ui.showSearch = !state.ui.showSearch;
      }),
      
      toggleExport: () => set((state) => {
        state.ui.showExport = !state.ui.showExport;
      }),
      
      toggleImport: () => set((state) => {
        state.ui.showImport = !state.ui.showImport;
      }),
      
      setEditingNote: (id) => set((state) => {
        state.ui.editingNoteId = id;
      }),
      
      // Config Actions
      setThemeMode: (mode) => set((state) => {
        state.config.theme.mode = mode;
      }),
      
      setColor: (key, color) => set((state) => {
        (state.config.theme.colors as any)[key] = color;
      }),
      
      setSyncConfig: (config) => set((state) => {
        Object.assign(state.config.sync, config);
      }),
      
      // Sync Actions
      addPendingChange: (change) => set((state) => {
        state.pendingChanges.push({
          ...change,
          id: nanoid(),
          timestamp: new Date().toISOString(),
        });
      }),
      
      clearPendingChanges: () => set((state) => {
        state.pendingChanges = [];
        state.sync.pendingChanges = 0;
      }),
      
      setSyncStatus: (status) => set((state) => {
        state.sync.status = status;
      }),
      
      setSyncError: (error) => set((state) => {
        state.sync.error = error;
        if (error) state.sync.status = 'error';
      }),
      
      setLastSyncAt: (date) => set((state) => {
        state.sync.lastSyncAt = date;
      }),
      
      // Helpers
      getWorkspaceFolders: (workspaceId) => {
        return get().folders.filter(f => f.workspaceId === workspaceId);
      },
      
      getFolderNotes: (folderId, workspaceId) => {
        return get().notes.filter(n => n.folderId === folderId && n.workspaceId === workspaceId);
      },
      
      getNoteCards: (noteId) => {
        return get().cards.filter(c => c.noteId === noteId);
      },
      
      getNoteLinks: (noteId) => {
        return get().links.filter(l => l.noteId === noteId);
      },
      
      getNoteTools: (noteId) => {
        return get().tools.filter(t => t.noteId === noteId);
      },
      
      getNoteContent: (noteId) => {
        return get().noteContents.find(nc => nc.noteId === noteId);
      },
      
      getChildFolders: (parentId, workspaceId) => {
        return get().folders.filter(f => f.parentId === parentId && f.workspaceId === workspaceId);
      },
    })),
    {
      name: 'knowledge-hub-storage-v3',
      partialize: (state) => ({
        workspaces: state.workspaces,
        folders: state.folders,
        notes: state.notes,
        noteContents: state.noteContents,
        cards: state.cards,
        links: state.links,
        tools: state.tools,
        config: state.config,
        pendingChanges: state.pendingChanges,
        sync: state.sync,
        ui: {
          selectedWorkspaceId: state.ui.selectedWorkspaceId,
          viewMode: state.ui.viewMode,
        },
      }),
    }
  )
);
