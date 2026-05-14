import { IPostLikeRepository } from '../../../Domain/repositories/post_repository/IPostLikeRepository';
import { RowDataPacket } from 'mysql2';
import { BaseRepository } from '../BaseRepository';

export class PostLikeRepository extends BaseRepository implements IPostLikeRepository {

    async addLike(userId: number, postId: number): Promise<boolean> {
        const result = await this.executeWrite(
            'INSERT IGNORE INTO post_likes (user_id, post_id) VALUES (?, ?)',
            [userId, postId]
        );
        return result !== null;
    }

    async removeLike(userId: number, postId: number): Promise<boolean> {
        const result = await this.executeWrite(
            'DELETE FROM post_likes WHERE user_id = ? AND post_id = ?',
            [userId, postId]
        );
        return (result?.affectedRows ?? 0) > 0;
    }
    
    async hasLiked(userId: number, postId: number): Promise<boolean> {
        const result = await this.executeReadOne(
            'SELECT COUNT(*) as count FROM post_likes WHERE user_id = ? AND post_id = ?',
            [userId, postId],
            (row: RowDataPacket) => row.count as number
        );
        return (result ?? 0) > 0;
    }
    
    async getLikeCount(postId: number): Promise<number> {
        const result = await this.executeScalar<number>(
            'SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?',
            [postId]
        );
        return result ?? 0;
    }

    async getLikeCountBatch(postIds: number[]): Promise<Map<number, number>> {
        if (!postIds || postIds.length === 0) return new Map<number, number>();
        const placeholders = this.buildPlaceholders(postIds);
        const result = await this.executeRead(
            `SELECT post_id, COUNT(*) as count FROM post_likes WHERE post_id IN (${placeholders}) GROUP BY post_id`,
            postIds,
            (row: RowDataPacket) => ({ postId: row.post_id as number, count: Number(row.count) })
        );
        const likeCountMap = new Map<number, number>();
        result.forEach(r => likeCountMap.set(r.postId, r.count));
        return likeCountMap;
    }

}