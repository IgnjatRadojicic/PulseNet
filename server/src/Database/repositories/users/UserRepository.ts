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
        return this.excecuteReadOne(`SELECT ${USER_FIELDS} FROM users WHERE id = ?`, [id], mapUser);
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
}