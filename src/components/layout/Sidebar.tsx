import { FileText, MessageSquare, Link as LinkIcon, Terminal } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { cn } from '@/utils/cn';
import type { WorkspaceType } from '@/types';

const sections: { type: WorkspaceType; label: string; icon: React.ElementType; color: string }[] = [
  { type: 'folder',  label: 'Notes',    icon: FileText,      color: '#6b7280' },
  { type: 'card',    label: 'Cards',    icon: MessageSquare, color: '#3b82f6' },
  { type: 'link',    label: 'Links',    icon: LinkIcon,      color: '#10b981' },
  { type: 'command', label: 'Commands', icon: Terminal,      color: '#f59e0b' },
];

export function Sidebar() {
  const { ui, setSelectedSection } = useStore();

  if (!ui.selectedWorkspaceId) return null;

  return (
    <aside className="flex h-full w-44 flex-col border-r border-gray-700 bg-gray-900">
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sections.map(({ type, label, icon: Icon, color }) => {
          const isSelected = ui.selectedSectionType === type;
          return (
            <button
              key={type}
              onClick={() => setSelectedSection(type)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isSelected
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" style={{ color: isSelected ? color : undefined }} />
              <span>{label}</span>
              {isSelected && (
                <span
                  className="ml-auto h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
