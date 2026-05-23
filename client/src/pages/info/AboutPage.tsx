import { Code, Database, Globe, Users, Shield, Zap } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';

const COLLABORATORS = [
    {
        name: 'Ignjat Radojicic',
        role: 'Lead / Full Stack',
        contributions: 'Architecture design, Result pattern, BaseRepository, input types, audit log system, feed (public + personalized), Code refactoring, code review, quality control',
    },
    {
        name: 'Pavle Stankovic',
        role: 'Backend / Frontend',
        contributions: 'Comment module (service, repositories, controller), admin panel, landing page',
    },
    {
        name: 'Kristijan Oros',
        role: 'Backend / Frontend',
        contributions: 'Community module (service, repository, controller), community frontend pages',
    },
    {
        name: 'Danijel Musli',
        role: 'Backend / Frontend',
        contributions: 'Post module (repository, service, controller), user profile page',
    },
];

const TECH_STACK = [
    { name: 'React', color: '#61DAFB' },
    { name: 'TypeScript', color: '#3178C6' },
    { name: 'Tailwind CSS', color: '#06B6D4' },
    { name: 'Node.js', color: '#339933' },
    { name: 'Express', color: '#FFFFFF' },
    { name: 'MySQL', color: '#4479A1' },
    { name: 'JWT', color: '#D63AFF' },
    { name: 'bcrypt', color: '#F97316' },
];

const FEATURES = [
    { icon: <Globe size={20} strokeWidth={1.5} />, label: 'Communities', desc: 'Public and private topic-based groups' },
    { icon: <Users size={20} strokeWidth={1.5} />, label: 'Social', desc: 'Follow users, like posts, comment' },
    { icon: <Shield size={20} strokeWidth={1.5} />, label: 'Roles', desc: 'User, moderator, and admin tiers' },
    { icon: <Database size={20} strokeWidth={1.5} />, label: 'Distributed', desc: 'Master-Slave replication with failover' },
    { icon: <Zap size={20} strokeWidth={1.5} />, label: 'Real-time Health', desc: 'DB node monitoring and auto-recovery' },
    { icon: <Code size={20} strokeWidth={1.5} />, label: 'REST API', desc: 'Clean layered architecture with DI' },
];

export default function AboutPage() {
    return (
        <AppLayout>
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div>
                    <h1
                        className="text-3xl font-black text-white mb-2"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        About <span className="text-pulse">PulseNet</span>
                    </h1>
                    <p className="text-sm text-white/40">
                        A distributed social platform built for communities.
                    </p>
                </div>

                {/* Description */}
                <div
                    className="rounded-lg px-6 py-5 flex flex-col gap-4"
                    style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                        border: '1px solid rgba(99,102,241,0.15)',
                    }}
                >
                    <p className="text-sm text-white/60 leading-relaxed">
                        PulseNet is a community-driven social platform where users create and join topic-based communities, share posts, comment, and connect with others. Think of it as a mix between Reddit and Discord, built as a distributed full-stack web application.
                    </p>
                    <p className="text-sm text-white/60 leading-relaxed">
                        The platform supports public and private communities, hierarchical comments, a follow system for personalized feeds, and role-based access control across multiple tiers.
                    </p>
                </div>

                {/* Features grid */}
                <div>
                    <h2 className="text-base font-semibold text-white/80 mb-4">Key Features</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {FEATURES.map(f => (
                            <div
                                key={f.label}
                                className="rounded-lg px-4 py-4 flex items-start gap-3"
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                }}
                            >
                                <div
                                    className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                                    style={{ background: 'rgba(99,102,241,0.15)' }}
                                >
                                    <span className="text-pulse">{f.icon}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white/80">{f.label}</p>
                                    <p className="text-xs text-white/40 mt-0.5">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tech Stack */}
                <div
                    className="rounded-lg px-6 py-5"
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                    }}
                >
                    <h2 className="text-base font-semibold text-white/80 mb-4">Tech Stack</h2>
                    <div className="flex flex-wrap gap-2">
                        {TECH_STACK.map(tech => (
                            <span
                                key={tech.name}
                                className="text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5"
                                style={{
                                    background: `${tech.color}15`,
                                    border: `1px solid ${tech.color}30`,
                                    color: tech.color,
                                }}
                            >
                                <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: tech.color }}
                                />
                                {tech.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Collaborators */}
                <div>
                    <h2 className="text-base font-semibold text-white/80 mb-4">Team</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {COLLABORATORS.map((c, i) => (
                        <div
                            key={i}
                            className="rounded-lg px-5 py-4 flex flex-col gap-2"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                                    style={{
                                        background: 'rgba(99,102,241,0.2)',
                                        color: 'var(--color-pulse, #6366f1)',
                                    }}
                                >
                                    {c.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white/80">{c.name}</p>
                                    <p className="text-xs text-pulse/60">{c.role}</p>
                                </div>
                            </div>
                            <p className="text-xs text-white/35 leading-relaxed">{c.contributions}</p>
                        </div>
                    ))}
                    </div>
                </div>

                {/* Footer note */}
                <div className="text-center py-4">
                    <p className="text-xs text-white/25">
                        Built as a university project for the Distributed Systems course at FTN.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}