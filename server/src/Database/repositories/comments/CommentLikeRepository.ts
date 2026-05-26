import { BaseRepository } from '../BaseRepository';
import { ICommentLikeRepository } from '../../../Domain/repositories/comments/ICommentLikeRepository';

export class CommentLikeRepository extends BaseRepository implements ICommentLikeRepository {

    async like(commentId: number, userId: number): Promise<boolean> {
        const result = await this.executeWrite(
            `INSERT IGNORE INTO comment_likes (user_id, comment_id) VALUES (?, ?)`,
            [userId, commentId]
        );
        return result.ok && result.data.affectedRows > 0;
    }

    async unlike(commentId: number, userId: number): Promise<boolean> {
        const result = await this.executeWrite(
            `DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?`,
            [userId, commentId]
        );
        return result.ok && result.data.affectedRows > 0;
    }

    async getLikeCount(commentId: number): Promise<number> {
        const result = await this.executeScalar<number>(
            `SELECT COUNT(*) as count 
             FROM comment_likes 
             WHERE comment_id = ?`,
            [commentId]
        );
        return result.ok ? result.data : 0;
    }

    async hasLiked(userId: number, commentId: number): Promise<boolean> {
        const result = await this.executeScalar<number>(
            `SELECT COUNT(*) as count 
             FROM comment_likes 
             WHERE user_id = ? AND comment_id = ?`,
            [userId, commentId]
        );
        return result.ok && result.data > 0;
    }
}
