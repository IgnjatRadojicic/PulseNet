export type CreatePostInput = {
    title: string;
    content: string;
    mediaUrl: string | null;
    communityId: number;
    authorId: number;
    tagIds: number[];
};

export type UpdatePostInput = {
    postId: number;
    requesterId: number;
    title: string;
    content: string;
    mediaUrl: string | null;
};

export type DeletePostInput = {
    postId: number;
    requesterId: number;
};

export type GetPostInput = {
    postId: number;
    requesterId: number | null;
};

export type GetCommunityPostsInput = {
    communityId: number;
    sort: 'newest' | 'popular' | 'commented';
    requesterId: number | null;
};

export type GetFeedInput = {
    userId: number;
};

export type GetPublicPostsInput = {
    limit: number;
    requesterId: number | null;
};

export type LikePostInput = {
    userId: number;
    postId: number;
};

export type UnlikePostInput = {
    userId: number;
    postId: number;
};

export type AddTagInput = {
    postId: number;
    tagId: number;
    requesterId: number;
};

export type RemoveTagInput = {
    postId: number;
    tagId: number;
    requesterId: number;
};