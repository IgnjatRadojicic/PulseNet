import { CommentDto } from '../../Domain/DTOs/comments/CommentDto';
import { Comment } from '../../Domain/models/Comment';
import { ICommentRepository } from '../../Domain/repositories/comments/ICommentRepository';
import { ICommunityRepository } from '../../Domain/repositories/communities/ICommunityRepository';
import { IPostRepository } from '../../Domain/repositories/posts/IPostRepository';
import { IUserRepository } from '../../Domain/repositories/users/IUserRepository';
import { ICommentService } from '../../Domain/services/comments/ICommentService';
import { ServiceResult } from '../../Domain/types/ServiceResult';

export class CommentService implements ICommentService {
    public constructor(
        private commentRepository: ICommentRepository,
        private postRepository: IPostRepository,
        private userRepository: IUserRepository,
        private communityRepository: ICommunityRepository
    ) {}

    private async buildCommentDto(comment: Comment): Promise<CommentDto> {

        return new CommentDto(
            comment.id,
            comment.isDeleted ? '[comment deleted]' : comment.content,
            comment.postId,
            comment.authorId,
            comment.parentId,
            comment.isDeleted,
            comment.isFlagged,
            [],
            comment.createdAt,
            comment.updatedAt
        );
    }

    async addComment(
        authorId: number,
        postId: number,
        content: string,
        parentId: number | null = null
    ): Promise<ServiceResult<CommentDto>> {
        const post = await this.postRepository.getById(postId);
        if (post.id === 0) {
            return { success: false, message: 'Post not found', statusCode: 404 };
        }

        if (parentId !== null) {
            const parent = await this.commentRepository.getById(parentId);
            if (parent.id === 0) {
                return { success: false, message: 'Parent comment not found', statusCode: 404 };
            }
            if (parent.postId !== postId) {
                return { success: false, message: 'Parent comment does not belong to this post', statusCode: 400 };
            }
            if (parent.parentId !== null) {
                return { success: false, message: 'Maximum comment depth is 2 levels', statusCode: 400 };
            }
        }

        const comment = await this.commentRepository.create(
            new Comment(0, postId, authorId, parentId ?? null, 0, [], content, false, false, new Date(), new Date())
        );

        if (comment.id === 0) {
            return { success: false, message: 'Failed to create comment', statusCode: 500 };
        }

        const dto = await this.buildCommentDto(comment);
        return { success: true, data: dto, statusCode: 201 };
    }

    async getCommentsByPost(postId: number): Promise<ServiceResult<CommentDto[]>> {
        const post = await this.postRepository.getById(postId);
        if (post.id === 0) {
            return { success: false, message: 'Post not found', statusCode: 404 };
        }

        const comments = await this.commentRepository.getByPost(postId);
        const dtos = await Promise.all(comments.map(c => this.buildCommentDto(c)));

        const rootComments = dtos.filter(c => c.parentId === null);
        const replies = dtos.filter(c => c.parentId !== null);

        for (const root of rootComments) {
            root.replies = replies.filter(r => r.parentId === root.id);
        }

        return { success: true, data: rootComments };
    }

    async updateComment(id: number, requesterId: number, content: string): Promise<ServiceResult<CommentDto>> {
        const comment = await this.commentRepository.getById(id);
        if (comment.id === 0) {
            return { success: false, message: 'Comment not found', statusCode: 404 };
        }
        if (comment.authorId !== requesterId) {
            return { success: false, message: 'Not authorized to update this comment', statusCode: 403 };
        }
        if (comment.isDeleted) {
            return { success: false, message: 'Cannot update a deleted comment', statusCode: 400 };
        }

        const result = await this.commentRepository.update(id, content);
        if (!result) {
            return { success: false, message: 'Update failed', statusCode: 500 };
        }

        comment.content = content;
        const dto = await this.buildCommentDto(comment);
        return { success: true, data: dto };
    }

    async softDeleteComment(id: number, requesterId: number): Promise<ServiceResult<boolean>> {
        const comment = await this.commentRepository.getById(id);
        if (comment.id === 0) {
            return { success: false, message: 'Comment not found', statusCode: 404 };
        }

        const post = await this.postRepository.getById(comment.postId);
        const member = await this.communityRepository.getMember(requesterId, post.communityId);
        const isAuthor = comment.authorId === requesterId;
        const isModerator = member.role === 'moderator';

        if (!isAuthor && !isModerator) {
            return { success: false, message: 'Not authorized to delete this comment', statusCode: 403 };
        }

        const result = await this.commentRepository.softDelete(id);
        if (!result) {
            return { success: false, message: 'Delete failed', statusCode: 500 };
        }

        return { success: true, data: true };
    }

    async flagComment(id: number, requesterId: number, communityId: number): Promise<ServiceResult<boolean>> {
        const comment = await this.commentRepository.getById(id);
        if (comment.id === 0) {
            return { success: false, message: 'Comment not found', statusCode: 404 };
        }

        const member = await this.communityRepository.getMember(requesterId, communityId);
        if (member.role !== 'moderator') {
            return { success: false, message: 'Only moderators can flag comments', statusCode: 403 };
        }

        const result = await this.commentRepository.setFlag(id, true);
        if (!result) {
            return { success: false, message: 'Flag failed', statusCode: 500 };
        }

        return { success: true, data: true };
    }

    async likeComment(userId: number, commentId: number): Promise<ServiceResult<boolean>> {
        const comment = await this.commentRepository.getById(commentId);
        if (comment.id === 0) {
            return { success: false, message: 'Comment not found', statusCode: 404 };
        }

        const alreadyLiked = await this.commentRepository.hasLiked(userId, commentId);
        if (alreadyLiked) {
            return { success: false, message: 'You have already liked this comment', statusCode: 409 };
        }

        const result = await this.commentRepository.like(userId, commentId);
        if (!result) {
            return { success: false, message: 'Failed to like comment', statusCode: 500 };
        }

        return { success: true, data: true };
    }

    async unlikeComment(userId: number, commentId: number): Promise<ServiceResult<boolean>> {
        const comment = await this.commentRepository.getById(commentId);
        if (comment.id === 0) {
            return { success: false, message: 'Comment not found', statusCode: 404 };
        }

        const hasLiked = await this.commentRepository.hasLiked(userId, commentId);
        if (!hasLiked) {
            return { success: false, message: 'You have not liked this comment', statusCode: 400 };
        }

        const result = await this.commentRepository.unlike(userId, commentId);
        if (!result) {
            return { success: false, message: 'Failed to unlike comment', statusCode: 500 };
        }

        return { success: true, data: true };
    }
}