import { useState, useRef, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Globe, Lock, ImagePlus, Trash2, Loader2, Check } from 'lucide-react';
import { communityApi } from '../../api_services/community/CommunityAPIService';
import { useNavigate } from 'react-router-dom';

interface CreateCommunityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: (community: { id: number; name: string }) => void;
}

const STEPS = ['Basics', 'Privacy', 'Avatar'] as const;

const MAX_NAME = 80;
const MIN_NAME = 2;
const MAX_DESC = 500;

export default function CreateCommunityModal({ isOpen, onClose, onCreated }: CreateCommunityModalProps) {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState('');

    // Step 1
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [nameError, setNameError] = useState('');
    const [descError, setDescError] = useState('');

    // Step 2
    const [type, setType] = useState<'public' | 'private'>('public');

    // Step 3
    const [avatar, setAvatar] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    function reset() {
        setStep(0);
        setName('');
        setDescription('');
        setType('public');
        setAvatar(null);
        setAvatarPreview(null);
        setNameError('');
        setDescError('');
        setServerError('');
        setSubmitting(false);
    }

    function handleClose() {
        reset();
        onClose();
    }

    function validateStep1(): boolean {
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

    function goNext() {
        if (step === 0 && !validateStep1()) return;
        setStep(s => Math.min(s + 1, STEPS.length - 1));
    }

    function goBack() {
        setStep(s => Math.max(s - 1, 0));
    }

    const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) return;
        if (file.size > 2 * 1024 * 1024) return; // 2MB limit

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
        setSubmitting(true);
        setServerError('');

        try {
            const res = await communityApi.create({
                name: name.trim(),
                description: description.trim() || undefined,
                avatar: avatar || undefined,
                type,
            });

            if (res.success && res.data) {
                onCreated?.({ id: res.data.id, name: res.data.name });
                handleClose();
                navigate(`/communities/${res.data.id}`);
            } else {
                setServerError(res.message || 'Failed to create community');
            }
        } catch {
            setServerError('Something went wrong. Try again.');
        } finally {
            setSubmitting(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                onClick={handleClose}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-[480px] rounded-xl overflow-hidden"
                style={{
                    background: 'rgba(14, 14, 22, 0.98)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(108,99,255,0.08)',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <h2 className="text-base font-bold text-white/90" style={{ fontFamily: "'Syne', sans-serif" }}>
                        Create Community
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <X size={18} strokeWidth={1.5} className="text-white/40" />
                    </button>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 px-6 pt-4 pb-2">
                    {STEPS.map((label, i) => (
                        <div key={label} className="flex items-center gap-2 flex-1">
                            <div className="flex items-center gap-2 flex-1">
                                <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all duration-300"
                                    style={{
                                        background: i < step
                                            ? 'var(--color-pulse, #6c63ff)'
                                            : i === step
                                                ? 'rgba(108,99,255,0.2)'
                                                : 'rgba(255,255,255,0.06)',
                                        color: i <= step ? '#fff' : 'rgba(255,255,255,0.3)',
                                        border: i === step ? '1px solid rgba(108,99,255,0.5)' : '1px solid transparent',
                                    }}
                                >
                                    {i < step ? <Check size={12} strokeWidth={2.5} /> : i + 1}
                                </div>
                                <span
                                    className="text-xs font-medium truncate transition-colors duration-300"
                                    style={{ color: i <= step ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)' }}
                                >
                                    {label}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div
                                    className="h-px flex-1 mx-1 transition-colors duration-300"
                                    style={{ background: i < step ? 'rgba(108,99,255,0.4)' : 'rgba(255,255,255,0.06)' }}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Body */}
                <div className="px-6 py-5 min-h-[220px]">
                    {/* Step 1: Name & Description */}
                    {step === 0 && (
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-medium text-white/50 mb-1.5">
                                    Community name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => { setName(e.target.value); setNameError(''); }}
                                    placeholder="e.g. GameDev, Photography, CookingClub"
                                    maxLength={MAX_NAME}
                                    className="w-full px-3 py-2.5 rounded-lg text-sm text-white/90 placeholder:text-white/20 outline-none transition-all focus:ring-1 focus:ring-pulse"
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: nameError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
                                    }}
                                />
                                <div className="flex items-center justify-between mt-1">
                                    {nameError
                                        ? <span className="text-[11px] text-red-400">{nameError}</span>
                                        : <span />
                                    }
                                    <span className="text-[11px] text-white/20">{name.length}/{MAX_NAME}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-white/50 mb-1.5">
                                    Description <span className="text-white/20">(optional)</span>
                                </label>
                                <textarea
                                    value={description}
                                    onChange={e => { setDescription(e.target.value); setDescError(''); }}
                                    placeholder="What is your community about?"
                                    maxLength={MAX_DESC}
                                    rows={3}
                                    className="w-full px-3 py-2.5 rounded-lg text-sm text-white/90 placeholder:text-white/20 outline-none resize-none transition-all focus:ring-1 focus:ring-pulse"
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: descError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
                                    }}
                                />
                                <div className="flex items-center justify-between mt-1">
                                    {descError
                                        ? <span className="text-[11px] text-red-400">{descError}</span>
                                        : <span />
                                    }
                                    <span className="text-[11px] text-white/20">{description.length}/{MAX_DESC}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Privacy */}
                    {step === 1 && (
                        <div className="flex flex-col gap-3">
                            <p className="text-sm text-white/50 mb-2">
                                Choose who can see and join your community.
                            </p>

                            <button
                                onClick={() => setType('public')}
                                className="w-full flex items-center gap-4 p-4 rounded-lg text-left transition-all"
                                style={{
                                    background: type === 'public' ? 'rgba(108,99,255,0.08)' : 'rgba(255,255,255,0.03)',
                                    border: type === 'public'
                                        ? '1px solid rgba(108,99,255,0.4)'
                                        : '1px solid rgba(255,255,255,0.06)',
                                    cursor: 'pointer',
                                }}
                            >
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                    style={{
                                        background: type === 'public' ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.06)',
                                    }}
                                >
                                    <Globe size={18} strokeWidth={1.5} style={{ color: type === 'public' ? '#6c63ff' : 'rgba(255,255,255,0.4)' }} />
                                </div>
                                <div>
                                    <span className="block text-sm font-semibold text-white/90">Public</span>
                                    <span className="block text-xs text-white/40 mt-0.5">Anyone can view and join this community</span>
                                </div>
                            </button>

                            <button
                                onClick={() => setType('private')}
                                className="w-full flex items-center gap-4 p-4 rounded-lg text-left transition-all"
                                style={{
                                    background: type === 'private' ? 'rgba(108,99,255,0.08)' : 'rgba(255,255,255,0.03)',
                                    border: type === 'private'
                                        ? '1px solid rgba(108,99,255,0.4)'
                                        : '1px solid rgba(255,255,255,0.06)',
                                    cursor: 'pointer',
                                }}
                            >
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                    style={{
                                        background: type === 'private' ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.06)',
                                    }}
                                >
                                    <Lock size={18} strokeWidth={1.5} style={{ color: type === 'private' ? '#6c63ff' : 'rgba(255,255,255,0.4)' }} />
                                </div>
                                <div>
                                    <span className="block text-sm font-semibold text-white/90">Private</span>
                                    <span className="block text-xs text-white/40 mt-0.5">Only approved members can see content and join</span>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Step 3: Avatar */}
                    {step === 2 && (
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-sm text-white/50 text-center">
                                Add a community avatar. You can always change this later.
                            </p>

                            <div
                                className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center cursor-pointer group"
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
                                            <ImagePlus size={20} strokeWidth={1.5} className="text-white/70" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <ImagePlus size={24} strokeWidth={1.5} className="text-white/30" />
                                        <span className="text-[10px] text-white/25">Upload</span>
                                    </div>
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />

                            {avatarPreview && (
                                <button
                                    onClick={removeAvatar}
                                    className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    <Trash2 size={12} strokeWidth={1.5} />
                                    Remove
                                </button>
                            )}

                            <p className="text-[11px] text-white/20 text-center">
                                JPG, PNG or GIF. Max 2MB.
                            </p>
                        </div>
                    )}

                    {/* Server error */}
                    {serverError && (
                        <div className="mt-4 px-3 py-2 rounded-lg text-xs text-red-400" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                            {serverError}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                    <button
                        onClick={step === 0 ? handleClose : goBack}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        {step === 0 ? (
                            'Cancel'
                        ) : (
                            <>
                                <ChevronLeft size={14} strokeWidth={2} />
                                Back
                            </>
                        )}
                    </button>

                    <button
                        onClick={step === STEPS.length - 1 ? handleSubmit : goNext}
                        disabled={submitting || (step === 0 && name.trim().length < MIN_NAME)}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all"
                        style={{
                            background: submitting || (step === 0 && name.trim().length < MIN_NAME)
                                ? 'rgba(108,99,255,0.3)'
                                : 'var(--color-pulse, #6c63ff)',
                            border: 'none',
                            cursor: submitting || (step === 0 && name.trim().length < MIN_NAME) ? 'not-allowed' : 'pointer',
                            opacity: submitting || (step === 0 && name.trim().length < MIN_NAME) ? 0.5 : 1,
                        }}
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={14} strokeWidth={2} className="animate-spin" />
                                Creating…
                            </>
                        ) : step === STEPS.length - 1 ? (
                            'Create Community'
                        ) : (
                            <>
                                Next
                                <ChevronRight size={14} strokeWidth={2} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}