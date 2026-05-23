import { RowDataPacket } from 'mysql2';
import { IPostCommentRepository } from '../../../Domain/repositories/post_repository/IPostCommentRepository';
import { BaseRepository } from '../BaseRepository';

export class PostCommentRepository extends BaseRepository implements IPostCommentRepository {
    async getCommentCount(postId: number): Promise<number> {
        const result = await this.executeScalar<number>(
            'SELECT COUNT(*) as count FROM comments WHERE post_id = ? AND is_deleted = 0',
            [postId]
        );
        return result ?? 0;
    }
    async getCommentCountBatch(postIds: number[]): Promise<Map<number, number>> {
        if (!postIds || postIds.length === 0) return new Map();
        const placeholders = this.buildPlaceholders(postIds);
        const rows = await this.executeRead(
            `SELECT post_id, COUNT(*) as count FROM comments WHERE post_id IN (${placeholders}) AND is_deleted = 0 GROUP BY post_id`,
            postIds,
            (r: RowDataPacket) => ({ postId: r.post_id as number, count: Number(r.count) })
        );
        const map = new Map<number, number>();
        rows.forEach(r => map.set(r.postId, r.count));
        return map;
}    
}
    