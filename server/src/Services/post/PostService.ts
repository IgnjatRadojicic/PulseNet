import { PostDto } from '../../Domain/DTOs/posts/PostDto';
import { Post } from '../../Domain/models/Post';
import { User } from '../../Domain/models/User';
import { Tag } from '../../Domain/models/Tag';
import { Like } from '../../Domain/models/Like';
import { Community } from '../../Domain/models/Community';
import { ErrorCode } from '../../Domain/enums/ErrorCode';
import { ICommunityRepository } from '../../Domain/repositories/communities/ICommunityRepository';
import { IPostRepository } from '../../Domain/repositories/posts/IPostRepository';
import { IPostLikeRepository } from '../../Domain/repositories/posts/IPostLikeRepository';
import { IPostTagRepository } from '../../Domain/repositories/posts/IPostTagRepository'
import { ITagRepository } from '../../Domain/repositories/tags/ITagRepository';
import { IUserRepository } from '../../Domain/repositories/users/IUserRepository';
import { IUserFollowRepository } from '../../Domain/repositories/users/IUserFollowRepository';
import { IUserService } from '../../Domain/services/users/IUserService';    
import { IPostService, PostSortOption } from '../../Domain/services/posts/IPostService';
import { ServiceResult } from '../../Domain/types/ServiceResult';

import * as PostInputs from '../../Domain/types/inputs/PostInputs';

export class PostService implements IPostService {
    public constructor(
        private postRepository: IPostRepository,
        private postLikeRepository: IPostLikeRepository,
        private postTagRepository: IPostTagRepository,
        private userRepository: IUserRepository,
        private userFollowRepository: IUserFollowRepository,
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
            tags.map((t: PostDto) => t.name),
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
        const tagMap = new Map(allTags.map((t: Tag) => [t.id, t.name]));
        const authorMap = new Map(authors.map((u: User) => [u.id, u.username]));
        const communityMap = new Map(communities.map((c: Community) => [c.id, c.name]));

        return posts.map(post => new PostDto(
            post.id, post.title, post.content, post.mediaUrl,
            post.communityId, communityMap.get(post.communityId) ?? '',
            post.authorId, authorMap.get(post.authorId) ?? '',
            likeCounts.get(post.id) ?? 0,
            commentCounts.get(post.id) ?? 0,
            (tagIdMap.get(post.id) ?? []).map((id: number) => tagMap.get(id) ?? '').filter(Boolean),
            post.createdAt, post.updatedAt
        ));
    }

    async createPost(createPostInput: PostInputs.CreatePostInput): Promise<ServiceResult<PostDto>> {
        const community = await this.communityRepository.getById(createPostInput.communityId);
        if (community.id === 0) {
            return { success: false, message: 'Community not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const member = await this.communityRepository.getMember(createPostInput.authorId, createPostInput.communityId);
        if (member.userId === 0 || member.status !== 'active') {
            return { success: false, message: 'You must be an active member to post', errorCode: ErrorCode.FORBIDDEN };
        }

        const post = await this.postRepository.create(
            new Post(0, createPostInput.title, createPostInput.content, createPostInput.mediaUrl, createPostInput.communityId, createPostInput.authorId)
        );

        if (post.id === 0) {
            return { success: false, message: 'Failed to create post', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        await this.postRepository.addTags(post.id, createPostInput.tagIds);

        const dto = await this.buildPostDto(post);
        return { success: true, data: dto };
    }

    async getPostById(getPostInput: PostInputs.GetPostInput): Promise<ServiceResult<PostDto>> {
        const post = await this.postRepository.getById(getPostInput.postId);
        if (!post) {
            return { success: false, message: 'Post not found', errorCode: ErrorCode.NOT_FOUND };
        }
        const dto = await this.buildPostDto(post);
        return { success: true, data: dto };
    }

    async getCommunityPosts(getCommunityPostsInput: PostInputs.GetCommunityPostsInput): Promise<ServiceResult<PostDto[]>> {
        const community = await this.communityRepository.getById(getCommunityPostsInput.communityId);
        if (!community) {
            return { success: false, message: 'Community not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const posts = await this.postRepository.getByCommunityId(getCommunityPostsInput.communityId);
        const dtos = await this.buildPostDtos(posts);

        if (getCommunityPostsInput.sort === 'popular') dtos.sort((a, b) => b.likeCount - a.likeCount);
        else if (getCommunityPostsInput.sort === 'commented') dtos.sort((a, b) => b.commentCount - a.commentCount);

        return { success: true, data: dtos };
    }

    async getFeed(getFeedInput: PostInputs.GetFeedInput): Promise<ServiceResult<PostDto[]>> {
        const communities = await this.communityRepository.getByUserId(getFeedInput.userId);
        const communityIds = communities.map((c: PostDto) => c.id);

        const following = await this.userFollowRepository.getFollowerIds(getFeedInput.userId);
        const followingIds = following.map((u: PostDto) => u.id);

        const [communityPostIds, followedPostIds] = await Promise.all([
            this.postRepository.getCommunityPostIds(communityIds),
            this.postRepository.getFollowedAuthorPostIds(followingIds),
        ]);

        const uniqueIds = [...new Set([...communityPostIds, ...followedPostIds])];
        if (uniqueIds.length === 0) return { success: true, data: [] };

        const posts = await this.postRepository.getByIds(uniqueIds);
        posts.sort((a: PostDto, b: PostDto) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        });

        const dtos = await this.buildPostDtos(posts.slice(0, 50));
        return { success: true, data: dtos };
    }

    async updatePost(updatePostInput: PostInputs.UpdatePostInput): Promise<ServiceResult<PostDto>> {
        const post = await this.postRepository.getById(updatePostInput.postId);
        if (post.id === 0) {
            return { success: false, message: 'Post not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const member = await this.communityRepository.getMember(updatePostInput.requesterId, post.communityId);
        const isAuthor = post.authorId === updatePostInput.requesterId;
        const isModerator = member.role === 'moderator';

        if (!isAuthor && !isModerator) {
            return { success: false, message: 'Not authorized to update this post', errorCode: ErrorCode.FORBIDDEN };
        }

        const updated = await this.postRepository.update(
            new Post(updatePostInput.postId, updatePostInput.title, updatePostInput.content, updatePostInput.mediaUrl, post.communityId, post.authorId)
        );

        if (updated.id === 0) {
            return { success: false, message: 'Update failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        const dto = await this.buildPostDto(updated);
        return { success: true, data: dto };
    }

    async deletePost(deletePostInput: PostInputs.DeletePostInput): Promise<ServiceResult<boolean>> {
        const post = await this.postRepository.getById(deletePostInput.postId);
        if (!post) {
            return { success: false, message: 'Post not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const member = await this.communityRepository.getMember(deletePostInput.requesterId, post.communityId);
        const isAuthor = post.authorId === deletePostInput.requesterId;
        const isModerator = member.role === 'moderator';

        if (!isAuthor && !isModerator) {
            return { success: false, message: 'Not authorized to delete this post', errorCode: ErrorCode.FORBIDDEN };
        }

        const result = await this.postRepository.delete(deletePostInput.postId);
        if (!result) {
            return { success: false, message: 'Delete failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        return { success: true, data: true };
    }

    async likePost(likePostInput: PostInputs.LikePostInput): Promise<ServiceResult<boolean>> {
        const post = await this.postRepository.getById(likePostInput.postId);
        if (!post) {
            return { success: false, message: 'Post not found', errorCode: ErrorCode.NOT_FOUND };
        }
        if (post.authorId === likePostInput.userId) {
            return { success: false, message: 'You cannot like your own post', errorCode: ErrorCode.UNAUTHORIZED };
        }
        const alreadyLiked = await this.postLikeRepository.hasLiked(likePostInput.userId, likePostInput.postId);
        if (alreadyLiked) {
            return { success: false, message: 'You have already liked this post', errorCode: ErrorCode.CONFLICT };
        }
        const result = await this.postLikeRepository.addLike(likePostInput.userId, likePostInput.postId);
        if (!result) {
            return { success: false, message: 'Failed to like post', errorCode: ErrorCode.INTERNAL_ERROR };
        }
        return { success: true, data: true };
    }

    async unlikePost(unlikePostInput: PostInputs.UnlikePostInput): Promise<ServiceResult<boolean>> {
        const hasLiked = await this.postLikeRepository.hasLiked(unlikePostInput.userId, unlikePostInput.postId);
        if (!hasLiked) {
            return { success: false, message: 'You have not liked this post', errorCode: ErrorCode.UNAUTHORIZED };
        }
        const result = await this.postLikeRepository.removeLike(unlikePostInput.userId, unlikePostInput.postId);
        if (!result) {
            return { success: false, message: 'Failed to unlike post', errorCode: ErrorCode.INTERNAL_ERROR };
        }
        return { success: true, data: true };
    }

    async addTag(addTagInput: PostInputs.AddTagInput): Promise<ServiceResult<boolean>> {
        const post = await this.postRepository.getById(addTagInput.postId);
        if (!post) {
            return { success: false, message: 'Post not found', errorCode: ErrorCode.NOT_FOUND };
        }
        if (post.authorId !== addTagInput.requesterId) {
            return { success: false, message: 'Only the author can add tags', errorCode: ErrorCode.FORBIDDEN };
        }
        const tag = await this.tagRepository.getById(addTagInput.tagId);
        if (!tag) {
            return { success: false, message: 'Tag not found', errorCode: ErrorCode.NOT_FOUND };
        }
        const result = await this.postTagRepository.addTag(addTagInput.postId, addTagInput.tagId);
        if (!result) {
            return { success: false, message: 'Failed to add tag', errorCode: ErrorCode.INTERNAL_ERROR };
        }
        return { success: true, data: true };
    }

    async removeTag(removeTagInput: PostInputs.RemoveTagInput): Promise<ServiceResult<boolean>> {
        const post = await this.postRepository.getById(removeTagInput.postId);
        if (!post) {
            return { success: false, message: 'Post not found', errorCode: ErrorCode.NOT_FOUND };
        }
        if (post.authorId !== removeTagInput.requesterId) {
            return { success: false, message: 'Only the author can remove tags', errorCode: ErrorCode.FORBIDDEN };
        }
        const result = await this.postTagRepository.removeTag(removeTagInput.postId, removeTagInput.tagId);
        if (!result) {
            return { success: false, message: 'Failed to remove tag', errorCode: ErrorCode.INTERNAL_ERROR };
        }
        return { success: true, data: true };
    }
}