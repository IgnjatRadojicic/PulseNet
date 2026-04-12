import { IPostRepository } from '../../../Domain/repositories/posts/IPostRepository';
import { Post } from '../../../Domain/models/Post';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getReadConnection, getWriteConnection } from '../../connection/db';

export class PostRepository implements IPostRepository {

    private mapRow(r: RowDataPacket): Post {
        return new Post(
            r.id, r.title, r.content, r.media_url,
            r.community_id, r.author_id,
            r.created_at, r.updated_at
        );
    }

    async create(post: Post): Promise<Post> {
        try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return new Post();
            const [result] = await conn.data.execute<ResultSetHeader>(
                'INSERT INTO posts (title, content, media_url, community_id, author_id) VALUES (?, ?, ?, ?, ?)',
                [post.title, post.content, post.mediaUrl, post.communityId, post.authorId]
            );
            if (result.insertId) {
                return new Post(result.insertId, post.title, post.content, post.mediaUrl, post.communityId, post.authorId);
            }
            return new Post();
        } catch {
            return new Post();
        }
    }

    async getById(id: number): Promise<Post> {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return new Post();
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                'SELECT id, title, content, media_url, community_id, author_id, created_at, updated_at FROM posts WHERE id = ?',
                [id]
            );
            return rows.length > 0 ? this.mapRow(rows[0]) : new Post();
        } catch {
            return new Post();
        }
    }

    async getByCommunityId(communityId: number): Promise<Post[]> {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return [];
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                'SELECT id, title, content, media_url, community_id, author_id, created_at, updated_at FROM posts WHERE community_id = ? ORDER BY created_at DESC',
                [communityId]
            );
            return rows.map(r => this.mapRow(r));
        } catch {
            return [];
        }
    }

    async getByAuthorId(authorId: number): Promise<Post[]> {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return [];
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                'SELECT id, title, content, media_url, community_id, author_id, created_at, updated_at FROM posts WHERE author_id = ? ORDER BY created_at DESC',
                [authorId]
            );
            return rows.map(r => this.mapRow(r));
        } catch {
            return [];
        }
    }
	
	async getCommunityPostIds(communityIds: number[]): Promise<number[]> {
	   try {
		   if (communityIds.length === 0) return [];
		   const conn = getReadConnection();
		   if (!conn.success || !conn.data) return [];
		   const placeholders = communityIds.map(() => '?').join(',');
		   const [rows] = await conn.data.execute<RowDataPacket[]>(
                `SELECT id FROM posts WHERE community_id IN (${placeholders})`,
                communityIds
		   );
			return rows.map(r => r.id as number);
	   } catch {
		   return [];
	   }
	}
    async getFollowedAuthorPostIds(authorIds: number[]): Promise<number[]> {
        try{
            if (authorIds.length === 0) return [];
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return [];
            const placeholders = authorIds.map(() => '?').join(',');
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                `SELECT id FROM posts WHERE author_id IN (${placeholders})`,
                authorIds
            );
            return rows.map(r =>r.id as number);
        } catch {
            return [];
        }
    }

    async getByIds(ids: number[]): Promise<Post[]> {
        try{
            if(ids.length === 0) return [];
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return [];
            const placeholders = ids.map(() => '?').join(',');
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                `SELECT id, title, content, media_url, community_id, author_id, created_at, updated_at FROM posts WHERE id IN (${placeholders})`,
                ids
            );
            return rows.map(r => this.mapRow(r));
        } catch {
            return [];
      }
    }

    async update(post: Post): Promise<Post> {
        try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return new Post();
            const [result] = await conn.data.execute<ResultSetHeader>(
                'UPDATE posts SET title = ?, content = ?, media_url = ? WHERE id = ?',
                [post.title, post.content, post.mediaUrl, post.id]
            );
            if (result.affectedRows > 0) return post;
            return new Post();
        }catch {
            return new Post();
        }
    }

    async delete(id: number): Promise<boolean> {
        try {
            const conn = getWriteConnection();
            if(!conn.success || !conn.data) return false;
            const [result] = await conn.data.execute<ResultSetHeader>(
                'DELETE FROM posts WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch {
            return false;
        }
    }

    async getLikeCount(postId: number): Promise<number> {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return 0;
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                'SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?',
                [postId]
            );
            return Number(rows[0].count);
        } catch {
            return 0;
        }
    }

    async getCommentCount(postId: number): Promise<number> {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return 0;
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                'SELECT COUNT(*) as count FROM comments WHERE post_id = ? AND is_deleted = 0',
                [postId]
            );
            return Number(rows[0].count);
        } catch {
            return 0;
        }
    }

    async hasLiked(userId: number, postId: number): Promise<boolean> {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return false;
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                'SELECT COUNT(*) as count FROM post_likes WHERE user_id = ? AND post_id = ?',
					[userId, postId]
            );
            return Number(rows[0].count) > 0;
        } catch {
            return false;
        }
    }

    async addLike(userId: number, postId: number): Promise<boolean> {
        try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return false;
            await conn.data.execute<ResultSetHeader>(
                'INSERT IGNORE INTO post_likes (user_id, post_id) VALUES (?, ?)',
                [userId, postId]
				);
            return true;
        } catch {
            return false;
        }
    }

    async removeLike(userId: number, postId: number): Promise<boolean> {
        try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return false;
            const [result] = await conn.data.execute<ResultSetHeader>(
                'DELETE FROM post_likes WHERE user_id = ? AND post_id = ?',
                [userId, postId]
            );
            return result.affectedRows > 0;
        } catch {
            return false;
        }
    }

    async addTag(postId: number, tagId: number): Promise<boolean> {
        try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return false;
            await conn.data.execute<ResultSetHeader>(
                'INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)',
                [postId, tagId]
            );
            return true;
        } catch {
            return false;
        }
    }

    async removeTag(postId: number, tagId: number): Promise<boolean> {
        try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return false;
            const [result] = await conn.data.execute<ResultSetHeader>(
                'DELETE FROM post_tags WHERE post_id = ? AND tag_id = ?',
                [postId, tagId]
            );
            return result.affectedRows > 0;
        } catch {
            return false;
        }
    }

    async getTagIds(postId: number): Promise<number[]> {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return [];
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                'SELECT tag_id FROM post_tags WHERE post_id = ?',
                [postId]
            );
            return rows.map(r => r.tag_id as number);
        } catch {
            return [];
        }
    }
}	
}