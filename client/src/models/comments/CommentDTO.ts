export interface CommentAuthor {
    id: number;
    username: string;
    avatar?: string;
}

// Matches actual API response (camelCase from backend)
export interface CommentDto {
    id: number;
    postId: number;
    authorId: number;
    parentId: number | null;
    content: string;
    isDeleted: number;
    isFlagged: number;
    createdAt: string;
    updatedAt?: string;
    likeCount: number;
    authorUsername: string;
    isLikedByUser: boolean;
    isLiked: boolean;
    username?: string;
    replies?: CommentDto[];
    deleted_at?: string | null;
    author?: CommentAuthor;
}

export interface CreateCommentDto {
    post_id: number;
    content: string;
    parent_id?: number | null;
}

export interface UpdateCommentDto {
    content: string;
}

export type CommentSortOption = 'newest' | 'most_liked';
