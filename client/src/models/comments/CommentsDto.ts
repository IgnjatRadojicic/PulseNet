export interface CommentDto {
    id: number;
    content: string;
    postId: number;
    authorId: number;
    authorUsername: string;
    parentId: number | null;
    isDeleted: boolean;
    isFlagged: boolean;
    likeCount: number;
    replies: CommentDto[];
    createdAt: string | null;
    updatedAt: string | null;
}