import { IPostRepository } from '../../../Domain/repositories/posts/IPostRepository';
import { Post } from '../../../Domain/models/Post';
import { RowDataPacket } from 'mysql2';
import { BaseRepository } from '../BaseRepository';
import { mapPost } from '../../mappers/PostMapper';

export class PostRepository extends BaseRepository implements IPostRepository {

    async create(post: Post): Promise<Post | null> {
        const result = await this.executeWrite(
            'INSERT INTO posts (title, content, media_url, community_id, author_id) VALUES (?, ?, ?, ?, ?)',
            [post.title, post.content, post.mediaUrl, post.communityId, post.authorId]
        );
        if (result?.insertId) {
            return new Post(result.insertId, post.title, post.content, post.mediaUrl, post.communityId, post.authorId);
        }
        return null;
    }

    async getById(id: number): Promise<Post | null> {
        const result = await this.executeReadOne(
            'SELECT id, title, content, media_url, community_id, author_id, created_at, updated_at FROM posts WHERE id = ?',
            [id],
            (r: RowDataPacket) => mapPost(r)
        );
        return result ?? null;    
    }

    async getByIds(ids: number[]): Promise<Post[]> {
        if (ids.length === 0) return [];
        const placeholders = ids.map(() => '?').join(',');
        const result = await this.executeRead(
            `SELECT id, title, content, media_url, community_id, author_id, created_at, updated_at FROM posts WHERE id IN (${placeholders})`,
            ids,
            (r: RowDataPacket) => mapPost(r)
        );
        return result;
    }

    async getByAuthorId(authorId: number): Promise<Post[]> {
        const result = await this.executeRead(
            'SELECT id, title, content, media_url, community_id, author_id, created_at, updated_at FROM posts WHERE author_id = ? ORDER BY created_at DESC',
            [authorId],
            (r: RowDataPacket) => mapPost(r)
        );
        return result;
    }

    async getByCommunityId(communityId: number): Promise<Post[]> {
        const result = await this.executeRead(
            'SELECT id, title, content, media_url, community_id, author_id, created_at, updated_at FROM posts WHERE community_id = ? ORDER BY created_at DESC',
            [communityId],
            (r: RowDataPacket) => mapPost(r)
        );
        return result;
    }
	
	async getCommunityPostIds(communityIds: number[]): Promise<number[]> {
        if (communityIds.length === 0) return [];
        const placeholders = communityIds.map(() => '?').join(',');
        const result = await this.executeRead(
                `SELECT id FROM posts WHERE community_id IN (${placeholders})`,
                communityIds,
                (r: RowDataPacket) => r.id as number
            );
        return result;
	}

    async getFollowedAuthorPostIds(authorIds: number[]): Promise<number[]> {
        if (authorIds.length === 0) return [];
        const placeholders = authorIds.map(() => '?').join(',');
        const result = await this.executeRead(
            `SELECT id FROM posts WHERE author_id IN (${placeholders})`,
            authorIds,
            (r: RowDataPacket) => r.id as number
        );
        return result;
    }

    async update(post: Post): Promise<Post | null> {
        const result = await this.executeWrite(
            'UPDATE posts SET title = ?, content = ?, media_url = ? WHERE id = ?',
            [post.title, post.content, post.mediaUrl, post.id]
        );
        if (result?.affectedRows && result.affectedRows > 0) {
            return post;
        }
        return null;
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.executeWrite(
            'DELETE FROM posts WHERE id = ?',
            [id]
        );
        return (result?.affectedRows ?? 0) > 0;
    }

}	
