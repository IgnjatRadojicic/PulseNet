import { IPostRepository } from '../../../Domain/repositories/posts/IPostRepository';
import { Post } from '../../../Domain/models/Post';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getReadConnection, getWriteConnection } from '../../connection/db';
import { mapPost } from '../../mappers/PostMapper';
import { BaseRepository } from '../BaseRepository';

export class PostRepository extends BaseRepository implements IPostRepository {

    private mapRow(r: RowDataPacket): Post {
        return new Post(
            r.id, r.title, r.content, r.media_url,
            r.community_id, r.author_id,
            r.created_at, r.updated_at
        );
    }

    async create(post: Post): Promise<Post> {
        const result = await this.executeWrite(
            'INSERT INTO posts (title, content, media_url, community_id, author_id) VALUES (?, ?, ?, ?, ?)',
            [post.title, post.content, post.mediaUrl, post.communityId, post.authorId]
        );
        if (result?.insertId) {
            return new Post(result.insertId, post.title, post.content, post.mediaUrl, post.communityId, post.authorId);
        }
        return new Post();
    }

    async getById(id: number): Promise<Post> {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return new Post();
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                'SELECT id, title, content, media_url, community_id, author_id, created_at, updated_at FROM posts WHERE id = ?',
                [id]
            );
            return rows.length > 0 ? mapPost(rows[0]) : new Post();
        } catch {
            return new Post();
        }
    }

    async getByIds(ids: number[]): Promise<Post[]> {
        if (ids.length === 0) return [];
        const placeholders = ids.map(() => '?').join(',');
        const result = await this.executeRead(
            `SELECT id, title, content, media_url, community_id, author_id, created_at, updated_at FROM posts WHERE id IN (${placeholders})`,
            ids,
            (r: RowDataPacket) => this.mapRow(r)
        );
        return result;
    }

    async getByAuthorId(authorId: number): Promise<Post[]> {
        const result = await this.executeRead(
            'SELECT id, title, content, media_url, community_id, author_id, created_at, updated_at FROM posts WHERE author_id = ? ORDER BY created_at DESC',
            [authorId],
            (r: RowDataPacket) => this.mapRow(r)
        );
        return result;
    }

    async getByCommunityId(communityId: number): Promise<Post[]> {
        const result = await this.executeRead(
            'SELECT id, title, content, media_url, community_id, author_id, created_at, updated_at FROM posts WHERE community_id = ? ORDER BY created_at DESC',
            [communityId],
            (r: RowDataPacket) => this.mapRow(r)
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

    async update(post: Post): Promise<Post> {
        const result = await this.executeWrite(
            'UPDATE posts SET title = ?, content = ?, media_url = ? WHERE id = ?',
            [post.title, post.content, post.mediaUrl, post.id]
        );
        if (result?.affectedRows && result.affectedRows > 0) {
            return post;
        }
        return new Post();
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.executeWrite(
            'DELETE FROM posts WHERE id = ?',
            [id]
        );
        return (result?.affectedRows ?? 0) > 0;
    }


    async getCommentCount(postId: number): Promise<number> {
        const result = await this.executeScalar<number>(
            'SELECT COUNT(*) as count FROM comments WHERE post_id = ? AND is_deleted = 0',
            [postId]
        );
        return result ?? 0;
    }

}	
