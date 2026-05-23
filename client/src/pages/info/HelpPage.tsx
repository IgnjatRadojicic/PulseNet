import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';

interface FaqItem {
    question: string;
    answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
    {
        question: 'How do I create an account?',
        answer: 'Click the Sign Up button in the top right corner. Fill in your username, email, name, and password. You can also add a short bio and profile picture.',
    },
    {
        question: 'What are communities?',
        answer: 'Communities are topic-based groups where users share posts and discuss. You can join public communities freely or request access to private ones. Each community has moderators who manage content and members.',
    },
    {
        question: 'How do I create a post?',
        answer: 'Join a community first, then use the Create Post button. Posts require a title and content. You can also add tags and media.',
    },
    {
        question: 'What is the difference between public and private communities?',
        answer: 'Public communities are visible to everyone and anyone can join. Private communities require a join request that must be approved by a moderator.',
    },
    {
        question: 'How does the feed work?',
        answer: 'Your personalized feed shows posts from communities you have joined and users you follow, sorted by newest first. If you are not logged in, you see popular public posts instead.',
    },
    {
        question: 'How do I follow other users?',
        answer: 'Visit a user profile and click the Follow button. Their posts will then appear in your feed alongside community posts.',
    },
    {
        question: 'What can moderators do?',
        answer: 'Moderators manage their community. They can accept or reject join requests for private communities, remove members, delete posts and comments that break rules, and flag inappropriate content.',
    },
    {
        question: 'What can admins do?',
        answer: 'Admins have platform-wide access. They can manage all users and communities, view the audit log, monitor database health, and manage global tags.',
    },
];

function FaqBlock({ item }: { item: FaqItem }) {
    const [open, setOpen] = useState(false);

    return (
        <div
            className="rounded-lg overflow-hidden"
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
                <span className="text-sm font-medium text-white/80 pr-4">{item.question}</span>
                {open
                    ? <ChevronUp size={16} strokeWidth={1.5} className="text-white/30 shrink-0" />
                    : <ChevronDown size={16} strokeWidth={1.5} className="text-white/30 shrink-0" />
                }
            </button>
            {open && (
                <div className="px-5 pb-4">
                    <p className="text-sm text-white/50 leading-relaxed">{item.answer}</p>
                </div>
            )}
        </div>
    );
}

export default function HelpPage() {
    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                <h1
                    className="text-2xl font-bold text-white/90"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                >
                    Help
                </h1>

                <p className="text-sm text-white/50">
                    Common questions about using PulseNet.
                </p>

                <div className="flex flex-col gap-2">
                    {FAQ_ITEMS.map((item, i) => (
                        <FaqBlock key={i} item={item} />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
