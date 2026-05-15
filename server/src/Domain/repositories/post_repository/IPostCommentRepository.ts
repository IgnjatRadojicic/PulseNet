import { Post } from '../../models/Post';

export interface IPostCommentRepository {
    getCommentCount(postId: number): Promise<number>;
}