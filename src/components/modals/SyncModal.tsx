import { useState } from 'react';
import { RefreshCw, Check, AlertCircle, Github, Loader2 } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export function SyncModal() {
  const {
    ui,
    sync,
    config,
    pendingChanges,
    toggleSync,
    setSyncConfig,
    setSyncStatus,
    setSyncError,
    setLastSyncAt,
    clearPendingChanges,
  } = useStore();

  const [token, setToken] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    if (!token || !config.sync.repository) {
      setSyncError('Please enter your GitHub token and repository');
      return;
    }

    setIsLoading(true);
    setSyncStatus('syncing');
    setSyncError(null);

    try {
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would use Octokit to:
      // 1. Get current repo state
      // 2. Compare with local changes
      // 3. Create commits for changes
      // 4. Push to repository
      
      setLastSyncAt(new Date().toISOString());
      clearPendingChanges();
      setSyncStatus('synced');
      setToken('');
      setCommitMessage('');
      toggleSync();
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
      setSyncStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const statusConfig = {
    synced: { icon: Check, color: 'text-green-400', bg: 'bg-green-400/10', label: 'All changes synced' },
    pending: { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: `${sync.pendingChanges} pending changes` },
    syncing: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Syncing...' },
    error: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Sync error' },
  };

  const currentStatus = sync.pendingChanges > 0 && sync.status !== 'syncing' ? 'pending' : sync.status;
  const { icon: StatusIcon, color, bg, label } = statusConfig[currentStatus];

  return (
    <Modal isOpen={ui.showSync} onClose={toggleSync} title="Sync to GitHub" size="md">
      <div className="space-y-6">
        {/* Status */}
        <div className={cn('flex items-center gap-3 rounded-lg p-4', bg)}>
          <StatusIcon className={cn('h-5 w-5', color, sync.status === 'syncing' && 'animate-spin')} />
          <div>
            <p className={cn('font-medium', color)}>{label}</p>
            {sync.lastSyncAt && (
              <p className="text-xs text-gray-400">
                Last sync: {new Date(sync.lastSyncAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Repository Settings */}
        <div className="space-y-3">
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
        </div>

        {/* Token & Commit */}
        {pendingChanges.length > 0 && (
          <div className="space-y-3 border-t border-gray-700 pt-4">
            <Input
              label="GitHub Personal Access Token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            />
            <Input
              label="Commit Message"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder={`Update: ${pendingChanges.length} items modified`}
            />
          </div>
        )}

        {/* Error */}
        {sync.error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-400/10 p-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {sync.error}
          </div>
        )}

        {/* Pending Changes Preview */}
        {pendingChanges.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-300">Pending Changes:</p>
            <div className="max-h-32 overflow-y-auto rounded-lg border border-gray-700 bg-gray-800/50">
              {pendingChanges.slice(0, 5).map((change) => (
                <div
                  key={change.id}
                  className="flex items-center justify-between border-b border-gray-700/50 px-3 py-2 text-sm last:border-0"
                >
                  <span className="text-gray-300">
                    {change.action} {change.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(change.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {pendingChanges.length > 5 && (
                <div className="px-3 py-2 text-center text-xs text-gray-500">
                  +{pendingChanges.length - 5} more changes
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={toggleSync}>
            Cancel
          </Button>
          <Button
            onClick={handleSync}
            disabled={isLoading || pendingChanges.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Sync Now
              </>
            )}
          </Button>
        </div>

        {/* Help */}
        <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-3">
          <div className="flex items-start gap-2">
            <Github className="mt-0.5 h-4 w-4 text-gray-400" />
            <div className="text-xs text-gray-400">
              <p className="font-medium text-gray-300">How to get a GitHub Token:</p>
              <ol className="mt-1 list-inside list-decimal space-y-0.5">
                <li>Go to GitHub Settings → Developer settings</li>
                <li>Select Personal access tokens → Tokens (classic)</li>
                <li>Generate new token with "repo" scope</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
