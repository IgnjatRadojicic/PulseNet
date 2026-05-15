import { Post } from '../../models/Post';

export interface IPostRepository {
    create(post: Post): Promise<Post | null>;
    getById(id: number): Promise<Post | null>;
    getByIds(ids: number[]): Promise<Post[]>;
    getByAuthorId(authorId: number): Promise<Post[]>;
    getByCommunityId(communityId: number): Promise<Post[]>;
    getCommunityPostIds(communityIds: number[]): Promise<number[]>;
    getFollowedAuthorPostIds(authorIds: number[]): Promise<number[]>;
    update(post: Post): Promise<Post | null>;
    delete(id: number): Promise<boolean>;
}
