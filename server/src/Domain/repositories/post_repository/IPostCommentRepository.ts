export interface IPostCommentRepository {
    getCommentCount(postId: number): Promise<number>;
    getCommentCountBatch(postIds: number[]): Promise<Map<number, number>>;
}
