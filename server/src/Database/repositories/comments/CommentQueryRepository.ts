import { Comment } from '../../../Domain/models/Comment';
import { BaseRepository } from '../BaseRepository';
import { mapComment, COMMENT_FIELDS } from '../../mappers/CommentMapper';
import { ICommentQueryRepository } from '../../../Domain/repositories/comments/ICommentQueryRepository';

export class CommentQueryRepository extends BaseRepository implements ICommentQueryRepository {

    async exists(id: number): Promise<boolean> {
        const count = await this.executeScalar<number>(
            'SELECT COUNT(*) as count FROM comments WHERE id = ?',
            [id]
        );
        return (count ?? 0) > 0;
    }

    async findRootCommentsByPost(postId: number): Promise<Comment[]> {
        return this.executeRead(
            `SELECT ${COMMENT_FIELDS} FROM comments 
             WHERE post_id = ? AND parent_id IS NULL 
             ORDER BY created_at DESC`,
            [postId],
            mapComment
        );
    }

    async findRepliesByCommentId(commentId: number): Promise<Comment[]> {
        return this.executeRead(
            `SELECT ${COMMENT_FIELDS} FROM comments 
             WHERE parent_id = ? 
             ORDER BY created_at ASC`,
            [commentId],
            mapComment
        );
    }

    async findRepliesPaginated(commentId: number, limit: number, offset: number): Promise<Comment[]> {
        return this.executeRead(
            `SELECT ${COMMENT_FIELDS} FROM comments 
             WHERE parent_id = ? 
             ORDER BY created_at ASC 
             LIMIT ? OFFSET ?`,
            [commentId, limit, offset],
            mapComment
        );
    }

    async getReplyCount(commentId: number): Promise<number | null> {
        return this.executeScalar<number>(
            'SELECT COUNT(*) as count FROM comments WHERE parent_id = ?',
            [commentId]
        );
    }
}