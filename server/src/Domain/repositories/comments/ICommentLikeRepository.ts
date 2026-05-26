export interface ICommentLikeRepository {
    like(commentId: number, userId: number): Promise<boolean>;
    unlike(commentId: number, userId: number): Promise<boolean>;
    getLikeCount(commentId: number): Promise<number>;
    hasLiked(userId: number, commentId: number): Promise<boolean>;
}
