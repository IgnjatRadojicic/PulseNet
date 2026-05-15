import { Comment } from '../../../Domain/models/Comment';
import { BaseRepository } from '../BaseRepository';
import { mapComment, COMMENT_FIELDS } from '../../mappers/CommentMapper';
import { ICommentLikeRepository } from '../../../Domain/repositories/comments/ICommentLikeRepository';

export class CommentLikeRepository extends BaseRepository implements ICommentLikeRepository {

    async like(commentId: number, userId: number): Promise<boolean> {
        const result = await this.executeWrite(
            `INSERT IGNORE INTO comment_likes (user_id, comment_id) VALUES (?, ?)`,
            [userId, commentId]
        );
        return (result?.affectedRows ?? 0) > 0;
    }

    async unlike(commentId: number, userId: number): Promise<boolean> {
        const result = await this.executeWrite(
            `DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?`,
            [userId, commentId]
        );
        return (result?.affectedRows ?? 0) > 0;
    }

    async getLikeCount(commentId: number): Promise<number | null> {
        return this.executeScalar<number>(
            `SELECT COUNT(*) as count 
             FROM comment_likes 
             WHERE comment_id = ?`,
            [commentId]
        );
    }

    async hasLiked(userId: number, commentId: number): Promise<boolean> {
        const count = await this.executeScalar<number>(
            `SELECT COUNT(*) as count 
             FROM comment_likes 
             WHERE user_id = ? AND comment_id = ?`,
            [userId, commentId]
        );
        return (count ?? 0) > 0;
    }
}