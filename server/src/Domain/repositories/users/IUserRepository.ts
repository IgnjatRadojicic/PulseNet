import { User } from '../../models/User';

export interface IUserRepository {
    create(user: User): Promise<User | null>;
    getById(id: number): Promise<User | null>;
    getByIds(ids: number[]): Promise<User[]>;
    getByUsername(username: string): Promise<User | null>;
    getByEmail(email: string): Promise<User | null>;
    getAll(): Promise<User[]>;
    update(user: User): Promise<User | null>;
    updateRole(id: number, role: string): Promise<boolean>;
    delete(id: number): Promise<boolean>;
    searchByUsername(query: string): Promise<User[]>;
}
