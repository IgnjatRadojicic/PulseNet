import type { PostDto } from '../../models/posts/PostsDto';

interface TagStat {
    tag: string;
    count: number;
    likeCount: number;
}

interface Props {
    posts: PostDto[];
}

export default function UserTagCloud({ posts }: Props) {
    if (posts.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-ghost text-sm">No tag data yet</p>
            </div>
        );
    }

    const tagMap = new Map<string, TagStat>();

    for (const post of posts) {
        for (const tag of post.tags ?? []) {
            const existing = tagMap.get(tag);
            if (existing) {
                existing.count += 1;
                existing.likeCount += post.likeCount;
            } else {
                tagMap.set(tag, { tag, count: 1, likeCount: post.likeCount });
            }
        }
    }

    if (tagMap.size === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-ghost text-sm">No tags on posts yet</p>
            </div>
        );
    }

    const tags = [...tagMap.values()].sort((a, b) => b.count - a.count);
    const maxCount = tags[0].count;

    const getFontSize = (count: number) => {
        const min = 11;
        const max = 24;
        return Math.round(min + ((count / maxCount) * (max - min)));
    };

    const getOpacity = (count: number) => {
        const min = 0.45;
        const max = 1;
        return +(min + ((count / maxCount) * (max - min))).toFixed(2);
    };

    const top5 = tags.slice(0, 5);

    return (
        <div>
            {/* Tag cloud */}
            <div className="flex flex-wrap gap-3 justify-center py-4 px-2 min-h-[80px] items-center">
                {tags.map(({ tag, count }) => (
                    <span
                        key={tag}
                        title={`${count} post${count !== 1 ? 's' : ''}`}
                        className="transition-all duration-200 cursor-default select-none hover:opacity-100"
                        style={{
                            fontSize: getFontSize(count),
                            opacity: getOpacity(count),
                            color: '#6c63ff',
                            fontWeight: count === maxCount ? 700 : 400,
                            letterSpacing: count === maxCount ? '-0.01em' : 'normal',
                        }}
                    >
                        #{tag}
                    </span>
                ))}
            </div>

            {/* Top 5 bar chart */}
            {top5.length > 0 && (
                <div className="mt-4 space-y-2.5">
                    <p className="text-xs text-muted-ghost mb-3">Top tags by post count</p>
                    {top5.map(({ tag, count, likeCount }) => (
                        <div key={tag} className="flex items-center gap-3">
                            <span className="text-xs text-muted w-24 truncate shrink-0">#{tag}</span>
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(108,99,255,0.12)' }}>
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${(count / maxCount) * 100}%`,
                                        background: 'linear-gradient(90deg, #6c63ff, #a78bfa)',
                                    }}
                                />
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-muted-ghost w-10 text-right">
                                    {count} post{count !== 1 ? 's' : ''}
                                </span>
                                <span className="text-xs text-muted-ghost/60">
                                    ♥ {likeCount}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}