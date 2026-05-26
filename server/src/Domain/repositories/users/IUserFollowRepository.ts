export interface IUserFollowRepository {
    follow(followerId: number, followingId: number): Promise<boolean>;
    unfollow(followerId: number, followingId: number): Promise<boolean>;
    isFollowing(followerId: number, followingId: number): Promise<boolean>;
    getFollowerIds(userId: number): Promise<number[]>;
    getFollowingIds(userId: number): Promise<number[]>;
    getFollowerCount(userId: number): Promise<number>;
    getFollowingCount(userId: number): Promise<number>;
}
