import { BaseRepository } from '../BaseRepository';
import { IUserRepository } from '../../../Domain/repositories/users/IUserRepository';
import { User } from '../../../Domain/models/User';
import { RowDataPacket } from 'mysql2';
import { mapUser, USER_FIELDS, USER_FIELDS_PUBLIC } from '../../mappers/UserMapper';

export class UserRepository extends BaseRepository implements IUserRepository {

    async create(user: User) : Promise<User | null> {
        const result = await this.executeWrite(
            'INSERT INTO users (username, email, first_name, last_name, bio, profile_image, password_hash, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [user.username, user.email, user.firstName, user.lastName, user.bio, user.profileImage, user.passwordHash, user.role]
        );
        if (!result?.insertId) return null;
        return new User(result.insertId, user.username, user.email, user.firstName, user.lastName, user.bio, user.profileImage, user.role, user.passwordHash);
    }

    async getById(id: number): Promise<User | null> {
        return this.executeReadOne(`SELECT ${USER_FIELDS} FROM users WHERE id = ?`, [id], mapUser);
    }

    async getByIds(ids: number[]): Promise<User[]> {
        if (ids.length === 0) return [];
        const placeholders = this.buildPlaceholders(ids);
        return this.executeRead(
          `SELECT ${USER_FIELDS_PUBLIC} FROM users where id IN {${placeholders})`,
          ids,
          mapUser
        );
    }

    async getByUsername(username: string): Promise<User | null> {
        return this.executeReadOne(
            `SELECT ${USER_FIELDS} FROM users WHERE username = ?`,
            [username],
            mapUser
        );
    }

    async getByEmail(email: string): Promise<User | null> {
        return this.executeReadOne(
            `SELECT ${USER_FIELDS} FROM users WHERE email = ?`,
            [email],
            mapUser
        );
    }

    async getAll(): Promise<User[]> {
        return this.executeRead(
            `SELECT ${USER_FIELDS_PUBLIC} FROM users ORDER BY id ASC`,
            [],
            mapUser
        );
    }

    async update(user: User): Promise<User | null> {
        const result = await this.executeWrite(
            'UPDATE users SET username = ?, email = ?, first_name = ?, last_name = ?, bio = ?, profile_image = ? WHERE id = ?',
            [user.username, user.email, user.firstName, user.lastName, user.bio, user.profileImage, user.id]
        );
        if (!result || result.affectedRows === 0) return null;
        return user;
    }

    async updateRole(id: number, role: string): Promise<boolean> {
        const result = await this.executeWrite(
            'UPDATE users SET role = ? WHERE id = ?',
            [role, id]
        );
        return (result?.affectedRows ?? 0) > 0;
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.executeWrite(
            'DELETE FROM users WHERE id = ?',
            [id]
        );
        return (result?.affectedRows ?? 0) > 0;
    }

    async searchByUsername(query: string): Promise<User[]> {
        return this.executeRead(
            `SELECT ${USER_FIELDS_PUBLIC} FROM users WHERE username LIKE ? LIMIT 20`,
            [`%${query}%`],
            mapUser
        );
    }    
}