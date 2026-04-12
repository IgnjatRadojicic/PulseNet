import { CommentDto } from '../../DTOs/comments/CommentDto';
import { ServiceResult } from '../../types/ServiceResult';

export interface ICommentService {
    getCommentsByPost(postId: number): Promise<ServiceResult<CommentDto[]>>;

    addComment(
        authorId: number,
        postId: number,
        content: string,
        parentId: number | null
    ): Promise<ServiceResult<CommentDto>>;

    updateComment(
        commentId: number,
        authorId: number,
        content: string
    ): Promise<ServiceResult<CommentDto>>;

    softDeleteComment(
        commentId: number,
        actorId: number
    ): Promise<ServiceResult<boolean>>;

    likeComment(commentId: number, userId: number): Promise<ServiceResult<boolean>>;
    unlikeComment(commentId: number, userId: number): Promise<ServiceResult<boolean>>;
}