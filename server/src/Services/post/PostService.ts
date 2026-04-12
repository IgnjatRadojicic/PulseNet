import { PostDto } from '../../Domain/DTOs/posts/PostDto';
import { Post } from '../../Domain/models/Post';
import { ICommunityRepository } from '../../Domain/repositories/communities/ICommunityRepository';
import { IPostRepository } from '../../Domain/repositories/posts/IPostRepository';
import { ITagRepository } from '../../Domain/repositories/tags/ITagRepository';
import { IUserRepository } from '../../Domain/repositories/users/IUserRepository';
import { IPostService, PostSortOption } from '../../Domain/services/posts/IPostService';
import { ServiceResult } from '../../Domain/types/ServiceResult';

export class PostService implements IPostService {
    public constructor(
        private postRepository: IPostRepository,
        private userRepository: IUserRepository,
        private communityRepository: ICommunityRepository,
        private tagRepository: ITagRepository
    ) {}

    private async buildPostDto(post: Post): Promise<PostDto> {
        const [author, community, likeCount, commentCount, tagIds] = await Promise.all([
            this.userRepository.getById(post.authorId),
            this.communityRepository.getById(post.communityId),
            this.postRepository.getLikeCount(post.id),
            this.postRepository.getCommentCount(post.id),
            this.postRepository.getTagIds(post.id),
        ]);

        const tags = await this.tagRepository.getByIds(tagIds);

        return new PostDto(
            post.id, post.title, post.content, post.mediaUrl,
            post.communityId, community.name,
            post.authorId, author.username,
            likeCount, commentCount,
            tags.map(t => t.name),
            post.createdAt, post.updatedAt
        );
    }

    private async buildPostDtos(posts: Post[]): Promise<PostDto[]> {
        if (posts.length === 0) return [];

        const postIds = posts.map(p => p.id);
        const authorIds = [...new Set(posts.map(p => p.authorId))];
        const communityIds = [...new Set(posts.map(p => p.communityId))];

        const [authors, communities, likeCounts, commentCounts, tagIdMap] = await Promise.all([
            this.userRepository.getByIds(authorIds),
            this.communityRepository.getByIds(communityIds),
            this.postRepository.getLikeCountBatch(postIds),
            this.postRepository.getCommentCountBatch(postIds),
            this.postRepository.getTagIdsBatch(postIds),
        ]);

        const allTagIds = [...new Set([...tagIdMap.values()].flat())];
        const allTags = await this.tagRepository.getByIds(allTagIds);
        const tagMap = new Map(allTags.map(t => [t.id, t.name]));
        const authorMap = new Map(authors.map(u => [u.id, u.username]));
        const communityMap = new Map(communities.map(c => [c.id, c.name]));

        return posts.map(post => new PostDto(
            post.id, post.title, post.content, post.mediaUrl,
            post.communityId, communityMap.get(post.communityId) ?? '',
            post.authorId, authorMap.get(post.authorId) ?? '',
            likeCounts.get(post.id) ?? 0,
            commentCounts.get(post.id) ?? 0,
            (tagIdMap.get(post.id) ?? []).map(id => tagMap.get(id) ?? '').filter(Boolean),
            post.createdAt, post.updatedAt
        ));
    }

    async createPost(
        title: string,
        content: string,
        mediaUrl: string | null,
        communityId: number,
        authorId: number,
        tagIds: number[] = []
    ): Promise<ServiceResult<PostDto>> {
        const community = await this.communityRepository.getById(communityId);
        if (community.id === 0) {
            return { success: false, message: 'Community not found', statusCode: 404 };
        }

        const member = await this.communityRepository.getMember(authorId, communityId);
        if (member.userId === 0 || member.status !== 'active') {
            return { success: false, message: 'You must be an active member to post', statusCode: 403 };
        }

        const post = await this.postRepository.create(
            new Post(0, title, content, mediaUrl, communityId, authorId)
        );

        if (post.id === 0) {
            return { success: false, message: 'Failed to create post', statusCode: 500 };
        }

        await this.postRepository.addTags(post.id, tagIds);

        const dto = await this.buildPostDto(post);
        return { success: true, data: dto, statusCode: 201 };
    }

    async getPostById(id: number): Promise<ServiceResult<PostDto>> {
        const post = await this.postRepository.getById(id);
        if (post.id === 0) {
            return { success: false, message: 'Post not found', statusCode: 404 };
        }
        const dto = await this.buildPostDto(post);
        return { success: true, data: dto };
    }

    async getCommunityPosts(communityId: number, sort: PostSortOption): Promise<ServiceResult<PostDto[]>> {
        const community = await this.communityRepository.getById(communityId);
        if (community.id === 0) {
            return { success: false, message: 'Community not found', statusCode: 404 };
        }

        const posts = await this.postRepository.getByCommunityId(communityId);
        const dtos = await this.buildPostDtos(posts);

        if (sort === 'popular') dtos.sort((a, b) => b.likeCount - a.likeCount);
        else if (sort === 'commented') dtos.sort((a, b) => b.commentCount - a.commentCount);

        return { success: true, data: dtos };
    }

    async getFeed(userId: number): Promise<ServiceResult<PostDto[]>> {
        const communities = await this.communityRepository.getByUserId(userId);
        const communityIds = communities.map(c => c.id);

        const following = await this.userRepository.getFollowing(userId);
        const followingIds = following.map(u => u.id);

        const [communityPostIds, followedPostIds] = await Promise.all([
            this.postRepository.getCommunityPostIds(communityIds),
            this.postRepository.getFollowedAuthorPostIds(followingIds),
        ]);

        const uniqueIds = [...new Set([...communityPostIds, ...followedPostIds])];
        if (uniqueIds.length === 0) return { success: true, data: [] };

        const posts = await this.postRepository.getByIds(uniqueIds);
        posts.sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        });

        const dtos = await this.buildPostDtos(posts.slice(0, 50));
        return { success: true, data: dtos };
    }

    async updatePost(
        id: number,
        requesterId: number,
        title: string,
        content: string,
        mediaUrl: string | null
    ): Promise<ServiceResult<PostDto>> {
        const post = await this.postRepository.getById(id);
        if (post.id === 0) {
            return { success: false, message: 'Post not found', statusCode: 404 };
        }

        const member = await this.communityRepository.getMember(requesterId, post.communityId);
        const isAuthor = post.authorId === requesterId;
        const isModerator = member.role === 'moderator';

        if (!isAuthor && !isModerator) {
            return { success: false, message: 'Not authorized to update this post', statusCode: 403 };
        }

        const updated = await this.postRepository.update(
            new Post(id, title, content, mediaUrl, post.communityId, post.authorId)
        );

        if (updated.id === 0) {
            return { success: false, message: 'Update failed', statusCode: 500 };
        }

        const dto = await this.buildPostDto(updated);
        return { success: true, data: dto };
    }

    async deletePost(id: number, requesterId: number): Promise<ServiceResult<boolean>> {
        const post = await this.postRepository.getById(id);
        if (post.id === 0) {
            return { success: false, message: 'Post not found', statusCode: 404 };
        }

        const member = await this.communityRepository.getMember(requesterId, post.communityId);
        const isAuthor = post.authorId === requesterId;
        const isModerator = member.role === 'moderator';

        if (!isAuthor && !isModerator) {
            return { success: false, message: 'Not authorized to delete this post', statusCode: 403 };
        }

        const result = await this.postRepository.delete(id);
        if (!result) {
            return { success: false, message: 'Delete failed', statusCode: 500 };
        }

        return { success: true, data: true };
    }

    async likePost(userId: number, postId: number): Promise<ServiceResult<boolean>> {
        const post = await this.postRepository.getById(postId);
        if (post.id === 0) {
            return { success: false, message: 'Post not found', statusCode: 404 };
        }
        if (post.authorId === userId) {
            return { success: false, message: 'You cannot like your own post', statusCode: 400 };
        }
        const alreadyLiked = await this.postRepository.hasLiked(userId, postId);
        if (alreadyLiked) {
            return { success: false, message: 'You have already liked this post', statusCode: 409 };
        }
        const result = await this.postRepository.addLike(userId, postId);
        if (!result) {
            return { success: false, message: 'Failed to like post', statusCode: 500 };
        }
        return { success: true, data: true };
    }

    async unlikePost(userId: number, postId: number): Promise<ServiceResult<boolean>> {
        const hasLiked = await this.postRepository.hasLiked(userId, postId);
        if (!hasLiked) {
            return { success: false, message: 'You have not liked this post', statusCode: 400 };
        }
        const result = await this.postRepository.removeLike(userId, postId);
        if (!result) {
            return { success: false, message: 'Failed to unlike post', statusCode: 500 };
        }
        return { success: true, data: true };
    }

    async addTag(postId: number, tagId: number, requesterId: number): Promise<ServiceResult<boolean>> {
        const post = await this.postRepository.getById(postId);
        if (post.id === 0) {
            return { success: false, message: 'Post not found', statusCode: 404 };
        }
        if (post.authorId !== requesterId) {
            return { success: false, message: 'Only the author can add tags', statusCode: 403 };
        }
        const tag = await this.tagRepository.getById(tagId);
        if (tag.id === 0) {
            return { success: false, message: 'Tag not found', statusCode: 404 };
        }
        const result = await this.postRepository.addTag(postId, tagId);
        if (!result) {
            return { success: false, message: 'Failed to add tag', statusCode: 500 };
        }
        return { success: true, data: true };
    }

    async removeTag(postId: number, tagId: number, requesterId: number): Promise<ServiceResult<boolean>> {
        const post = await this.postRepository.getById(postId);
        if (post.id === 0) {
            return { success: false, message: 'Post not found', statusCode: 404 };
        }
        if (post.authorId !== requesterId) {
            return { success: false, message: 'Only the author can remove tags', statusCode: 403 };
        }
        const result = await this.postRepository.removeTag(postId, tagId);
        if (!result) {
            return { success: false, message: 'Failed to remove tag', statusCode: 500 };
        }
        return { success: true, data: true };
    }
}