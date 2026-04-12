import { PostDto } from '../../DTOs/posts/PostDto';
import { ServiceResult } from '../../types/ServiceResult';

export type PostSortOption = 'newest' | 'popular' | 'commented';

export interface IPostService {
    createPost(
        title: string,
        content: string,
        mediaUrl: string | null,
        communityId: number,
        authorId: number,
        tagIds?: number[]
    ): Promise<ServiceResult<PostDto>>;

    getPostById(id: number): Promise<ServiceResult<PostDto>>;
    getCommunityPosts(communityId: number, sort: PostSortOption): Promise<ServiceResult<PostDto[]>>;
    getFeed(userId: number): Promise<ServiceResult<PostDto[]>>;

    updatePost(
        id: number,
        requesterId: number,
        title: string,
        content: string,
        mediaUrl: string | null
    ): Promise<ServiceResult<PostDto>>;

    deletePost(id: number, requesterId: number): Promise<ServiceResult<boolean>>;
    likePost(userId: number, postId: number): Promise<ServiceResult<boolean>>;
    unlikePost(userId: number, postId: number): Promise<ServiceResult<boolean>>;
    addTag(postId: number, tagId: number, requesterId: number): Promise<ServiceResult<boolean>>;
    removeTag(postId: number, tagId: number, requesterId: number): Promise<ServiceResult<boolean>>;
}