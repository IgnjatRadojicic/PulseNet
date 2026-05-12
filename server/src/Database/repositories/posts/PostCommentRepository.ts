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
}
    