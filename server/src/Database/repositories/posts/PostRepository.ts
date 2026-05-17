import { BaseRepository } from '../BaseRepository';
import { IPostRepository } from '../../../Domain/repositories/post_repository/IPostRepository';
import { Post } from '../../../Domain/models/Post';
import { mapPost, SELECT_FIELDS } from '../../mappers/PostMapper';
import { RowDataPacket } from 'mysql2';

export class PostRepository extends BaseRepository implements IPostRepository {

    async create(post: Post): Promise<Post | null> {
        const result = await this.executeWrite(
            'INSERT INTO posts (title, content, media_url, community_id, author_id) VALUES (?, ?, ?, ?, ?)',
            [post.title, post.content, post.mediaUrl, post.communityId, post.authorId]
        );
        if (!result?.insertId) return null;
        return new Post(result.insertId, post.title, post.content, post.mediaUrl, post.communityId, post.authorId);
    }

    async getById(id: number): Promise<Post | null> {
        return this.executeReadOne(
            `SELECT ${SELECT_FIELDS} FROM posts WHERE id = ?`,
            [id],
            mapPost
        );
    }

    async getByIds(ids: number[]): Promise<Post[]> {
        if (ids.length === 0) return [];
        const placeholders = this.buildPlaceholders(ids);
        return this.executeRead(
            `SELECT ${SELECT_FIELDS} FROM posts WHERE id IN (${placeholders})`,
            ids,
            mapPost
        );
    }

    async getByCommunityId(communityId: number): Promise<Post[]> {
        return this.executeRead(
            `SELECT ${SELECT_FIELDS} FROM posts WHERE community_id = ? ORDER BY created_at DESC`,
            [communityId],
            mapPost
        );
    }

    async getByAuthorId(authorId: number): Promise<Post[]> {
        return this.executeRead(
            `SELECT ${SELECT_FIELDS} FROM posts WHERE author_id = ? ORDER BY created_at DESC`,
            [authorId],
            mapPost
        );
    }

    async getCommunityPostIds(communityIds: number[]): Promise<number[]> {
        if (communityIds.length === 0) return [];
        const placeholders = this.buildPlaceholders(communityIds);
        return this.executeRead(
            `SELECT id FROM posts WHERE community_id IN (${placeholders})`,
            communityIds,
            (r: RowDataPacket) => r.id as number
        );
    }

    async getFollowedAuthorPostIds(authorIds: number[]): Promise<number[]> {
        if (authorIds.length === 0) return [];
        const placeholders = this.buildPlaceholders(authorIds);
        return this.executeRead(
            `SELECT id FROM posts WHERE author_id IN (${placeholders})`,
            authorIds,
            (r: RowDataPacket) => r.id as number
        );
    }

    async getPublicPosts(limit: number): Promise<Post[]> {
        return this.executeRead(
            `SELECT ${SELECT_FIELDS} FROM posts WHERE community_id IN (SELECT id FROM communities WHERE type = 'public') ORDER BY created_at DESC LIMIT ?`,
            [limit],
            mapPost
        );
    }

    async update(post: Post): Promise<Post | null> {
        const result = await this.executeWrite(
            'UPDATE posts SET title = ?, content = ?, media_url = ? WHERE id = ?',
            [post.title, post.content, post.mediaUrl, post.id]
        );
        if (!result || result.affectedRows === 0) return null;
        return post;
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.executeWrite(
            'DELETE FROM posts WHERE id = ?',
            [id]
        );
        return (result?.affectedRows ?? 0) > 0;
    }
}