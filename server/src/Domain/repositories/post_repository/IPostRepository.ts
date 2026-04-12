import { Post } from '../../models/Post';

export interface IPostRepository {
    create(post: Post): Promise<Post>;
    getById(id: number): Promise<Post>;
    getByCommunityId(communityId: number): Promise<Post[]>;
    getByAuthorId(authorId: number): Promise<Post[]>;
    getCommunityPostIds(communityIds: number[]): Promise<number[]>;
    getFollowedAuthorPostIds(authorIds: number[]): Promise<number[]>;
    getByIds(ids: number[]): Promise<Post[]>;
    update(post: Post): Promise<Post>;
    delete(id: number): Promise<boolean>;
    getLikeCount(postId: number): Promise<number>;
    getLikeCountBatch(postIds: number[]): Promise<Map<number, number>>;
    getCommentCount(postId: number): Promise<number>;
    getCommentCountBatch(postIds: number[]): Promise<Map<number, number>>;
    getTagIds(postId: number): Promise<number[]>;
    getTagIdsBatch(postIds: number[]): Promise<Map<number, number[]>>;
    hasLiked(userId: number, postId: number): Promise<boolean>;
    addLike(userId: number, postId: number): Promise<boolean>;
    removeLike(userId: number, postId: number): Promise<boolean>;
    addTag(postId: number, tagId: number): Promise<boolean>;
    addTags(postId: number, tagIds: number[]): Promise<boolean>;
    removeTag(postId: number, tagId: number): Promise<boolean>;
}