import { useState } from 'react';
import { RefreshCw, Check, AlertCircle, Github, Loader2 } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
}

interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
}

export function SyncModal() {
  const {
    ui,
    sync,
    workspaces,
    folders,
    notes,
    noteContents,
    cards,
    links,
    tools,
    pendingChanges,
    toggleSync,
    setSyncStatus,
    setSyncError,
    setLastSyncAt,
    clearPendingChanges,
  } = useStore();

  const [token, setToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [ghUser, setGhUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [syncLog, setSyncLog] = useState<string[]>([]);

  const githubHeaders = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };

  const handleConnect = async () => {
    if (!token.trim()) return;
    setIsConnecting(true);
    setSyncError(null);
    setGhUser(null);
    setRepos([]);
    setSelectedRepo(null);

    try {
      const userRes = await fetch('https://api.github.com/user', { headers: githubHeaders });
      if (!userRes.ok) throw new Error('Неверный токен или нет доступа');
      const userData: GitHubUser = await userRes.json();
      setGhUser(userData);

      const reposRes = await fetch(
        'https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner',
        { headers: githubHeaders }
      );
      if (!reposRes.ok) throw new Error('Не удалось загрузить репозитории');
      const reposData: GitHubRepo[] = await reposRes.json();
      setRepos(reposData);
      if (reposData.length > 0) setSelectedRepo(reposData[0]);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Ошибка подключения');
    } finally {
      setIsConnecting(false);
    }
  };

  const getFileSha = async (repo: string, path: string): Promise<string | null> => {
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
        headers: githubHeaders,
      });
      if (res.status === 404) return null;
      const data = await res.json();
      return data.sha ?? null;
    } catch {
      return null;
    }
  };

  const commitFile = async (
    repo: string,
    path: string,
    content: string,
    sha: string | null
  ) => {
    const encoded = btoa(unescape(encodeURIComponent(content)));
    const body: Record<string, string> = {
      message: `sync: update ${path}`,
      content: encoded,
    };
    if (sha) body.sha = sha;

    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: githubHeaders,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || `Ошибка записи ${path}`);
    }
  };

  const handleSync = async () => {
    if (!token || !selectedRepo) {
      setSyncError('Сначала подключитесь к GitHub');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');
    setSyncError(null);
    setSyncLog([]);

    try {
      const repo = selectedRepo.full_name;
      const log: string[] = [];

      for (const workspace of workspaces) {
        const safeName = workspace.name
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        const path = `data/${safeName}/data.json`;

        const workspaceData = {
          workspace,
          folders: folders.filter((f) => f.workspaceId === workspace.id),
          notes: notes.filter((n) => n.workspaceId === workspace.id),
          noteContents: noteContents.filter((nc) => nc.workspaceId === workspace.id),
          cards: cards.filter((c) => c.workspaceId === workspace.id),
          links: links.filter((l) => l.workspaceId === workspace.id),
          tools: tools.filter((t) => t.workspaceId === workspace.id),
          syncedAt: new Date().toISOString(),
        };

        const sha = await getFileSha(repo, path);
        await commitFile(repo, path, JSON.stringify(workspaceData, null, 2), sha);
        log.push(`✓ ${workspace.name} → ${path}`);
        setSyncLog([...log]);
      }

      setLastSyncAt(new Date().toISOString());
      clearPendingChanges();
      setSyncStatus('synced');
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Ошибка синхронизации');
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const statusConfig = {
    synced: { icon: Check, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Синхронизировано' },
    pending: { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: `${sync.pendingChanges} изменений ожидают` },
    syncing: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Синхронизация...' },
    error: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Ошибка синхронизации' },
  };

  const currentStatus =
    pendingChanges.length > 0 && sync.status !== 'syncing' ? 'pending' : sync.status;
  const { icon: StatusIcon, color, bg, label } = statusConfig[currentStatus];

  return (
    <Modal isOpen={ui.showSync} onClose={toggleSync} title="Синхронизация с GitHub" size="md">
      <div className="space-y-5">
        {/* Status bar */}
        <div className={cn('flex items-center gap-3 rounded-lg p-3', bg)}>
          <StatusIcon className={cn('h-4 w-4 shrink-0', color, sync.status === 'syncing' && 'animate-spin')} />
          <div className="min-w-0">
            <p className={cn('text-sm font-medium', color)}>{label}</p>
            {sync.lastSyncAt && (
              <p className="text-xs text-gray-400">
                Последняя: {new Date(sync.lastSyncAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Token input + Connect */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-400">
            GitHub Personal Access Token
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-indigo-500"
            />
            <Button
              onClick={handleConnect}
              disabled={!token.trim() || isConnecting}
              className="shrink-0"
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Connect'
              )}
            </Button>
          </div>
        </div>

        {/* Connected: user + repo selector */}
        {ghUser && (
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={ghUser.avatar_url}
                alt={ghUser.login}
                className="h-8 w-8 rounded-full"
              />
              <div>
                <p className="text-sm font-medium text-gray-200">
                  {ghUser.name || ghUser.login}
                </p>
                <p className="text-xs text-gray-400">@{ghUser.login}</p>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">
                Репозиторий
              </label>
              <select
                value={selectedRepo?.full_name ?? ''}
                onChange={(e) =>
                  setSelectedRepo(repos.find((r) => r.full_name === e.target.value) ?? null)
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 outline-none focus:border-indigo-500"
              >
                {repos.map((r) => (
                  <option key={r.id} value={r.full_name}>
                    {r.full_name} {r.private ? '🔒' : ''}
                  </option>
                ))}
              </select>
              {selectedRepo && (
                <p className="mt-1 text-xs text-gray-500">
                  Данные будут записаны в{' '}
                  <code className="text-gray-400">
                    {'data/{workspace-name}/data.json'}
                  </code>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Sync log */}
        {syncLog.length > 0 && (
          <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3 space-y-1">
            {syncLog.map((line, i) => (
              <p key={i} className="text-xs text-green-400 font-mono">
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Error */}
        {sync.error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-400/10 p-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {sync.error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={toggleSync}>
            Отмена
          </Button>
          <Button
            onClick={handleSync}
            disabled={!ghUser || !selectedRepo || isSyncing}
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Синхронизация...
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
            <Github className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div className="text-xs text-gray-400">
              <p className="font-medium text-gray-300">Как получить GitHub Token:</p>
              <ol className="mt-1 list-inside list-decimal space-y-0.5">
                <li>GitHub Settings → Developer settings</li>
                <li>Personal access tokens → Tokens (classic)</li>
                <li>Generate new token с правами "repo"</li>
              </ol>
              <p className="mt-2 text-gray-500">
                После коммита GitHub Actions пересберёт сайт автоматически (если настроен workflow).
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
