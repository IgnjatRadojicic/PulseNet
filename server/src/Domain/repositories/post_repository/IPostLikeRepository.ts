export interface IPostLikeRepository {
    addLike(userId: number, postId: number): Promise<boolean>;
    removeLike(userId: number, postId: number): Promise<boolean>;
    hasLiked(userId: number, postId: number): Promise<boolean>;
    getLikeCount(postId: number): Promise<number>;
    getLikeCountBatch(postIds: number[]): Promise<Map<number, number>>;
    getLikedPostIds(userId: number, postIds: number[]): Promise<Set<Number>>;
}
