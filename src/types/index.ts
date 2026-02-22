// ==================== Core Types ====================

export type WorkspaceType = 'folder' | 'card' | 'link' | 'command';
export type ViewMode = 'table' | 'grid' | 'list';
export type ThemeMode = 'light' | 'dark' | 'system';
export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error';

// ==================== Workspace ====================

export interface Workspace {
  id: string;
  name: string;
  type: WorkspaceType;  // Определяет тип контента внутри
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Folders (Layer 2) ====================

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Notes (Container for items) ====================

export interface Note {
  id: string;
  title: string;
  description?: string;
  folderId: string | null;  // null = root level
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Items inside Notes ====================

// For Folder workspace type → Markdown content
export interface NoteContent {
  id: string;
  noteId: string;
  workspaceId: string;
  content: string;  // Markdown content
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// For Card workspace type → Cards/Prompts
export interface Card {
  id: string;
  noteId: string;
  workspaceId: string;
  name: string;
  tag: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// For Link workspace type → Links
export interface Link {
  id: string;
  noteId: string;
  workspaceId: string;
  name: string;
  url: string;
  description: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

// For Command workspace type → Tools with commands
export interface Tool {
  id: string;
  noteId: string;
  workspaceId: string;
  toolName: string;
  toolDescription: string;
  commands: CommandItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CommandItem {
  id: string;
  description: string;
  command: string;
}

// Union type for all items
export type ContentItem = NoteContent | Card | Link | Tool;

// ==================== Config ====================

export interface AppConfig {
  theme: {
    mode: ThemeMode;
    colors: {
      primary: string;
      folder: string;
      card: string;
      link: string;
      command: string;
    };
  };
  sync: {
    repository: string;
    branch: string;
    basePath: string;
  };
  editor: {
    fontSize: number;
    lineHeight: number;
    tabSize: number;
  };
  hotkeys: {
    search: string;
    newItem: string;
    save: string;
    sync: string;
  };
}

// ==================== UI State ====================

export interface UIState {
  selectedWorkspaceId: string | null;
  selectedFolderId: string | null;
  selectedNoteId: string | null;
  viewMode: ViewMode;
  sidebarCollapsed: boolean;
  searchQuery: string;
  showSettings: boolean;
  showSync: boolean;
  showSearch: boolean;
  showExport: boolean;
  showImport: boolean;
  editingNoteId: string | null;
}

// ==================== Sync ====================

export interface SyncState {
  status: SyncStatus;
  pendingChanges: number;
  lastSyncAt: string | null;
  error: string | null;
}

export interface PendingChange {
  id: string;
  action: 'create' | 'update' | 'delete';
  type: 'workspace' | 'folder' | 'note' | 'content';
  data: any;
  timestamp: string;
}
