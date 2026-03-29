import { IUserRepository } from '../../../Domain/repositories/users/IUserRepository';
import { User } from '../../../Domain/models/User';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getReadConnection, getWriteConnection } from '../../connection/DbConnectionPool';

export class UserRepository implements IUserRepository {
    async create(user: User): Promise<User> {
        try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return new User();
            const [result] = await conn.data.execute<ResultSetHeader>(
                'INSERT INTO users (username, email, first_name, last_name, bio, profile_image, password_hash, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [user.username, user.email, user.firstName, user.lastName, user.bio, user.profileImage, user.passwordHash, user.role]
            );
            if (result.insertId) {
                return new User(result.insertId, user.username, user.email, user.firstName, user.lastName, user.bio, user.profileImage, user.role, user.passwordHash);
            }
            return new User();
        } catch {
            return new User();
        }
    }

    async getById(id: number): Promise<User> {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return new User();
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                'SELECT id, username, email, first_name, last_name, bio, profile_image, role, password_hash FROM users WHERE id = ?',
                [id]
            );
            if (rows.length > 0) {
                const r = rows[0];
                return new User(r.id, r.username, r.email, r.first_name, r.last_name, r.bio, r.profile_image, r.role, r.password_hash);
            }
            return new User();
        } catch {
            return new User();
        }
    }

    async getByUsername(username: string): Promise<User> {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return new User();
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                'SELECT id, username, email, first_name, last_name, bio, profile_image, role, password_hash FROM users WHERE username = ?',
                [username]
            );
            if (rows.length > 0) {
                const r = rows[0];
                return new User(r.id, r.username, r.email, r.first_name, r.last_name, r.bio, r.profile_image, r.role, r.password_hash);
            }
            return new User();
        } catch {
            return new User();
        }
    }

    async getByEmail(email: string): Promise<User> {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return new User();
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                'SELECT id, username, email, first_name, last_name, bio, profile_image, role, password_hash FROM users WHERE email = ?',
                [email]
            );
            if (rows.length > 0) {
                const r = rows[0];
                return new User(r.id, r.username, r.email, r.first_name, r.last_name, r.bio, r.profile_image, r.role, r.password_hash);
            }
            return new User();
        } catch {
            return new User();
        }
    }

    async getAll(): Promise<User[]> {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return [];
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                'SELECT id, username, email, first_name, last_name, bio, profile_image, role FROM users ORDER BY id ASC'
            );
            return rows.map(r => new User(r.id, r.username, r.email, r.first_name, r.last_name, r.bio, r.profile_image, r.role));
        } catch {
            return [];
        }
    }

    async update(user: User): Promise<User> {
        try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return new User();
            const [result] = await conn.data.execute<ResultSetHeader>(
                'UPDATE users SET username = ?, email = ?, first_name = ?, last_name = ?, bio = ?, profile_image = ? WHERE id = ?',
                [user.username, user.email, user.firstName, user.lastName, user.bio, user.profileImage, user.id]
            );
            if (result.affectedRows > 0) return user;
            return new User();
        } catch {
            return new User();
        }
    }

    async updateRole(id: number, role: string): Promise<boolean> {
        try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return false;
            const [result] = await conn.data.execute<ResultSetHeader>(
                'UPDATE users SET role = ? WHERE id = ?',
                [role, id]
            );
            return result.affectedRows > 0;
        } catch {
            return false;
        }
    }

    async delete(id: number): Promise<boolean> {
        try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return false;
            const [result] = await conn.data.execute<ResultSetHeader>(
                'DELETE FROM users WHERE id = ?',
                [id]
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
                'SELECT COUNT(*) as count FROM users WHERE id = ?',
                [id]
            );
            return rows[0].count > 0;
        } catch {
            return false;
        }
    }

    async searchByUsername(query: string): Promise<User[]> {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return [];
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                'SELECT id, username, email, first_name, last_name, bio, profile_image, role FROM users WHERE username LIKE ? LIMIT 20',
                [`%${query}%`]
            );
            return rows.map(r => new User(r.id, r.username, r.email, r.first_name, r.last_name, r.bio, r.profile_image, r.role));
        } catch {
            return [];
        }
    }

    async follow(followerId: number, followingId: number): Promise<boolean> {
        try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return false;
            await conn.data.execute<ResultSetHeader>(
                'INSERT IGNORE INTO user_follows (follower_id, following_id) VALUES (?, ?)',
                [followerId, followingId]
            );
            return true;
        } catch {
            return false;
        }
    }

    async unfollow(followerId: number, followingId: number): Promise<boolean> {
        try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return false;
            const [result] = await conn.data.execute<ResultSetHeader>(
                'DELETE FROM user_follows WHERE follower_id = ? AND following_id = ?',
                [followerId, followingId]
            );
            return result.affectedRows > 0;
        } catch {
            return false;
        }
    }

    async getFollowers(id: number): Promise<User[]> {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return [];
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                `SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.bio, u.profile_image, u.role
                 FROM users u
                 INNER JOIN user_follows uf ON uf.follower_id = u.id
                 WHERE uf.following_id = ?`,
                [id]
            );
            return rows.map(r => new User(r.id, r.username, r.email, r.first_name, r.last_name, r.bio, r.profile_image, r.role));
        } catch {
            return [];
        }
    }

    async getFollowing(id: number): Promise<User[]> {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return [];
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                `SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.bio, u.profile_image, u.role
                 FROM users u
                 INNER JOIN user_follows uf ON uf.following_id = u.id
                 WHERE uf.follower_id = ?`,
                [id]
            );
            return rows.map(r => new User(r.id, r.username, r.email, r.first_name, r.last_name, r.bio, r.profile_image, r.role));
        } catch {
            return [];
        }
    }
}