import { Community } from '../../models/Community';
import { RepositoryResult } from '../../types/RepositoryResult';

export interface ICommunityRepository {
    create(community: Community): Promise<RepositoryResult<Community>>;
    getById(id: number): Promise<RepositoryResult<Community>>;
    searchByName(query: string): Promise<Community[]>;
    getByIds(ids: number[]): Promise<Community[]>;
    getAll(): Promise<Community[]>;
    getPublic(): Promise<Community[]>;
    getByUserId(userId: number): Promise<Community[]>;
    update(community: Community): Promise<RepositoryResult<Community>>;
    delete(id: number): Promise<boolean>;
}
