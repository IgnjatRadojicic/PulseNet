import { Comment } from '../../models/Comment';

export interface ICommentQueryRepository {
    exists(id: number): Promise<boolean>;
    findRootCommentsByPost(postId: number): Promise<Comment[]>;
    findRepliesByCommentId(commentId: number): Promise<Comment[]>;
    findRepliesPaginated(commentId: number, limit: number, offset: number): Promise<Comment[]>;
    getReplyCount(commentId: number): Promise<number>;
}
