import { useState } from 'react';
import { Moon, Sun, Monitor, Palette, Database, Keyboard } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/cn';
import type { ThemeMode } from '@/types';

type SettingsTab = 'appearance' | 'sync' | 'editor' | 'hotkeys';

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'sync', label: 'Sync', icon: Database },
  { id: 'hotkeys', label: 'Hotkeys', icon: Keyboard },
];

export function SettingsModal() {
  const { ui, config, toggleSettings, setThemeMode, setColor, setSyncConfig } = useStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

  const themeModes: { value: ThemeMode; label: string; icon: React.ElementType }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const colorOptions = [
    { key: 'primary', label: 'Primary' },
    { key: 'folder', label: 'Folder' },
    { key: 'card', label: 'Card' },
    { key: 'link', label: 'Link' },
    { key: 'command', label: 'Command' },
  ];

  return (
    <Modal isOpen={ui.showSettings} onClose={toggleSettings} title="Settings" size="xl">
      <div className="flex gap-6">
        {/* Tabs */}
        <div className="w-40 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                activeTab === tab.id
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'appearance' && (
            <>
              {/* Theme Mode */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Theme</label>
                <div className="flex gap-2">
                  {themeModes.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setThemeMode(mode.value)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors',
                        config.theme.mode === mode.value
                          ? 'border-indigo-500 bg-indigo-500/10 text-white'
                          : 'border-gray-600 text-gray-400 hover:border-gray-500'
                      )}
                    >
                      <mode.icon className="h-4 w-4" />
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Colors */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Accent Colors</label>
                <div className="grid gap-3">
                  {colorOptions.map((option) => (
                    <div key={option.key} className="flex items-center gap-3">
                      <input
                        type="color"
                        value={(config.theme.colors as any)[option.key]}
                        onChange={(e) => setColor(option.key, e.target.value)}
                        className="h-8 w-12 cursor-pointer rounded border border-gray-600 bg-gray-800"
                      />
                      <span className="text-sm text-gray-300">{option.label}</span>
                      <span className="text-xs text-gray-500">
                        {(config.theme.colors as any)[option.key]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-4">
              <Input
                label="Repository (owner/repo)"
                value={config.sync.repository}
                onChange={(e) => setSyncConfig({ repository: e.target.value })}
                placeholder="username/knowledge-hub"
              />
              <Input
                label="Branch"
                value={config.sync.branch}
                onChange={(e) => setSyncConfig({ branch: e.target.value })}
                placeholder="main"
              />
              <Input
                label="Base Path"
                value={config.sync.basePath}
                onChange={(e) => setSyncConfig({ basePath: e.target.value })}
                placeholder="data/"
              />
              <div className="rounded-lg bg-gray-800/50 p-4 text-sm text-gray-400">
                <p className="font-medium text-gray-300">Note:</p>
                <p className="mt-1">
                  Your GitHub token is never stored. You'll be prompted to enter it each time you sync.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'hotkeys' && (
            <div className="space-y-3">
              {Object.entries(config.hotkeys).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3"
                >
                  <span className="text-sm capitalize text-gray-300">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <kbd className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-400">
                    {value.replace('mod', '⌘/Ctrl')}
                  </kbd>
                </div>
              ))}
              <p className="text-xs text-gray-500">
                Hotkey customization coming soon
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
