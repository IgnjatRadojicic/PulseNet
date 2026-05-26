export type AddCommentInput = {
    authorId: number;
    postId: number;
    content: string;
    parentId: number | null;
};

export type UpdateCommentInput = {
    commentId: number;
    requesterId: number;
    content: string;
};

export type DeleteCommentInput = {
    commentId: number;
    requesterId: number;
};

export type GetCommentsByPostInput = {
    postId: number;
    currentUserId: number;
};

export type FlagCommentInput = {
    commentId: number;
    requesterId: number;
    communityId: number;
};

export type LikeCommentInput = {
    userId: number;
    commentId: number;
};

export type UnlikeCommentInput = {
    userId: number;
    commentId: number;
};

export type FindRootCommentsByPostInput = {
    postId: number;
    currentUserId: number;
};

export type FindRepliesByCommentIdInput = {
    commentId: number;
    currentUserId: number;
};

export type FindRepliesPaginatedInput = {
    commentId: number;
    limit: number;
    offset: number;
    currentUserId: number;
};

export type GetReplyCountInput = {
    commentId: number;
};

export interface GetCommentsByUserInput {
    userId: number;
    requesterId?: number | null;
}