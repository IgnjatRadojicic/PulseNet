import { Comment } from '../../../Domain/models/Comment';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getReadConnection, getWriteConnection } from '../../connection/DbConnectionPool';
import { ICommentRepository } from '../../../Domain/repositories/comments/ICommentRepository';

export class CommentRepository implements ICommentRepository {
    async create(comment: Comment): Promise<Comment> {
        try{
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return new Comment();

            const [result] = await conn.data.execute<ResultSetHeader>(
                'INSERT INTO comments (post_id, author_id, parent_id, content) VALUES (?, ?, ?, ?)',
                [comment.postId, comment.authorId, comment.parentId, comment.content]
            );
            if (result.insertId) {
                return new Comment(result.insertId, comment.postId, comment.authorId, comment.parentId, 0, [], false, comment.content, false, false, new Date(), new Date());
            }

            return new Comment();
        } catch {
            return new Comment();
        }
    }

    async getById(id: number): Promise<Comment> {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return new Comment();
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                'SELECT id, post_id, author_id, parent_id, content, is_deleted, is_flagged FROM comments WHERE id = ?',
                [id]
            );
            if (rows.length > 0) {
                const r = rows[0];
                return new Comment(r.id, r.post_id, r.author_id, r.parent_id, r.content, r.is_deleted, r.is_flagged);
            }
            return new Comment();
        } catch {
            return new Comment();
        }
    }

    async getByPost(postId: number): Promise<Comment[]> {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return [];
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                'SELECT id, post_id, author_id, parent_id, comment_likes, content, is_deleted, is_flagged FROM comments WHERE post_id = ?',
                [postId]
            );

            return rows.map(r => new Comment(
                r.id, r.post_id, r.author_id, r.parent_id, r.comment_likes, r.content, r.is_deleted, r.is_flagged));
        } catch {
            return [];
        }
    }

    async getByAuthor(authorId: number): Promise<Comment[]> {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return [];
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                'SELECT id, post_id, author_id, parent_id, comment_likes, content, is_deleted, is_flagged FROM comments WHERE author_id = ?',
                [authorId]
            );
            return rows.map(r => new Comment(
                r.id, r.post_id, r.author_id, r.parent_id, r.comment_likes, r.content, r.is_deleted, r.is_flagged));
        } catch {
            return [];
        }
    }

    async getReplies(parentId: number): Promise<Comment[]> {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return [];
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                'SELECT id, post_id, author_id, parent_id, comment_likes, content, is_deleted, is_flagged FROM comments WHERE parent_id = ?',
                [parentId]
            );

            return rows.map(r => new Comment(
                r.id, r.post_id, r.author_id, r.parent_id, r.comment_likes, r.content, r.is_deleted, r.is_flagged));
        } catch {
            return [];
        }
    }

    async update(comment: Comment): Promise<Comment> {
        try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return new Comment();
            const [result] = await conn.data.execute<ResultSetHeader>(
                'UPDATE comments SET content = ?, WHERE id = ?',
                [comment.content, comment.id]
            );
            if (result.affectedRows > 0) 
                return comment;
            return new Comment();
        } catch {
            return new Comment();
        }
    }

    async softDelete(id: number): Promise<boolean> {
        try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return false;
            const [result] = await conn.data.execute<ResultSetHeader>(
                'UPDATE comments SET is_deleted = ? WHERE id = ?',
                [true, id]
            );
            if (result.affectedRows > 0) 
                return true;
            return false;
        } catch {
            return false;
        }
    }

    async setFlag(id: number, isFlagged: boolean): Promise<boolean> {
        try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return false;
            const [result] = await conn.data.execute<ResultSetHeader>(
                'UPDATE comments SET is_flagged = ? WHERE id = ?',
                [isFlagged, id]
            );
            if (result.affectedRows > 0) 
                return true;
            return false;
        } catch {
            return false;
        }
    }

    async like(commentId: number, userId: number): Promise<boolean> {
        try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return false;

            const [result] = await conn.data.execute<ResultSetHeader>(
                'INSERT IGNORE INTO comment_likes (user_id, comment_id) VALUES (?, ?)',
                [userId, commentId]
            );

            return result.affectedRows > 0;
        } catch {
            return false;
        }
    }

    async unlike(commentId: number, userId: number): Promise<boolean> {
        try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return false;

            const [result] = await conn.data.execute<ResultSetHeader>(
                'DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?',
                [userId, commentId]
            );

            return result.affectedRows > 0;
        } catch {
            return false;
        }
    }

    async exists(id: number): Promise<boolean> {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return false;
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                'SELECT COUNT(*) as count FROM comments WHERE id = ?',
                [id]
            );
            return rows[0].count > 0;
        } catch {
            return false;
        }
    }

}