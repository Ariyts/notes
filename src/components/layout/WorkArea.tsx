import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy,
  Pencil,
  Trash2,
  ExternalLink,
  FileText,
  MessageSquare,
  Link as LinkIcon,
  Terminal,
  Check,
  X,
  Save,
  Plus,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { WorkspaceType, Note, Card, Link, Tool } from '@/types';

const typeIcons: Record<WorkspaceType, React.ElementType> = {
  folder: FileText,
  card: MessageSquare,
  link: LinkIcon,
  command: Terminal,
};

// ==================== Copy Toast Hook ====================
function useCopyToast() {
  const [showCopied, setShowCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return { showCopied, copyToClipboard };
}

// ==================== Markdown Renderer ====================
function MarkdownRenderer({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn('prose prose-invert prose-sm max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold text-white mb-3 mt-6">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold text-white mb-2 mt-4">{children}</h3>,
          p: ({ children }) => <p className="text-gray-300 mb-3 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside text-gray-300 mb-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside text-gray-300 mb-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-gray-300">{children}</li>,
          code: ({ className, children }) => {
            const isInline = !className;
            if (isInline) {
              return <code className="bg-gray-800 px-1.5 py-0.5 rounded text-indigo-400 text-sm">{children}</code>;
            }
            return (
              <code className="block bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-300 mb-3">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto mb-3">{children}</pre>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-gray-400 mb-3">{children}</blockquote>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="min-w-full border border-gray-700">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border border-gray-700 px-3 py-2 bg-gray-800 text-left text-white">{children}</th>,
          td: ({ children }) => <td className="border border-gray-700 px-3 py-2 text-gray-300">{children}</td>,
          hr: () => <hr className="border-gray-700 my-6" />,
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// ==================== Note Editor (for folder type) ====================
function NoteEditor({ note, color }: { note: Note; color: string }) {
  const { getNoteContent, updateNoteContent, updateNote, ui, setEditingNote } = useStore();
  
  const noteContent = getNoteContent(note.id);
  const isEditing = ui.editingNoteId === note.id;
  
  const [localContent, setLocalContent] = useState(noteContent?.content || '');
  const [localTitle, setLocalTitle] = useState(note.title);
  const [localTags, setLocalTags] = useState(noteContent?.tags?.join(', ') || '');

  useEffect(() => {
    setLocalContent(noteContent?.content || '');
    setLocalTitle(note.title);
    setLocalTags(noteContent?.tags?.join(', ') || '');
  }, [note, noteContent]);

  const handleSave = () => {
    updateNote(note.id, { title: localTitle });
    updateNoteContent(note.id, localContent, localTags.split(',').map(t => t.trim()).filter(Boolean));
    setEditingNote(null);
  };

  const handleCancel = () => {
    setLocalContent(noteContent?.content || '');
    setLocalTitle(note.title);
    setLocalTags(noteContent?.tags?.join(', ') || '');
    setEditingNote(null);
  };

  if (isEditing) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
          <input
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            className="text-lg font-semibold bg-transparent text-white focus:outline-none flex-1"
            placeholder="Title..."
          />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
        <div className="px-4 py-2 border-b border-gray-700">
          <input
            type="text"
            value={localTags}
            onChange={(e) => setLocalTags(e.target.value)}
            className="w-full text-sm bg-transparent text-gray-400 focus:outline-none placeholder-gray-600"
            placeholder="Tags (comma-separated)..."
          />
        </div>
        <textarea
          value={localContent}
          onChange={(e) => setLocalContent(e.target.value)}
          className="flex-1 w-full bg-transparent text-gray-300 p-4 focus:outline-none resize-none font-mono text-sm"
          placeholder="Write your note in Markdown..."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="text-white font-medium">{note.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditingNote(note.id)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {noteContent?.tags && noteContent.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {noteContent.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2 py-0.5 text-xs"
                style={{ backgroundColor: color + '20', color }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="text-xs text-gray-500 mb-4">
          Updated: {new Date(note.updatedAt).toLocaleString()}
        </div>
        {noteContent?.content ? (
          <MarkdownRenderer content={noteContent.content} />
        ) : (
          <p className="text-gray-500 italic">No content yet. Click edit to add content.</p>
        )}
      </div>
    </div>
  );
}

// ==================== Cards View (for card type workspace) ====================
function CardsView({ note, color }: { note: Note; color: string }) {
  const { getNoteCards, createCard, updateCard, deleteCard, duplicateCard } = useStore();
  const { showCopied, copyToClipboard } = useCopyToast();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newCard, setNewCard] = useState({ name: '', tag: '', content: '' });
  const [editCard, setEditCard] = useState({ name: '', tag: '', content: '' });

  const cards = getNoteCards(note.id);

  const handleCreate = () => {
    if (!newCard.name.trim()) return;
    
    createCard(note.id, note.workspaceId, {
      name: newCard.name.trim(),
      tag: newCard.tag.trim(),
      content: newCard.content,
    });
    
    setNewCard({ name: '', tag: '', content: '' });
    setIsAdding(false);
  };

  const handleUpdate = (id: string) => {
    updateCard(id, {
      name: editCard.name,
      tag: editCard.tag,
      content: editCard.content,
    });
    setEditingId(null);
  };

  const startEdit = (card: Card) => {
    setEditingId(card.id);
    setEditCard({ name: card.name, tag: card.tag, content: card.content });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" style={{ color }} />
          <h2 className="text-lg font-semibold text-white">{note.title}</h2>
          <span className="text-sm text-gray-500">({cards.length} cards)</span>
        </div>
        <Button size="sm" onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4" />
          Add Card
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider w-1/4">Name</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider w-24">Tag</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Content</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {/* Add new row */}
            {isAdding && (
              <tr className="bg-gray-800/50">
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={newCard.name}
                    onChange={(e) => setNewCard(p => ({ ...p, name: e.target.value }))}
                    placeholder="Card name..."
                    className="w-full bg-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    autoFocus
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={newCard.tag}
                    onChange={(e) => setNewCard(p => ({ ...p, tag: e.target.value }))}
                    placeholder="#tag"
                    className="w-full bg-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={newCard.content}
                    onChange={(e) => setNewCard(p => ({ ...p, content: e.target.value }))}
                    placeholder="Content..."
                    className="w-full bg-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={handleCreate} className="p-1 rounded text-green-400 hover:bg-gray-700">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => { setIsAdding(false); setNewCard({ name: '', tag: '', content: '' }); }} className="p-1 rounded text-red-400 hover:bg-gray-700">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {cards.map((card) => (
              <tr key={card.id} className={cn('hover:bg-gray-800/50 transition-colors', expandedId === card.id && 'bg-gray-800/30')}>
                {editingId === card.id ? (
                  <>
                    <td className="px-4 py-2">
                      <input type="text" value={editCard.name} onChange={(e) => setEditCard(p => ({ ...p, name: e.target.value }))} className="w-full bg-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="text" value={editCard.tag} onChange={(e) => setEditCard(p => ({ ...p, tag: e.target.value }))} className="w-full bg-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="text" value={editCard.content} onChange={(e) => setEditCard(p => ({ ...p, content: e.target.value }))} className="w-full bg-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none" />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleUpdate(card.id)} className="p-1 rounded text-green-400 hover:bg-gray-700"><Check className="h-4 w-4" /></button>
                        <button onClick={() => setEditingId(null)} className="p-1 rounded text-red-400 hover:bg-gray-700"><X className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2">
                      <button onClick={() => setExpandedId(expandedId === card.id ? null : card.id)} className="flex items-center gap-1 text-white font-medium text-sm hover:text-indigo-400">
                        {expandedId === card.id ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        {card.name}
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      {card.tag && <span className="inline-flex px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: color + '20', color }}>#{card.tag}</span>}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm truncate max-w-xs">{card.content.slice(0, 50)}{card.content.length > 50 && '...'}</span>
                        <button onClick={() => copyToClipboard(card.content)} className="p-1 rounded text-gray-500 hover:text-white hover:bg-gray-700" title="Copy">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(card)} className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-700"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => duplicateCard(card.id)} className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-700"><Copy className="h-3.5 w-3.5" /></button>
                        <button onClick={() => deleteCard(card.id)} className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-gray-700"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Expanded content */}
        {expandedId && (() => {
          const card = cards.find(c => c.id === expandedId);
          if (!card) return null;
          return (
            <div className="border-t border-gray-700 bg-gray-900/50 p-4">
              <div className="max-w-3xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{card.name}</h3>
                    {card.tag && <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: color + '20', color }}>#{card.tag}</span>}
                  </div>
                  <Button size="sm" onClick={() => copyToClipboard(card.content)}>
                    <Copy className="h-4 w-4" />Copy
                  </Button>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm">{card.content || 'No content'}</pre>
                </div>
              </div>
            </div>
          );
        })()}

        {cards.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="h-12 w-12 text-gray-700 mb-4" />
            <p className="text-gray-500">No cards yet</p>
            <p className="text-gray-600 text-sm mt-1">Click "Add Card" to create your first card</p>
          </div>
        )}
      </div>

      {showCopied && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-white shadow-xl z-50 toast-animate">
          <Check className="h-4 w-4" /><span className="font-medium">Copied!</span>
        </div>
      )}
    </div>
  );
}

// ==================== Links View (for link type workspace) ====================
function LinksView({ note, color }: { note: Note; color: string }) {
  const { getNoteLinks, createLink, updateLink, deleteLink } = useStore();
  const { showCopied, copyToClipboard } = useCopyToast();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({ name: '', url: '', description: '' });
  const [editLink, setEditLink] = useState({ name: '', url: '', description: '' });

  const links = getNoteLinks(note.id);

  const handleCreate = () => {
    if (!newLink.name.trim() || !newLink.url.trim()) return;
    createLink(note.id, note.workspaceId, {
      name: newLink.name.trim(),
      url: newLink.url.trim(),
      description: newLink.description.trim(),
    });
    setNewLink({ name: '', url: '', description: '' });
    setIsAdding(false);
  };

  const handleUpdate = (id: string) => {
    updateLink(id, { name: editLink.name, url: editLink.url, description: editLink.description });
    setEditingId(null);
  };

  const startEdit = (link: Link) => {
    setEditingId(link.id);
    setEditLink({ name: link.name, url: link.url, description: link.description || '' });
  };

  const getDomain = (url: string) => {
    try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" style={{ color }} />
          <h2 className="text-lg font-semibold text-white">{note.title}</h2>
          <span className="text-sm text-gray-500">({links.length} links)</span>
        </div>
        <Button size="sm" onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4" />Add Link
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-2">
        {isAdding && (
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 space-y-2">
            <input type="text" value={newLink.name} onChange={(e) => setNewLink(p => ({ ...p, name: e.target.value }))} placeholder="Link title..." className="w-full bg-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none" autoFocus />
            <input type="url" value={newLink.url} onChange={(e) => setNewLink(p => ({ ...p, url: e.target.value }))} placeholder="https://..." className="w-full bg-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none" />
            <input type="text" value={newLink.description} onChange={(e) => setNewLink(p => ({ ...p, description: e.target.value }))} placeholder="Description..." className="w-full bg-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none" />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setIsAdding(false); setNewLink({ name: '', url: '', description: '' }); }}>Cancel</Button>
              <Button size="sm" onClick={handleCreate}><Check className="h-4 w-4" />Add</Button>
            </div>
          </div>
        )}

        {links.map((link) => (
          <div key={link.id} className="group rounded-lg border border-gray-800 bg-gray-900/50 p-3 hover:border-gray-700 transition-colors">
            {editingId === link.id ? (
              <div className="space-y-2">
                <input type="text" value={editLink.name} onChange={(e) => setEditLink(p => ({ ...p, name: e.target.value }))} className="w-full bg-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none" />
                <input type="url" value={editLink.url} onChange={(e) => setEditLink(p => ({ ...p, url: e.target.value }))} className="w-full bg-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none" />
                <input type="text" value={editLink.description} onChange={(e) => setEditLink(p => ({ ...p, description: e.target.value }))} className="w-full bg-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none" />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                  <Button size="sm" onClick={() => handleUpdate(link.id)}>Save</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌐</span>
                    <h3 className="font-medium text-white truncate">{link.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5">{getDomain(link.url)} • {link.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700"><ExternalLink className="h-4 w-4" /></a>
                  <button onClick={() => copyToClipboard(link.url)} className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700"><Copy className="h-4 w-4" /></button>
                  <button onClick={() => startEdit(link)} className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => deleteLink(link.id)} className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-gray-700"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            )}
          </div>
        ))}

        {links.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <LinkIcon className="h-12 w-12 text-gray-700 mb-4" />
            <p className="text-gray-500">No links yet</p>
          </div>
        )}
      </div>

      {showCopied && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-white shadow-xl z-50 toast-animate">
          <Check className="h-4 w-4" /><span className="font-medium">Copied!</span>
        </div>
      )}
    </div>
  );
}

// ==================== Commands View (for command type workspace) ====================
function CommandsView({ note, color }: { note: Note; color: string }) {
  const { getNoteTools, createTool, updateTool, deleteTool, addCommandToTool, deleteCommandFromTool } = useStore();
  const { showCopied, copyToClipboard } = useCopyToast();

  const [isAddingTool, setIsAddingTool] = useState(false);
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());
  const [addingCommandTo, setAddingCommandTo] = useState<string | null>(null);
  const [editingToolId, setEditingToolId] = useState<string | null>(null);
  
  const [newTool, setNewTool] = useState({ toolName: '', toolDescription: '' });
  const [editTool, setEditTool] = useState({ toolName: '', toolDescription: '' });
  const [newCommand, setNewCommand] = useState({ description: '', command: '' });

  const tools = getNoteTools(note.id);

  const toggleExpanded = (id: string) => {
    const newSet = new Set(expandedTools);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setExpandedTools(newSet);
  };

  const handleCreateTool = () => {
    if (!newTool.toolName.trim()) return;
    createTool(note.id, note.workspaceId, {
      toolName: newTool.toolName.trim(),
      toolDescription: newTool.toolDescription.trim(),
      commands: [],
    });
    setNewTool({ toolName: '', toolDescription: '' });
    setIsAddingTool(false);
  };

  const handleUpdateTool = (id: string) => {
    updateTool(id, { toolName: editTool.toolName, toolDescription: editTool.toolDescription });
    setEditingToolId(null);
  };

  const startEditTool = (tool: Tool) => {
    setEditingToolId(tool.id);
    setEditTool({ toolName: tool.toolName, toolDescription: tool.toolDescription || '' });
  };

  const handleAddCommand = (toolId: string) => {
    if (!newCommand.command.trim()) return;
    addCommandToTool(toolId, { description: newCommand.description.trim(), command: newCommand.command.trim() });
    setNewCommand({ description: '', command: '' });
    setAddingCommandTo(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5" style={{ color }} />
          <h2 className="text-lg font-semibold text-white">{note.title}</h2>
          <span className="text-sm text-gray-500">({tools.length} tools)</span>
        </div>
        <Button size="sm" onClick={() => setIsAddingTool(true)}>
          <Plus className="h-4 w-4" />Add Tool
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {isAddingTool && (
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4 space-y-3">
            <input type="text" value={newTool.toolName} onChange={(e) => setNewTool(p => ({ ...p, toolName: e.target.value }))} placeholder="Tool name (e.g., nmap)..." className="w-full bg-gray-700 rounded px-3 py-2 text-white focus:outline-none" autoFocus />
            <input type="text" value={newTool.toolDescription} onChange={(e) => setNewTool(p => ({ ...p, toolDescription: e.target.value }))} placeholder="Description..." className="w-full bg-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none" />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setIsAddingTool(false); setNewTool({ toolName: '', toolDescription: '' }); }}>Cancel</Button>
              <Button size="sm" onClick={handleCreateTool}><Check className="h-4 w-4" />Create</Button>
            </div>
          </div>
        )}

        {tools.map((tool) => (
          <div key={tool.id} className="rounded-lg border border-gray-800 bg-gray-900/50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900">
              {editingToolId === tool.id ? (
                <div className="flex-1 space-y-2">
                  <input type="text" value={editTool.toolName} onChange={(e) => setEditTool(p => ({ ...p, toolName: e.target.value }))} className="w-full bg-gray-700 rounded px-3 py-2 text-white focus:outline-none" />
                  <input type="text" value={editTool.toolDescription} onChange={(e) => setEditTool(p => ({ ...p, toolDescription: e.target.value }))} className="w-full bg-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none" />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingToolId(null)}>Cancel</Button>
                    <Button size="sm" onClick={() => handleUpdateTool(tool.id)}>Save</Button>
                  </div>
                </div>
              ) : (
                <>
                  <button onClick={() => toggleExpanded(tool.id)} className="flex items-center gap-2 text-left flex-1">
                    {expandedTools.has(tool.id) ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                    <span className="text-lg">🔧</span>
                    <div>
                      <h3 className="font-semibold text-white">{tool.toolName}</h3>
                      <p className="text-sm text-gray-500">{tool.toolDescription || 'No description'}</p>
                    </div>
                    <span className="ml-2 text-xs text-gray-600">({tool.commands.length} commands)</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setAddingCommandTo(addingCommandTo === tool.id ? null : tool.id)} className="flex items-center gap-1 px-2 py-1 rounded text-sm text-gray-400 hover:text-white hover:bg-gray-700">
                      <Plus className="h-3.5 w-3.5" />Command
                    </button>
                    <button onClick={() => startEditTool(tool)} className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => deleteTool(tool.id)} className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-gray-700"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </>
              )}
            </div>

            {(expandedTools.has(tool.id) || addingCommandTo === tool.id) && (
              <div className="p-4 space-y-3">
                {addingCommandTo === tool.id && (
                  <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 space-y-2">
                    <input type="text" value={newCommand.description} onChange={(e) => setNewCommand(p => ({ ...p, description: e.target.value }))} placeholder="Command description..." className="w-full bg-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none" autoFocus />
                    <div className="flex items-center gap-2 bg-[#1e1e1e] rounded-lg px-3 py-2">
                      <span className="text-green-400 font-mono">$</span>
                      <input type="text" value={newCommand.command} onChange={(e) => setNewCommand(p => ({ ...p, command: e.target.value }))} placeholder="Enter command..." className="flex-1 bg-transparent text-gray-300 font-mono text-sm focus:outline-none" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setAddingCommandTo(null); setNewCommand({ description: '', command: '' }); }}>Cancel</Button>
                      <Button size="sm" onClick={() => handleAddCommand(tool.id)}><Check className="h-4 w-4" />Add</Button>
                    </div>
                  </div>
                )}

                {tool.commands.map((cmd) => (
                  <div key={cmd.id} className="group">
                    {cmd.description && <p className="text-sm text-gray-400 mb-1">{cmd.description}</p>}
                    <div className="flex items-center justify-between bg-[#1e1e1e] rounded-lg px-4 py-3">
                      <code className="text-gray-300 font-mono text-sm flex-1">
                        <span className="text-green-400">$</span> {cmd.command}
                      </code>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => copyToClipboard(cmd.command)} className="px-3 py-1 rounded text-sm bg-gray-700 text-white hover:bg-green-600 transition-colors">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => deleteCommandFromTool(tool.id, cmd.id)} className="px-2 py-1 rounded text-gray-400 hover:text-red-400 hover:bg-gray-800">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {tool.commands.length === 0 && addingCommandTo !== tool.id && (
                  <p className="text-sm text-gray-600 text-center py-4">No commands yet. Click "+ Command" to add.</p>
                )}
              </div>
            )}
          </div>
        ))}

        {tools.length === 0 && !isAddingTool && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Terminal className="h-12 w-12 text-gray-700 mb-4" />
            <p className="text-gray-500">No tools yet</p>
          </div>
        )}
      </div>

      {showCopied && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-white shadow-xl z-50 toast-animate">
          <Check className="h-4 w-4" /><span className="font-medium">Copied!</span>
        </div>
      )}
    </div>
  );
}

// ==================== Main WorkArea Component ====================
export function WorkArea() {
  const { ui, workspaces, notes } = useStore();

  const selectedWorkspace = workspaces.find(w => w.id === ui.selectedWorkspaceId);
  const selectedNote = notes.find(n => n.id === ui.selectedNoteId);

  // No workspace selected
  if (!selectedWorkspace) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-950 p-8 text-center">
        <FileText className="mb-4 h-12 w-12 text-gray-700" />
        <h2 className="text-xl font-semibold text-white">Select a Workspace</h2>
        <p className="mt-2 text-gray-500">Choose a workspace from the sidebar</p>
      </div>
    );
  }

  // No note selected
  if (!selectedNote) {
    const Icon = typeIcons[selectedWorkspace.type];
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-950 p-8 text-center">
        <div className="mb-4 rounded-full p-4" style={{ backgroundColor: selectedWorkspace.color + '20' }}>
          <Icon className="h-8 w-8" style={{ color: selectedWorkspace.color }} />
        </div>
        <h3 className="text-lg font-medium text-white">No note selected</h3>
        <p className="mt-1 text-gray-500">Select a note from the folder panel or create a new one</p>
      </div>
    );
  }

  // Render based on workspace type
  return (
    <div className="flex flex-1 flex-col bg-gray-950">
      {selectedWorkspace.type === 'folder' && <NoteEditor note={selectedNote} color={selectedWorkspace.color} />}
      {selectedWorkspace.type === 'card' && <CardsView note={selectedNote} color={selectedWorkspace.color} />}
      {selectedWorkspace.type === 'link' && <LinksView note={selectedNote} color={selectedWorkspace.color} />}
      {selectedWorkspace.type === 'command' && <CommandsView note={selectedNote} color={selectedWorkspace.color} />}
    </div>
  );
}
