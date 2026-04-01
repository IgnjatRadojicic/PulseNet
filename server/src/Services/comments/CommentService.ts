import { CommentDto } from '../../Domain/DTOs/comments/CommentDto';
import { ICommentRepository } from '../../Domain/repositories/comments/ICommentRepository';
import { ICommentService } from '../../Domain/services/comments/ICommentService';
import { ServiceResult } from '../../Domain/types/ServiceResult';
import { Comment } from '../../Domain/models/Comment';

export class CommentService implements ICommentService {
    public constructor(private commentRepository: ICommentRepository) {}

    async getCommentsByPost(postId: number): Promise<ServiceResult<CommentDto[]>> {
        const users = await this.commentRepository.getByPost(postId);
        return {
            success: true,
            data: users.map(u => new CommentDto(u.id, u.postId, u.authorId, u.parentId, u.commentLikes, u.isLikedByCurrentUser, u.content, u.isDeleted, u.isFlagged)),
        };
    }

    async addComment(authorId: number, postId: number, content: string, parentId?: number | null): Promise<ServiceResult<CommentDto>> {
        const newComment = new Comment(0, postId, authorId, parentId ?? null, 0, [], false, content, false, false);
        const saved = await this.commentRepository.create(newComment);
        return {
            success: true,
            data: new CommentDto(
                saved.id,
                saved.postId,
                saved.authorId,
                saved.parentId,
                saved.commentLikes,
                saved.isLikedByCurrentUser,
                saved.content,
                saved.isDeleted,
                saved.isFlagged
            )
        };
    }

    async updateComment(commentId: number, authorId: number, content: string): Promise<ServiceResult<CommentDto>> {
        const existing = await this.commentRepository.getById(commentId);
        if (existing.id === 0) {
            return { success: false, message: 'Comment not found', statusCode: 404 };
        }
        if (existing.authorId !== authorId) {
            return { success: false, message: 'Unauthorized', statusCode: 403 };
        }
        existing.content = content;
        const updated = await this.commentRepository.update(existing);
        if (updated.id === 0) {
            return { success: false, message: 'Failed to update comment', statusCode: 500 };
        }
        return {
            success: true,
            data: new CommentDto(
                updated.id,
                updated.postId,
                updated.authorId,
                updated.parentId,
                updated.commentLikes,
                updated.isLikedByCurrentUser,
                updated.content,
                updated.isDeleted,
                updated.isFlagged
            )
        };
    }

    async softDeleteComment(commentId: number, actorId: number): Promise<ServiceResult<boolean>> {
        const existing = await this.commentRepository.getById(commentId);
        if (existing.id === 0) {
            return { success: false, message: 'Comment not found', statusCode: 404 };
        }
        if (existing.authorId !== actorId) {
            return { success: false, message: 'Unauthorized', statusCode: 403 };
        }
        const result = await this.commentRepository.softDelete(commentId);
        if (!result) {
            return { success: false, message: 'Delete failed', statusCode: 500 };
        }
        return { success: true, data: true };
    }

    async likeComment(commentId: number, userId: number): Promise<ServiceResult<boolean>> {
        const existing = await this.commentRepository.getById(commentId);
        if (existing.id === 0) {
            return { success: false, message: 'Comment not found', statusCode: 404 };
        }

        if (existing.isLikedByCurrentUser) {
            return { success: false, message: 'Already liked', statusCode: 400 };
        }

        const result = await this.commentRepository.like(commentId, userId);
        if (!result) {
            return { success: false, message: 'Like failed', statusCode: 500 };
        }
        return { success: true, data: true };
    }

    async unlikeComment(commentId: number, userId: number): Promise<ServiceResult<boolean>> {
        const existing = await this.commentRepository.getById(commentId);
        if (existing.id === 0) {
            return { success: false, message: 'Comment not found', statusCode: 404 };
        }

        if (!existing.isLikedByCurrentUser) {
            return { success: false, message: 'Not liked', statusCode: 400 };
        }

        const result = await this.commentRepository.unlike(commentId, userId);
        if (!result) {
            return { success: false, message: 'Unlike failed', statusCode: 500 };
        }
        return { success: true, data: true };
    }
}