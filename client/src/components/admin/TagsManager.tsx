import { useState, useEffect, useRef } from 'react';
import { AdminAPIService } from '../../api_services/admin/AdminAPIService';
import type { TagDto } from '../../models/tags/TagsDto';

interface Props {
    token: string | null;
}

interface TagCardProps {
    tag: TagDto;
    onDelete: (id: number) => Promise<void>;
    onUpdate: (id: number, name: string) => Promise<void>;
    isDeleting: boolean;
}

function TagCard({ tag, onDelete, onUpdate, isDeleting }: TagCardProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(tag.name);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        }
    };

    const handleSave = async () => {
        if (editName.trim() && editName.trim() !== tag.name) {
            await onUpdate(tag.id, editName.trim());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
            setEditName(tag.name);
            setIsEditing(false);
        }
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="relative rounded-xl p-4 transition-all duration-300 overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #0a0a14 0%, #08080e 100%)',
                border: '1px solid rgba(108, 99, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
        >
            {isHovering && (
                <div
                    className="absolute pointer-events-none transition-opacity duration-150"
                    style={{
                        left: mousePosition.x - 200,
                        top: mousePosition.y - 200,
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(108, 99, 255, 0.25) 0%, transparent 70%)',
                        opacity: 0.8,
                    }}
                />
            )}

            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-pulse text-xl">#</span>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleSave}
                            autoFocus
                            className="bg-surface-base border border-border-subtle rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-pulse"
                        />
                    ) : (
                        <>
                            <span className="text-white font-medium">{tag.name}</span>
                            <span className="text-xs text-muted-ghost">ID: {tag.id}</span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-xs text-pulse hover:text-pulse-80 transition-colors px-3 py-1 rounded-md hover:bg-pulse/10"
                        >
                            Edit
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(tag.id)}
                        disabled={isDeleting}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-40 px-3 py-1 rounded-md hover:bg-red-400/10"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function TagsManager({ token }: Props) {
    const [tags, setTags] = useState<TagDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTagName, setNewTagName] = useState('');
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);

    useEffect(() => {
        let ignore = false;

        const fetch = async () => {
            try {
                const res = await AdminAPIService.getAllTags();
                if (!ignore && res.success && res.data) {
                    setTags(Array.isArray(res.data) ? res.data : []);
                }
            } catch {
                if (!ignore) setTags([]);
            }
            if (!ignore) setLoading(false);
        };

        fetch();
        return () => { ignore = true; };
    }, []);

    const createTag = async () => {
        if (!token || !newTagName.trim()) return;
        setCreating(true);
        try {
            const res = await AdminAPIService.createTag(token, newTagName.trim());
            if (res.success && res.data) {
                setTags(prev => [...prev, res.data!]);
                setNewTagName('');
            } else {
                alert(res.message || 'Failed to create tag');
            }
        } catch {
            alert('Failed to create tag');
        }
        setCreating(false);
    };

    const handleCreateKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') createTag();
    };

    const updateTag = async (id: number, name: string) => {
        if (!token) return;
        try {
            const res = await AdminAPIService.updateTag(token, id, name);
            if (res.success) {
                setTags(prev => prev.map(t => t.id === id ? { ...t, name } : t));
            } else {
                alert(res.message || 'Failed to update tag');
            }
        } catch {
            alert('Failed to update tag');
        }
    };

    const deleteTag = async (id: number) => {
        if (!token || !confirm('Delete this tag?')) return;
        setDeleting(id);
        try {
            const res = await AdminAPIService.deleteTag(token, id);
            if (res.success) {
                setTags(prev => prev.filter(t => t.id !== id));
            } else {
                alert(res.message || 'Failed to delete tag');
            }
        } catch {
            alert('Failed to delete tag');
        }
        setDeleting(null);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-syne text-xl font-bold text-white">Tags</h2>
                <p className="text-xs text-muted-ghost">Total: {tags.length}</p>
            </div>

            <div className="mb-6 p-4 rounded-xl" style={{
                background: 'linear-gradient(135deg, #0a0a14 0%, #08080e 100%)',
                border: '1px solid rgba(108, 99, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}>
                <h3 className="text-sm font-medium text-white mb-3">Create New Tag</h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newTagName}
                        onChange={e => setNewTagName(e.target.value)}
                        onKeyDown={handleCreateKeyDown}
                        placeholder="Tag name..."
                        className="flex-1 bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-muted focus:outline-none focus:border-pulse"
                    />
                    <button
                        onClick={createTag}
                        disabled={creating || !newTagName.trim()}
                        className="px-4 py-2 bg-pulse text-white text-sm rounded-lg hover:bg-pulse-80 disabled:opacity-40 transition-colors"
                    >
                        {creating ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-surface-hover rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {tags.length > 0 ? (
                        tags.map(tag => (
                            <TagCard
                                key={tag.id}
                                tag={tag}
                                onDelete={deleteTag}
                                onUpdate={updateTag}
                                isDeleting={deleting === tag.id}
                            />
                        ))
                    ) : (
                        <div className="text-center text-muted-ghost py-8">
                            No tags found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}