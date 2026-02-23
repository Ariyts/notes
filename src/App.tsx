import { useEffect } from 'react';
import { useStore } from '@/stores/useStore';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { FolderPanel } from '@/components/layout/FolderPanel';
import { WorkArea } from '@/components/layout/WorkArea';
import { SyncModal } from '@/components/modals/SyncModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { SearchModal } from '@/components/modals/SearchModal';
import { cn } from '@/utils/cn';

export function App() {
  const { config, toggleSearch, toggleSettings, toggleSync } = useStore();

  // Apply theme
  useEffect(() => {
    const isDark =
      config.theme.mode === 'dark' ||
      (config.theme.mode === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [config.theme.mode]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
      
      if (isMod && e.key === ',') {
        e.preventDefault();
        toggleSettings();
      }

      if (isMod && e.shiftKey && e.key === 's') {
        e.preventDefault();
        toggleSync();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleSearch, toggleSettings, toggleSync]);

  return (
    <div
      className={cn(
        'flex h-screen flex-col bg-gray-950 text-white',
        'font-sans antialiased'
      )}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Layer 1: Sections */}
        <Sidebar />

        {/* Folder Panel - Layer 2: Folders + Notes */}
        <FolderPanel />

        {/* Work Area - Layer 3: Content */}
        <WorkArea />
      </div>

      {/* Footer Breadcrumb */}
      <Footer />

      {/* Modals */}
      <SyncModal />
      <SettingsModal />
      <SearchModal />
    </div>
  );
}

function Footer() {
  const { ui, workspaces, folders, notes } = useStore();

  const selectedWorkspace = workspaces.find((w) => w.id === ui.selectedWorkspaceId);
  const selectedFolder = folders.find((f) => f.id === ui.selectedFolderId);
  const selectedNote = notes.find((n) => n.id === ui.selectedNoteId);

  // Build path
  const pathParts: { name: string; color?: string }[] = [];
  if (selectedWorkspace) {
    pathParts.push({ name: selectedWorkspace.name, color: selectedWorkspace.color });
  }
  if (selectedFolder) {
    // Get folder hierarchy
    const getFolderPath = (folderId: string): string[] => {
      const folder = folders.find((f) => f.id === folderId);
      if (!folder) return [];
      if (folder.parentId) {
        return [...getFolderPath(folder.parentId), folder.name];
      }
      return [folder.name];
    };
    getFolderPath(selectedFolder.id).forEach((name) => {
      pathParts.push({ name });
    });
  }
  if (selectedNote) {
    pathParts.push({ name: selectedNote.title });
  }

  return (
    <footer className="flex h-7 items-center justify-between border-t border-gray-800 bg-gray-900 px-4 text-xs text-gray-500">
      <div className="flex items-center gap-1.5">
        {pathParts.length > 0 ? (
          pathParts.map((part, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-gray-700">›</span>}
              <span style={{ color: part.color }}>{part.name}</span>
            </span>
          ))
        ) : (
          <span>Select a workspace to begin</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span>⌘K Search</span>
        <span>⌘, Settings</span>
      </div>
    </footer>
  );
}
