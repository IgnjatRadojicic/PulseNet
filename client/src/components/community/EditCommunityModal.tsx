import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Globe, Lock, ImagePlus, Trash2, Loader2, Save, AlertTriangle } from 'lucide-react';
import { communityApi } from '../../api_services/community/CommunityAPIService';
import { useNavigate } from 'react-router-dom';
import type { CommunityDto } from '../../models/communities/CommunityDto';

interface EditCommunityModalProps {
    isOpen: boolean;
    community: CommunityDto;
    onClose: () => void;
    onUpdated?: (community: CommunityDto) => void;
    onDeleted?: () => void;
}

const MAX_NAME = 80;
const MIN_NAME = 2;
const MAX_DESC = 500;

export default function EditCommunityModal({ isOpen, community, onClose, onUpdated, onDeleted }: EditCommunityModalProps) {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState('');

    const [name, setName] = useState(community.name);
    const [description, setDescription] = useState(community.description ?? '');
    const [type, setType] = useState<'public' | 'private'>(community.type);
    const [avatar, setAvatar] = useState<string | null>(community.avatar);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(community.avatar);

    const [nameError, setNameError] = useState('');
    const [descError, setDescError] = useState('');

    // Delete state
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [rules, setRules] = useState(community.rules ?? '');
    const _rules = rules;
    void _rules;

    useEffect(() => {
        if (isOpen) {
            setName(community.name);
            setDescription(community.description ?? '');
            setType(community.type);
            setAvatar(community.avatar);
            setAvatarPreview(community.avatar);
            setRules(community.rules ?? '');
            setServerError('');
            setNameError('');
            setDescError('');
            setConfirmingDelete(false);
        }
    }, [isOpen, community]);

    function validate(): boolean {
        let valid = true;
        setNameError('');
        setDescError('');

        const trimmed = name.trim();
        if (trimmed.length < MIN_NAME || trimmed.length > MAX_NAME) {
            setNameError(`Name must be ${MIN_NAME}–${MAX_NAME} characters`);
            valid = false;
        }
        if (description.length > MAX_DESC) {
            setDescError(`Description must be under ${MAX_DESC} characters`);
            valid = false;
        }
        return valid;
    }

    const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return;
        if (file.size > 2 * 1024 * 1024) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setAvatar(base64);
            setAvatarPreview(base64);
        };
        reader.readAsDataURL(file);
    }, []);

    function removeAvatar() {
        setAvatar(null);
        setAvatarPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    async function handleSubmit() {
        if (submitting) return;
        if (!validate()) return;

        setSubmitting(true);
        setServerError('');

        try {
            const res = await communityApi.update(community.id, {
                name: name.trim(),
                description: description.trim() || undefined,
                avatar: avatar || undefined,
                type,
            });

            if (res.success && res.data) {
                onUpdated?.(res.data);
                onClose();
            } else {
                setServerError(res.message || 'Failed to update community');
            }
        } catch {
            setServerError('Something went wrong. Try again.');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete() {
        if (deleting) return;
        setDeleting(true);
        setServerError('');

        try {
            const res = await communityApi.remove(community.id);
            if (res.success) {
                onDeleted?.();
                onClose();
                navigate('/feed');
            } else {
                setServerError(res.message || 'Failed to delete community');
                setConfirmingDelete(false);
            }
        } catch {
            setServerError('Something went wrong. Try again.');
            setConfirmingDelete(false);
        } finally {
            setDeleting(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                onClick={onClose}
            />

            <div
                className="relative w-full max-w-[520px] rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto"
                style={{
                    background: 'rgba(14, 14, 22, 0.98)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(108,99,255,0.08)',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <h2 className="text-base font-bold text-white/90" style={{ fontFamily: "'Syne', sans-serif" }}>
                        Community Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <X size={18} strokeWidth={1.5} className="text-white/40" />
                    </button>
                </div>

                <div className="px-6 py-5 flex flex-col gap-5">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                        <div
                            className="relative w-16 h-16 rounded-full overflow-hidden flex items-center justify-center cursor-pointer group shrink-0"
                            style={{
                                background: avatarPreview ? 'transparent' : 'rgba(255,255,255,0.04)',
                                border: '2px dashed rgba(255,255,255,0.12)',
                            }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {avatarPreview ? (
                                <>
                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <ImagePlus size={16} strokeWidth={1.5} className="text-white/70" />
                                    </div>
                                </>
                            ) : (
                                <ImagePlus size={20} strokeWidth={1.5} className="text-white/30" />
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-white/60">Community Avatar</span>
                            {avatarPreview && (
                                <button
                                    onClick={removeAvatar}
                                    className="flex items-center gap-1 text-[11px] text-red-400/70 hover:text-red-400 transition-colors w-fit"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    <Trash2 size={10} strokeWidth={1.5} />
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-xs font-medium text-white/50 mb-1.5">
                            Community name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => { setName(e.target.value); setNameError(''); }}
                            maxLength={MAX_NAME}
                            className="w-full px-3 py-2.5 rounded-lg text-sm text-white/90 placeholder:text-white/20 outline-none transition-all focus:ring-1 focus:ring-pulse"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: nameError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
                            }}
                        />
                        <div className="flex items-center justify-between mt-1">
                            {nameError ? <span className="text-[11px] text-red-400">{nameError}</span> : <span />}
                            <span className="text-[11px] text-white/20">{name.length}/{MAX_NAME}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-medium text-white/50 mb-1.5">Description</label>
                        <textarea
                            value={description}
                            onChange={e => { setDescription(e.target.value); setDescError(''); }}
                            maxLength={MAX_DESC}
                            rows={3}
                            className="w-full px-3 py-2.5 rounded-lg text-sm text-white/90 placeholder:text-white/20 outline-none resize-none transition-all focus:ring-1 focus:ring-pulse"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: descError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
                            }}
                        />
                        <div className="flex items-center justify-between mt-1">
                            {descError ? <span className="text-[11px] text-red-400">{descError}</span> : <span />}
                            <span className="text-[11px] text-white/20">{description.length}/{MAX_DESC}</span>
                        </div>
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-xs font-medium text-white/50 mb-2">Visibility</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setType('public')}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium flex-1 transition-all"
                                style={{
                                    background: type === 'public' ? 'rgba(108,99,255,0.1)' : 'rgba(255,255,255,0.03)',
                                    border: type === 'public' ? '1px solid rgba(108,99,255,0.4)' : '1px solid rgba(255,255,255,0.06)',
                                    color: type === 'public' ? '#fff' : 'rgba(255,255,255,0.5)',
                                    cursor: 'pointer',
                                }}
                            >
                                <Globe size={14} strokeWidth={1.5} />
                                Public
                            </button>
                            <button
                                onClick={() => setType('private')}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium flex-1 transition-all"
                                style={{
                                    background: type === 'private' ? 'rgba(108,99,255,0.1)' : 'rgba(255,255,255,0.03)',
                                    border: type === 'private' ? '1px solid rgba(108,99,255,0.4)' : '1px solid rgba(255,255,255,0.06)',
                                    color: type === 'private' ? '#fff' : 'rgba(255,255,255,0.5)',
                                    cursor: 'pointer',
                                }}
                            >
                                <Lock size={14} strokeWidth={1.5} />
                                Private
                            </button>
                        </div>
                    </div>

                    {/* Rules placeholder */}
                    <div style={{ opacity: 0.4, pointerEvents: 'none' }}>
                        <label className="block text-xs font-medium text-white/50 mb-1.5">
                            Rules <span className="text-white/20">(coming soon)</span>
                        </label>
                        <textarea
                            value=""
                            readOnly
                            placeholder="Community rules will be configurable here..."
                            rows={2}
                            className="w-full px-3 py-2.5 rounded-lg text-sm text-white/90 placeholder:text-white/20 outline-none resize-none"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}
                        />
                    </div>

                    {/* Danger zone */}
                    <div
                        className="rounded-lg p-4"
                        style={{
                            background: 'rgba(239,68,68,0.04)',
                            border: '1px solid rgba(239,68,68,0.12)',
                        }}
                    >
                        <div className="flex items-start gap-3">
                            <AlertTriangle size={15} strokeWidth={1.5} className="text-red-400/70 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-red-400/80 mb-0.5">Delete Community</p>
                                <p className="text-[11px] text-white/35 leading-relaxed">
                                    Permanently deletes this community and all its posts. This cannot be undone.
                                </p>
                            </div>
                        </div>

                        {/* Inline confirmation */}
                        {confirmingDelete ? (
                            <div className="mt-3 flex items-center gap-2">
                                <span className="text-xs text-white/50 flex-1">Are you sure?</span>
                                <button
                                    onClick={() => setConfirmingDelete(false)}
                                    disabled={deleting}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                                    style={{
                                        background: 'rgba(239,68,68,0.8)',
                                        border: 'none',
                                        cursor: deleting ? 'not-allowed' : 'pointer',
                                        opacity: deleting ? 0.6 : 1,
                                    }}
                                >
                                    {deleting ? (
                                        <Loader2 size={12} strokeWidth={2} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={12} strokeWidth={1.5} />
                                    )}
                                    {deleting ? 'Deleting…' : 'Yes, delete it'}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setConfirmingDelete(true)}
                                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                style={{
                                    background: 'rgba(239,68,68,0.08)',
                                    border: '1px solid rgba(239,68,68,0.15)',
                                    color: 'rgba(239,68,68,0.7)',
                                    cursor: 'pointer',
                                }}
                            >
                                <Trash2 size={12} strokeWidth={1.5} />
                                Delete Community
                            </button>
                        )}
                    </div>

                    {/* Server error */}
                    {serverError && (
                        <div className="px-3 py-2 rounded-lg text-xs text-red-400" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                            {serverError}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || name.trim().length < MIN_NAME}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all"
                        style={{
                            background: submitting ? 'rgba(108,99,255,0.3)' : 'var(--color-pulse, #6c63ff)',
                            border: 'none',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            opacity: submitting || name.trim().length < MIN_NAME ? 0.5 : 1,
                        }}
                    >
                        {submitting ? (
                            <><Loader2 size={14} strokeWidth={2} className="animate-spin" /> Saving…</>
                        ) : (
                            <><Save size={14} strokeWidth={2} /> Save Changes</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}