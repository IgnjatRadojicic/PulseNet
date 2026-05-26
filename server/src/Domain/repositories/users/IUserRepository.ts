import { User } from '../../models/User';
import { RepositoryResult } from '../../types/RepositoryResult';

export interface IUserRepository {
    create(user: User): Promise<RepositoryResult<User>>;
    getById(id: number): Promise<RepositoryResult<User>>;
    getByIds(ids: number[]): Promise<User[]>;
    getByUsername(username: string): Promise<RepositoryResult<User>>;
    getByEmail(email: string): Promise<RepositoryResult<User>>;
    getAll(): Promise<User[]>;
    update(user: User): Promise<RepositoryResult<User>>;
    updateRole(id: number, role: string): Promise<boolean>;
    delete(id: number): Promise<boolean>;
    searchByUsername(query: string): Promise<User[]>;
}
